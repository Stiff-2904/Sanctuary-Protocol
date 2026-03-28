import { pool } from '../config/db.js';

export const createAdmission = async ({ person_id, camp_id, skills }) => {
  const [result] = await pool.query(
    `INSERT INTO admission_request (person_id, camp_id, request_date, status, skills)
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
  // get request details
  const [rows] = await pool.query(
    'SELECT * FROM admission_request WHERE request_id = ?',
    [request_id],
  );

  const request = rows[0];

  // update request status
  await pool.query(
    'UPDATE admission_request SET status = "approved" WHERE request_id = ?',
    [request_id],
  );

  // update person status and camp_id
  await pool.query(
    'UPDATE person SET camp_id = ?, status = "active" WHERE person_id = ?',
    [request.camp_id, request.person_id],
  );

  return { message: 'Admission approved' };
};
