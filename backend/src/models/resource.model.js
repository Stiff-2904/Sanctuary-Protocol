import { pool } from '../config/db.js';

// GET ALL RESOURCES
export const getResources = async () => {
  const [rows] = await pool.query('SELECT * FROM resource');
  return rows;
};

// GET ONE RESOURCE
export const getResourceById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM resource WHERE resource_id = ?',
    [id],
  );

  if (rows.length === 0) {
    throw new Error('Resource not found');
  }

  return rows[0];
};

// CREATE RESOURCE
export const createResource = async ({ name }) => {
  name = name?.trim();

  if (!name) {
    throw new Error('Name is required');
  }

  const [exists] = await pool.query(
    'SELECT * FROM resource WHERE LOWER(name) = LOWER(?)',
    [name],
  );

  if (exists.length > 0) {
    throw new Error('Resource already exists');
  }

  const [result] = await pool.query('INSERT INTO resource (name) VALUES (?)', [
    name,
  ]);

  return { resource_id: result.insertId };
};

// UPDATE RESOURCE
export const updateResource = async (id, { name }) => {
  const [rows] = await pool.query(
    'SELECT * FROM resource WHERE resource_id = ?',
    [id],
  );

  if (rows.length === 0) {
    throw new Error('Resource not found');
  }

  if (!name) {
    throw new Error('Name is required');
  }

  await pool.query('UPDATE resource SET name = ? WHERE resource_id = ?', [
    name,
    id,
  ]);

  return { message: 'Resource updated' };
};
