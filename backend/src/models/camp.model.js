import { pool } from '../config/db.js';

export const getCamps = async () => {
  const [rows] = await pool.query('SELECT * FROM camp');
  return rows;
};

export const createCamp = async ({ name, location, status }) => {
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
  await pool.query(
    'UPDATE camp SET name = ?, location = ?, status = ? WHERE camp_id = ?',
    [name, location, status, id],
  );

  return { camp_id: id, name, location, status };
};
