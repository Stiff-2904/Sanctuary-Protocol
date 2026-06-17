import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async ({
  username,
  password,
  person_id,
  role_id,
}) => {
  username = username?.trim().toLowerCase();
  password = password?.trim();

  if (!username || !password || !role_id) {
    throw new Error('Missing required fields');
  }

  const [existing] = await pool.query(
    'SELECT * FROM user_account WHERE username = ?',
    [username],
  );

  if (existing.length > 0) {
    throw new Error('Username already exists');
  }

  const hashed = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO user_account (username, password, person_id, role_id)
     VALUES (?, ?, ?, ?)`,
    [username, hashed, person_id || null, role_id],
  );

  return { user_id: result.insertId };
};

export const loginUser = async ({ username, password }) => {
  username = username?.trim().toLowerCase();

  const [rows] = await pool.query(
    `SELECT u.*, r.name AS role_name, p.camp_id
     FROM user_account u
     LEFT JOIN system_role r ON u.role_id = r.role_id
     LEFT JOIN person p ON u.person_id = p.person_id
     WHERE LOWER(u.username) = ?`,
    [username],
  );

  console.log('Rows encontrados:', rows.length);

  if (rows.length === 0) {
    console.error('Usuario NO encontrado en BD');
    throw new Error('Invalid credentials');
  }

  const user = rows[0];
  console.log('Usuario encontrado:', {
  user_id: user.user_id,
  username: user.username,
  role_id: user.role_id,
  role_name: user.role_name,
  camp_id: user.camp_id,  // agregar esta línea
  has_password: !!user.password,
  password_preview: user.password?.substring(0, 20) + '...',
});

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    console.error('Password NO coincide');
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      role: user.role_name,
      camp_id: user.camp_id,
    },
    message: 'Login exitoso',
  };
};
