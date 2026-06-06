import { pool } from '../config/db.js';

export const getCamps = async () => {
  const [rows] = await pool.query('SELECT * FROM camp');
  return rows;
};

export const createCamp = async ({ name, location, status }) => {
  name = name?.trim();
  location = location?.trim();
  status = status?.trim();

  if (!name || !location || !status) {
    throw new Error('Name, location and status are required');
  }

  const [exists] = await pool.query(
    'SELECT * FROM camp WHERE LOWER(name) = LOWER(?)',
    [name],
  );

  if (exists.length > 0) {
    throw new Error('Camp already exists');
  }

  const [result] = await pool.query(
    'INSERT INTO camp (name, location, status) VALUES (?, ?, ?)',
    [name, location, status],
  );

  return {
    camp_id: result.insertId,
    name,
    location,
    status,
  };
};

export const updateCamp = async (id, { name, location, status }) => {
  const [rows] = await pool.query('SELECT * FROM camp WHERE camp_id = ?', [id]);

  if (rows.length === 0) {
    throw new Error('Camp not found');
  }

  if (name) {
    name = name.trim();

    const [exists] = await pool.query(
      `SELECT *
       FROM camp
       WHERE LOWER(name) = LOWER(?)
       AND camp_id != ?`,
      [name, id],
    );

    if (exists.length > 0) {
      throw new Error('Camp already exists');
    }
  }

  await pool.query(
    `UPDATE camp
     SET name = COALESCE(?, name),
         location = COALESCE(?, location),
         status = COALESCE(?, status)
     WHERE camp_id = ?`,
    [name, location, status, id],
  );

  return {
    message: 'Camp updated',
  };
};

export const getCampById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM camp WHERE camp_id = ?', [id]);

  if (rows.length === 0) {
    throw new Error('Camp not found');
  }

  return rows[0];
};
