import { pool } from '../config/db.js';

export const getPersons = async (camp_id) => {
  if (camp_id) {
    const [rows] = await pool.query('SELECT * FROM person WHERE camp_id = ?', [camp_id]);
    return rows;
  }
  const [rows] = await pool.query('SELECT * FROM person');
  return rows;
};

export const getPersonById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM person WHERE person_id = ?', [
    id,
  ]);
  if (rows.length === 0) throw new Error('Person not found');
  return rows[0];
};

export const createPerson = async ({ name, birth_date }) => {
  if (!name) throw new Error('Name is required');
  const [result] = await pool.query(
    `INSERT INTO person (name, birth_date, status, camp_id) VALUES (?, ?, 'pending', NULL)`,
    [name, birth_date || null],
  );
  return { person_id: result.insertId };
};

export const updatePerson = async (
  id,
  { name, birth_date, status, camp_id },
) => {
  const [rows] = await pool.query('SELECT * FROM person WHERE person_id = ?', [
    id,
  ]);
  if (rows.length === 0) throw new Error('Person not found');
  await pool.query(
    `UPDATE person SET name = COALESCE(?, name), birth_date = COALESCE(?, birth_date), status = COALESCE(?, status), camp_id = COALESCE(?, camp_id) WHERE person_id = ?`,
    [name, birth_date, status, camp_id, id],
  );
  return { message: 'Person updated' };
};

export const updateHealthStatus = async (id, health_status) => {
  const allowedStatuses = ['healthy', 'injured', 'sick', 'away'];

  if (!allowedStatuses.includes(health_status)) {
    throw new Error('Invalid health status');
  }

  const [rows] = await pool.query('SELECT * FROM person WHERE person_id = ?', [
    id,
  ]);

  if (rows.length === 0) {
    throw new Error('Person not found');
  }

  await pool.query(
    `
    UPDATE person
    SET health_status = ?
    WHERE person_id = ?
    `,
    [health_status, id],
  );

  return {
    message: 'Health status updated',
  };
};
