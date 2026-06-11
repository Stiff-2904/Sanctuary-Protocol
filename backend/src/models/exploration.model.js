import { pool } from '../config/db.js';

// GET ALL EXPLORATIONS
export const getExplorations = async (camp_id) => {
  if (camp_id) {
    const [rows] = await pool.query(`
      SELECT e.*, c.name AS camp_name
      FROM exploration e
      JOIN camp c ON e.camp_id = c.camp_id
      WHERE e.camp_id = ?
      ORDER BY e.exploration_id DESC
    `, [camp_id]);
    return rows;
  }
  const [rows] = await pool.query(`
    SELECT e.*, c.name AS camp_name
    FROM exploration e
    JOIN camp c ON e.camp_id = c.camp_id
    ORDER BY e.exploration_id DESC
  `);
  return rows;
};

// GET EXPLORATION BY ID
export const getExplorationById = async (id) => {
  const [explorationRows] = await pool.query(
    `
    SELECT e.*, c.name AS camp_name
    FROM exploration e
    JOIN camp c ON e.camp_id = c.camp_id
    WHERE e.exploration_id = ?
    `,
    [id],
  );

  if (explorationRows.length === 0) {
    throw new Error('Exploration not found');
  }

  const exploration = explorationRows[0];

  const [persons] = await pool.query(
    `
    SELECT p.person_id, p.name, p.status
    FROM exploration_persons ep
    JOIN person p ON ep.person_id = p.person_id
    WHERE ep.exploration_id = ?
    `,
    [id],
  );

  const [resources] = await pool.query(
    `
    SELECT er.resource_id,
           r.name AS resource_name,
           er.quantity_obtained
    FROM exploration_resources er
    JOIN resource r ON er.resource_id = r.resource_id
    WHERE er.exploration_id = ?
    `,
    [id],
  );

  return {
    exploration,
    persons,
    resources,
  };
};

// CREATE EXPLORATION
export const createExploration = async ({
  camp_id,
  start_date,
  end_date,
  status,
}) => {
  if (!camp_id) {
    throw new Error('camp_id is required');
  }

  const [campRows] = await pool.query('SELECT * FROM camp WHERE camp_id = ?', [
    camp_id,
  ]);

  if (campRows.length === 0) {
    throw new Error('Camp not found');
  }

  const [result] = await pool.query(
    `
    INSERT INTO exploration (
      camp_id,
      start_date,
      end_date,
      status
    )
    VALUES (?, ?, ?, ?)
    `,
    [camp_id, start_date || null, end_date || null, status || 'active'],
  );

  return {
    exploration_id: result.insertId,
    camp_id,
    start_date,
    end_date,
    status: status || 'active',
  };
};

// UPDATE EXPLORATION
export const updateExploration = async (
  id,
  { start_date, end_date, status },
) => {
  const [rows] = await pool.query(
    'SELECT * FROM exploration WHERE exploration_id = ?',
    [id],
  );

  if (rows.length === 0) {
    throw new Error('Exploration not found');
  }

  await pool.query(
    `
    UPDATE exploration
    SET
      start_date = COALESCE(?, start_date),
      end_date = COALESCE(?, end_date),
      status = COALESCE(?, status)
    WHERE exploration_id = ?
    `,
    [start_date, end_date, status, id],
  );

  return {
    message: 'Exploration updated',
  };
};

// ASSIGN PERSON
export const assignPersonToExploration = async (exploration_id, person_id) => {
  const [explorationRows] = await pool.query(
    'SELECT * FROM exploration WHERE exploration_id = ?',
    [exploration_id],
  );

  if (explorationRows.length === 0) {
    throw new Error('Exploration not found');
  }

  const exploration = explorationRows[0];

  const [personRows] = await pool.query(
    'SELECT * FROM person WHERE person_id = ?',
    [person_id],
  );

  if (personRows.length === 0) {
    throw new Error('Person not found');
  }

  const person = personRows[0];

  if (person.camp_id !== exploration.camp_id) {
    throw new Error('Person belongs to a different camp');
  }

  if (person.status !== 'active') {
    throw new Error(`Person is not available (status: ${person.status})`);
  }

  if (exploration.status !== 'active') {
    throw new Error('Cannot assign persons to a non-active exploration');
  }

  const [existing] = await pool.query(
    `
    SELECT *
    FROM exploration_persons
    WHERE exploration_id = ?
      AND person_id = ?
    `,
    [exploration_id, person_id],
  );

  if (existing.length > 0) {
    throw new Error('Person already assigned to exploration');
  }

  await pool.query(
    `
    INSERT INTO exploration_persons (
      exploration_id,
      person_id
    )
    VALUES (?, ?)
    `,
    [exploration_id, person_id],
  );

  // Mark person as out of camp
  await pool.query(
    'UPDATE person SET status = ? WHERE person_id = ?',
    ['out_of_camp', person_id],
  );

  return {
    message: 'Person assigned successfully',
  };
};

// ADD RESOURCE TO RECOUNT (no suma al inventario todavía)
export const addResourceToExploration = async (
  exploration_id,
  resource_id,
  quantity_obtained,
) => {
  if (!quantity_obtained || quantity_obtained <= 0) {
    throw new Error('quantity_obtained must be greater than 0');
  }

  const [explorationRows] = await pool.query(
    'SELECT * FROM exploration WHERE exploration_id = ?',
    [exploration_id],
  );

  if (explorationRows.length === 0) {
    throw new Error('Exploration not found');
  }

  const [resourceRows] = await pool.query(
    'SELECT * FROM resource WHERE resource_id = ?',
    [resource_id],
  );

  if (resourceRows.length === 0) {
    throw new Error('Resource not found');
  }

  const [existing] = await pool.query(
    `
    SELECT *
    FROM exploration_resources
    WHERE exploration_id = ?
      AND resource_id = ?
    `,
    [exploration_id, resource_id],
  );

  if (existing.length > 0) {
    await pool.query(
      `
      UPDATE exploration_resources
      SET quantity_obtained = quantity_obtained + ?
      WHERE exploration_id = ?
        AND resource_id = ?
      `,
      [quantity_obtained, exploration_id, resource_id],
    );
  } else {
    await pool.query(
      `
      INSERT INTO exploration_resources (
        exploration_id,
        resource_id,
        quantity_obtained
      )
      VALUES (?, ?, ?)
      `,
      [exploration_id, resource_id, quantity_obtained],
    );
  }

  return {
    message: 'Resource registered successfully',
  };
};

// COMPLETE EXPLORATION — suma recursos al inventario y marca como completada
export const completeExploration = async (exploration_id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT * FROM exploration WHERE exploration_id = ?',
      [exploration_id],
    );
    if (rows.length === 0) throw new Error('Exploration not found');

    const exploration = rows[0];
    if (exploration.status === 'completed') {
      throw new Error('Exploration already completed');
    }

    // Obtener recursos del recuento
    const [resources] = await connection.query(
      'SELECT * FROM exploration_resources WHERE exploration_id = ?',
      [exploration_id],
    );

    // Sumar cada recurso al inventario del campamento
    for (const r of resources) {
      await connection.query(
        `INSERT INTO inventory (camp_id, resource_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [exploration.camp_id, r.resource_id, r.quantity_obtained, r.quantity_obtained],
      );
    }

    // Marcar personas como de regreso
    await connection.query(
      `UPDATE person p
       JOIN exploration_persons ep ON ep.person_id = p.person_id
       SET p.status = 'active'
       WHERE ep.exploration_id = ?`,
      [exploration_id],
    );

    // Marcar expedición como completada
    await connection.query(
      'UPDATE exploration SET status = ? WHERE exploration_id = ?',
      ['completed', exploration_id],
    );

    await connection.commit();
    return { message: 'Exploration completed, resources added to inventory' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};