import { pool } from '../config/db.js';

// GET ALL
export const getPersons = async () => {
  const [rows] = await pool.query('SELECT * FROM person');
  return rows;
};

// GET BY ID
export const getPersonById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM person WHERE person_id = ?', [
    id,
  ]);

  if (rows.length === 0) {
    throw new Error('Person not found');
  }

  return rows[0];
};

// CREATE
export const createPerson = async ({ name }) => {
  if (!name) {
    throw new Error('Name is required');
  }

  const [result] = await pool.query(
    `INSERT INTO person (name, status, camp_id)
     VALUES (?, 'pending', NULL)`,
    [name],
  );

  return { person_id: result.insertId };
};

// UPDATE
export const updatePerson = async (id, { name, status, camp_id }) => {
  const [rows] = await pool.query('SELECT * FROM person WHERE person_id = ?', [
    id,
  ]);

  if (rows.length === 0) {
    throw new Error('Person not found');
  }

  await pool.query(
    `UPDATE person 
     SET name = COALESCE(?, name),
         status = COALESCE(?, status),
         camp_id = COALESCE(?, camp_id)
     WHERE person_id = ?`,
    [name, status, camp_id, id],
  );

  return { message: 'Person updated' };
};
