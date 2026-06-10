import { pool } from '../config/db.js';

// CREATE REQUEST
export const createCampRequest = async ({
  source_camp_id,
  target_camp_id,
  type,
}) => {
  if (!source_camp_id || !target_camp_id || !type) {
    throw new Error('Missing required fields');
  }

  if (source_camp_id === target_camp_id) {
    throw new Error('Cannot send request to same camp');
  }

  const [result] = await pool.query(
    `INSERT INTO camp_request 
     (source_camp_id, target_camp_id, type, status, request_date)
     VALUES (?, ?, ?, 'pending', CURDATE())`,
    [source_camp_id, target_camp_id, type],
  );

  return { request_id: result.insertId };
};

// ADD RESOURCE
export const addResourceToRequest = async ({
  request_id,
  resource_id,
  quantity,
}) => {
  if (!request_id || !resource_id || quantity === undefined) {
    throw new Error('Missing required fields');
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  await pool.query(
    `INSERT INTO request_resource (request_id, resource_id, quantity)
     VALUES (?, ?, ?)`,
    [request_id, resource_id, quantity],
  );

  return { message: 'Resource added to request' };
};

// ADD PERSON
export const addPersonToRequest = async ({
  request_id,
  profession_id,
  quantity,
}) => {
  if (!request_id || !profession_id || quantity === undefined) {
    throw new Error('Missing required fields');
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  await pool.query(
    `INSERT INTO request_person (request_id, profession_id, quantity)
     VALUES (?, ?, ?)`,
    [request_id, profession_id, quantity],
  );

  return { message: 'Person request added' };
};

// APPROVE REQUEST
export const approveCampRequest = async (request_id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. GET REQUEST
    const [rows] = await connection.query(
      'SELECT * FROM camp_request WHERE request_id = ?',
      [request_id],
    );

    const request = rows[0];

    if (!request) throw new Error('Request not found');

    if (request.status === 'approved') {
      throw new Error('Request already approved');
    }

    if (request.status === 'rejected') {
      throw new Error('Request already rejected');
    }

    const { source_camp_id, target_camp_id, source_approved, target_approved } =
      request;

    if (!source_approved) {
      await connection.query(
        `
    UPDATE camp_request
    SET source_approved = TRUE
    WHERE request_id = ?
    `,
        [request_id],
      );

      await connection.commit();

      return {
        message: 'Source camp approved. Waiting for target camp approval.',
      };
    }

    if (!target_approved) {
      await connection.query(
        `
    UPDATE camp_request
    SET target_approved = TRUE
    WHERE request_id = ?
    `,
        [request_id],
      );
    }

    // 2. VALIDATE CAMPS
    const [sourceCamp] = await connection.query(
      'SELECT status FROM camp WHERE camp_id = ?',
      [source_camp_id],
    );

    const [targetCamp] = await connection.query(
      'SELECT status FROM camp WHERE camp_id = ?',
      [target_camp_id],
    );

    if (!sourceCamp.length || sourceCamp[0].status !== 'active') {
      throw new Error('Source camp is not active');
    }

    if (!targetCamp.length || targetCamp[0].status !== 'active') {
      throw new Error('Target camp is not active');
    }

    // 3. GET CONTENT
    const [resources] = await connection.query(
      'SELECT * FROM request_resource WHERE request_id = ?',
      [request_id],
    );

    const [persons] = await connection.query(
      'SELECT * FROM request_person WHERE request_id = ?',
      [request_id],
    );

    // 4. VALIDATE CONTENT
    if (resources.length === 0 && persons.length === 0) {
      throw new Error('Request has no content');
    }

    // 5. VALIDATE RESOURCES
    for (const r of resources) {
      const [inventoryRows] = await connection.query(
        `SELECT quantity FROM inventory 
         WHERE camp_id = ? AND resource_id = ?`,
        [source_camp_id, r.resource_id],
      );

      const availableQty = Number(inventoryRows[0]?.quantity);
      const requestedQty = Number(r.quantity);

      if (!inventoryRows.length || availableQty < requestedQty) {
        throw new Error(`Not enough resource ${r.resource_id}`);
      }
    }

    // 6. VALIDATE PERSONS
    for (const p of persons) {
      const [available] = await connection.query(
        `SELECT * FROM person 
         WHERE camp_id = ? 
         AND status = 'active'
         AND profession_id = ?
         LIMIT ?`,
        [source_camp_id, p.profession_id, p.quantity],
      );

      if (available.length < p.quantity) {
        throw new Error(`Not enough people for profession ${p.profession_id}`);
      }
    }

    // 7. EXECUTE RESOURCES
    for (const r of resources) {
      await connection.query(
        `UPDATE inventory 
         SET quantity = quantity - ?
         WHERE camp_id = ? AND resource_id = ? AND quantity >= ?`,
        [r.quantity, source_camp_id, r.resource_id, r.quantity],
      );

      await connection.query(
        `INSERT INTO inventory (camp_id, resource_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [target_camp_id, r.resource_id, r.quantity, r.quantity],
      );

      await connection.query(
        `INSERT INTO resource_movement 
         (resource_id, source_camp_id, target_camp_id, quantity, movement_date)
         VALUES (?, ?, ?, ?, CURDATE())`,
        [r.resource_id, source_camp_id, target_camp_id, r.quantity],
      );
    }

    // 8. EXECUTE PERSONS
    for (const p of persons) {
      const [available] = await connection.query(
        `SELECT * FROM person 
         WHERE camp_id = ? 
         AND status = 'active'
         AND profession_id = ?
         LIMIT ?`,
        [source_camp_id, p.profession_id, p.quantity],
      );

      for (const person of available) {
        await connection.query(
          `UPDATE person SET camp_id = ? WHERE person_id = ?`,
          [target_camp_id, person.person_id],
        );

        await connection.query(
          `INSERT INTO person_movement 
           (person_id, source_camp_id, target_camp_id, movement_date)
           VALUES (?, ?, ?, CURDATE())`,
          [person.person_id, source_camp_id, target_camp_id],
        );
      }
    }

    // 9. UPDATE STATUS
    await connection.query(
      `UPDATE camp_request SET status = 'approved' WHERE request_id = ?`,
      [request_id],
    );

    await connection.commit();

    return { message: 'Camp request approved successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// REJECT REQUEST
export const rejectCampRequest = async (request_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM camp_request WHERE request_id = ?',
    [request_id],
  );

  const request = rows[0];

  if (!request) throw new Error('Request not found');
  if (request.status !== 'pending')
    throw new Error('Request already processed');

  await pool.query(
    `UPDATE camp_request SET status = 'rejected' WHERE request_id = ?`,
    [request_id],
  );

  return { message: 'Camp request rejected' };
};

// GET ALL REQUESTS
export const getCampRequests = async (camp_id) => {
  if (camp_id) {
    const [rows] = await pool.query(`
      SELECT cr.*, 
          c1.name AS source_camp,
          c2.name AS target_camp
      FROM camp_request cr
      JOIN camp c1 ON cr.source_camp_id = c1.camp_id
      JOIN camp c2 ON cr.target_camp_id = c2.camp_id
      WHERE cr.source_camp_id = ? OR cr.target_camp_id = ?
    `, [camp_id, camp_id]);
    return rows;
  }
  const [rows] = await pool.query(`
    SELECT cr.*, 
        c1.name AS source_camp,
        c2.name AS target_camp
    FROM camp_request cr
    JOIN camp c1 ON cr.source_camp_id = c1.camp_id
    JOIN camp c2 ON cr.target_camp_id = c2.camp_id
  `);
  return rows;
};