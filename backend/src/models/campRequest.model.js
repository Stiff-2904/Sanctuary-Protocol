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

    const [rows] = await connection.query(
      'SELECT * FROM camp_request WHERE request_id = ?',
      [request_id],
    );

    const request = rows[0];

    if (!request) throw new Error('Request not found');
    if (request.status !== 'pending')
      throw new Error('Request already processed');

    const { source_camp_id, target_camp_id } = request;

    // VALIDATE PERSONS
    const [persons] = await connection.query(
      'SELECT * FROM request_person WHERE request_id = ?',
      [request_id],
    );

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

    // MOVE PEOPLE
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
  await pool.query(
    `UPDATE camp_request SET status = 'rejected' WHERE request_id = ?`,
    [request_id],
  );

  return { message: 'Camp request rejected' };
};
