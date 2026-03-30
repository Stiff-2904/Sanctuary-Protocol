import { pool } from '../config/db.js';

// GET ALL
export const getProfessions = async () => {
  const [rows] = await pool.query('SELECT * FROM profession');
  return rows;
};

// GET ONE
export const getProfessionById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM profession WHERE profession_id = ?',
    [id],
  );

  if (rows.length === 0) {
    throw new Error('Profession not found');
  }

  return rows[0];
};

// CREATE
export const createProfession = async ({ name, description }) => {
  name = name?.trim();

  if (!name) {
    throw new Error('Name is required');
  }

  const [exists] = await pool.query(
    'SELECT * FROM profession WHERE LOWER(name) = LOWER(?)',
    [name],
  );

  if (exists.length > 0) {
    throw new Error('Profession already exists');
  }

  const [result] = await pool.query(
    'INSERT INTO profession (name, description) VALUES (?, ?)',
    [name, description || null],
  );

  return { profession_id: result.insertId };
};

// UPDATE
export const updateProfession = async (id, { name, description }) => {
  const [rows] = await pool.query(
    'SELECT * FROM profession WHERE profession_id = ?',
    [id],
  );

  if (rows.length === 0) {
    throw new Error('Profession not found');
  }

  if (name) {
    name = name.trim();

    const [exists] = await pool.query(
      'SELECT * FROM profession WHERE LOWER(name) = LOWER(?) AND profession_id != ?',
      [name, id],
    );

    if (exists.length > 0) {
      throw new Error('Profession already exists');
    }
  }

  await pool.query(
    `UPDATE profession 
     SET name = COALESCE(?, name),
         description = COALESCE(?, description)
     WHERE profession_id = ?`,
    [name, description, id],
  );

  return { message: 'Profession updated' };
};
