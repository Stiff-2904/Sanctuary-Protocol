import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const caPath =
  process.env.DB_SSL_CA_PATH ||
  path.join(process.cwd(), 'config', 'isrgrootx1.pem');
const sslConfig = fs.existsSync(caPath)
  ? { ca: fs.readFileSync(caPath), rejectUnauthorized: true }
  : { rejectUnauthorized: false };

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '4000'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig,
});
