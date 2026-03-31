import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

// REGISTER
export const registerUser = async ({
  username,
  password,
  person_id,
  role_id,
}) => {
  username = username?.trim().toLowerCase();
  password = password?.trim().toLowerCase();

  if (!username || !password || !role_id) {
    throw new Error('Missing required fields');
  }

  // unique username
  const [existingUser] = await pool.query(
    'SELECT * FROM user_account WHERE username = ?',
    [username],
  );

  if (existingUser.length > 0) {
    throw new Error('Username already exists');
  }

  // validate role
  const [role] = await pool.query(
    'SELECT * FROM system_role WHERE role_id = ?',
    [role_id],
  );

  if (role.length === 0) {
    throw new Error('Role not found');
  }

  // validate person if person_id is provided
  if (person_id) {
    const [person] = await pool.query(
      'SELECT * FROM person WHERE person_id = ?',
      [person_id],
    );

    if (person.length === 0) {
      throw new Error('Person not found');
    }

    const [hasAccount] = await pool.query(
      'SELECT * FROM user_account WHERE person_id = ?',
      [person_id],
    );

    if (hasAccount.length > 0) {
      throw new Error('Person already has an account');
    }
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO user_account (username, password, person_id, role_id)
     VALUES (?, ?, ?, ?)`,
    [username, hashedPassword, person_id || null, role_id],
  );

  return { user_id: result.insertId };
};

// LOGIN
export const loginUser = async ({ username, password }) => {
  username = username?.trim().toLowerCase();
  password = password?.trim().toLowerCase();

  if (!username || !password) {
    throw new Error('Missing credentials');
  }

  const [rows] = await pool.query(
    `SELECT u.*, r.name AS role_name
     FROM user_account u
     JOIN system_role r ON u.role_id = r.role_id
     WHERE u.username = ?`,
    [username],
  );

  const user = rows[0];

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return {
    user_id: user.user_id,
    username: user.username,
    role: user.role_name,
    person_id: user.person_id,
  };
};
