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
  if (!request_id || !resource_id || !quantity) {
    throw new Error('Missing required fields');
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
  if (!request_id || !profession_id || !quantity) {
    throw new Error('Missing required fields');
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
    if (request.status !== 'pending')
      throw new Error('Request already processed');

    const { source_camp_id, target_camp_id } = request;

    // 2. VALIDATE CAMPS
    const [sourceCamp] = await connection.query(
      'SELECT status FROM camp WHERE camp_id = ?',
      [source_camp_id],
    );

    const [targetCamp] = await connection.query(
      'SELECT status FROM camp WHERE camp_id = ?',
      [target_camp_id],
    );

    if (!sourceCamp.length || sourceCamp[0].status !== 'Active') {
      throw new Error('Source camp is not active');
    }

    if (!targetCamp.length || targetCamp[0].status !== 'Active') {
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

    // 5. VALIDATE RESOURCES 🔥
    for (const r of resources) {
      const [inventoryRows] = await connection.query(
        `SELECT quantity FROM inventory 
         WHERE camp_id = ? AND resource_id = ?`,
        [source_camp_id, r.resource_id],
      );

      if (!inventoryRows.length || inventoryRows[0].quantity < r.quantity) {
        throw new Error(`Not enough resource ${r.resource_id}`);
      }
    }

    // 6. VALIDATE PERSONS 🔥
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

    // 7. EXECUTE RESOURCES 🔥
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

    // 8. EXECUTE PERSONS 🔥
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
