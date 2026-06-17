import { pool } from '../config/db.js';

export const createAdmission = async ({ person_id, camp_id, skills }) => {
  const [existing] = await pool.query(
    `SELECT * FROM admission_request 
     WHERE person_id = ? AND status = 'pending'`,
    [person_id],
  );

  if (existing.length > 0) {
    throw new Error('Person already has a pending admission');
  }

  const [result] = await pool.query(
    `INSERT INTO admission_request 
     (person_id, camp_id, request_date, status, skills)
     VALUES (?, ?, CURDATE(), 'pending', ?)`,
    [person_id, camp_id, skills],
  );

  return { request_id: result.insertId };
};

export const getAdmissions = async () => {
  // This function can be used to get all admission requests, or you can modify it to get requests by camp_id or person_id
  const [rows] = await pool.query('SELECT * FROM admission_request');
  return rows;
};

export const approveAdmission = async (request_id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get request
    const [rows] = await connection.query(
      'SELECT * FROM admission_request WHERE request_id = ?',
      [request_id],
    );

    const request = rows[0];

    if (!request) {
      throw new Error('Admission request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Admission already processed');
    }

    // 2. Get person
    const [personRows] = await connection.query(
      'SELECT * FROM person WHERE person_id = ?',
      [request.person_id],
    );

    const person = personRows[0];

    if (!person) {
      throw new Error('Person not found');
    }

    if (person.camp_id !== null) {
      throw new Error('Person already belongs to a camp');
    }

    // 3. Approve request
    await connection.query(
      'UPDATE admission_request SET status = "approved" WHERE request_id = ?',
      [request_id],
    );

    // 4. Assign camp
    await connection.query(
      `UPDATE person 
       SET camp_id = ?, status = "active"
       WHERE person_id = ?`,
      [request.camp_id, request.person_id],
    );

    await connection.commit();

    return { message: 'Admission approved successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const rejectAdmission = async (request_id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT * FROM admission_request WHERE request_id = ?',
      [request_id],
    );

    const request = rows[0];

    if (!request) {
      throw new Error('Admission request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Admission already processed');
    }

    await connection.query(
      'UPDATE admission_request SET status = "rejected" WHERE request_id = ?',
      [request_id],
    );

    await connection.query(
      `UPDATE person 
       SET status = "rejected", camp_id = NULL
       WHERE person_id = ?`,
      [request.person_id],
    );

    await connection.commit();

    return { message: 'Admission rejected successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
