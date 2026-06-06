import { pool } from '../config/db.js';

// GET ACTIVE ASSIGNMENTS
export const getTemporaryAssignments = async () => {
  const [rows] = await pool.query(`
    SELECT
      ta.assignment_id,
      ta.person_id,
      p.name AS person_name,

      ta.original_profession_id,
      op.name AS original_profession,

      ta.temporary_profession_id,
      tp.name AS temporary_profession,

      ta.start_date,
      ta.end_date

    FROM temporary_assignment ta

    JOIN person p
      ON ta.person_id = p.person_id

    JOIN profession op
      ON ta.original_profession_id = op.profession_id

    JOIN profession tp
      ON ta.temporary_profession_id = tp.profession_id

    WHERE ta.end_date IS NULL

    ORDER BY ta.start_date DESC
  `);

  return rows;
};

// CREATE TEMPORARY ASSIGNMENT
export const createTemporaryAssignment = async ({
  person_id,
  temporary_profession_id,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [personRows] = await connection.query(
      `SELECT *
       FROM person
       WHERE person_id = ?`,
      [person_id],
    );

    if (personRows.length === 0) {
      throw new Error('Person not found');
    }

    const person = personRows[0];

    const [activeAssignment] = await connection.query(
      `SELECT *
       FROM temporary_assignment
       WHERE person_id = ?
       AND end_date IS NULL`,
      [person_id],
    );

    if (activeAssignment.length > 0) {
      throw new Error('Person already has an active temporary assignment');
    }

    if (person.profession_id === temporary_profession_id) {
      throw new Error('Person already has this profession');
    }

    const [professionRows] = await connection.query(
      `SELECT *
       FROM profession
       WHERE profession_id = ?`,
      [temporary_profession_id],
    );

    if (professionRows.length === 0) {
      throw new Error('Temporary profession not found');
    }

    const originalProfessionId = person.profession_id;

    const [result] = await connection.query(
      `INSERT INTO temporary_assignment
       (
         person_id,
         original_profession_id,
         temporary_profession_id,
         start_date
       )
       VALUES (?, ?, ?, CURDATE())`,
      [person_id, originalProfessionId, temporary_profession_id],
    );

    await connection.query(
      `UPDATE person
       SET profession_id = ?
       WHERE person_id = ?`,
      [temporary_profession_id, person_id],
    );

    await connection.commit();

    return {
      assignment_id: result.insertId,
      message: 'Temporary assignment created',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// END TEMPORARY ASSIGNMENT
export const endTemporaryAssignment = async (assignment_id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT *
       FROM temporary_assignment
       WHERE assignment_id = ?`,
      [assignment_id],
    );

    if (rows.length === 0) {
      throw new Error('Assignment not found');
    }

    const assignment = rows[0];

    if (assignment.end_date !== null) {
      throw new Error('Assignment already closed');
    }

    await connection.query(
      `UPDATE person
       SET profession_id = ?
       WHERE person_id = ?`,
      [assignment.original_profession_id, assignment.person_id],
    );

    await connection.query(
      `UPDATE temporary_assignment
       SET end_date = CURDATE()
       WHERE assignment_id = ?`,
      [assignment_id],
    );

    await connection.commit();

    return {
      message: 'Temporary assignment ended successfully',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// GET ASSIGNMENT HISTORY
export const getTemporaryAssignmentHistory = async () => {
  const [rows] = await pool.query(`
    SELECT
      ta.assignment_id,
      ta.person_id,
      p.name AS person_name,

      ta.original_profession_id,
      op.name AS original_profession,

      ta.temporary_profession_id,
      tp.name AS temporary_profession,

      ta.start_date,
      ta.end_date

    FROM temporary_assignment ta

    JOIN person p
      ON ta.person_id = p.person_id

    JOIN profession op
      ON ta.original_profession_id = op.profession_id

    JOIN profession tp
      ON ta.temporary_profession_id = tp.profession_id

    ORDER BY ta.start_date DESC
  `);

  return rows;
};
