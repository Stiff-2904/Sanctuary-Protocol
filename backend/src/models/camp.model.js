import { pool } from '../config/db.js';

export const getCamps = async () => {
  const [rows] = await pool.query('SELECT * FROM camp');
  return rows;
};
