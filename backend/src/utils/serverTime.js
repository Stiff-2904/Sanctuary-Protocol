import { pool } from '../config/db.js';

export const getServerTime = async () => {
  const [rows] = await pool.query('SELECT NOW() as server_time');
  return rows[0].server_time;
};
