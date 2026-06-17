import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const getSSLConfig = () => {
  if (process.env.DB_SSL_CA) {
    return {
      ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'),
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    };
  }

  if (process.env.DB_SSL_CA_PATH) {
    try {
      const fs = require('fs');
      return {
        ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8'),
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      };
    } catch (error) {
      console.warn('Error leyendo certificado desde archivo:', error.message);
    }
  }

  return process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }
    : false;
};

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '4000'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,

  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 30000,
  idleTimeout: 300000,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  ssl: getSSLConfig(),

  charset: 'utf8mb4',

  multipleStatements: false,
});

pool.on('connection', (connection) => {
  console.log(`Conexión establecida a TiDB: ${connection.threadId}`);

  connection.on('error', (err) => {
    console.error(`Error en conexión ${connection.threadId}:`, err.code);

    if (
      ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT'].includes(err.code)
    ) {
      console.warn(
        `Conexión ${connection.threadId} perdida. Pool reconectará automáticamente.`,
      );
    }
  });

  connection.on('end', () => {
    console.log(`Conexión ${connection.threadId} cerrada`);
  });
});

export const testConnection = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 + 1 AS result');
    return { success: true, result: rows[0].result };
  } catch (error) {
    console.error('Error probando conexión a BD:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (conn) conn.release();
  }
};

export const closePool = async () => {
  console.log('Cerrando pool de conexiones...');
  await pool.end();
  console.log('Pool cerrado correctamente');
};

export default pool;
