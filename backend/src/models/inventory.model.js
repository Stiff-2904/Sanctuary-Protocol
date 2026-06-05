import { pool } from '../config/db.js';

// GET ALL INVENTORY
export const getInventory = async () => {
  const [rows] = await pool.query(`
    SELECT i.inventory_id, i.camp_id, c.name AS camp_name,
           i.resource_id, r.name AS resource_name, i.quantity
    FROM inventory i
    JOIN camp c ON i.camp_id = c.camp_id
    JOIN resource r ON i.resource_id = r.resource_id
  `);

  return rows;
};

// GET INVENTORY BY CAMP
export const getInventoryByCamp = async (camp_id) => {
  const [rows] = await pool.query(
    `SELECT i.inventory_id, i.resource_id, r.name AS resource_name, i.quantity
     FROM inventory i
     JOIN resource r ON i.resource_id = r.resource_id
     WHERE i.camp_id = ?`,
    [camp_id],
  );

  return rows;
};

// ADD OR INCREASE INVENTORY
export const addInventory = async ({ camp_id, resource_id, quantity }) => {
  if (!camp_id || !resource_id || quantity === undefined) {
    throw new Error('Missing required fields');
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  await pool.query(
    `INSERT INTO inventory (camp_id, resource_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
    [camp_id, resource_id, quantity, quantity],
  );

  return { message: 'Inventory updated' };
};

// UPDATE INVENTORY
export const updateInventory = async (id, { quantity }, userCamp) => {
  const [rows] = await pool.query(
    'SELECT * FROM inventory WHERE inventory_id = ?',
    [id],
  );

  if (rows.length === 0) {
    throw new Error('Inventory not found');
  }

  const inventory = rows[0];

  if (userCamp && inventory.camp_id !== userCamp) {
    throw new Error('Unauthorized: different camp');
  }

  if (quantity === undefined || quantity < 0) {
    throw new Error('Invalid quantity');
  }

  await pool.query(`UPDATE inventory SET quantity = ? WHERE inventory_id = ?`, [
    quantity,
    id,
  ]);

  return { message: 'Inventory updated' };
};

// GET CRITICAL INVENTORY ALERTS
export const getInventoryAlerts = async () => {
  const [rows] = await pool.query(`
    SELECT
      i.inventory_id,
      i.camp_id,
      c.name AS camp_name,
      i.resource_id,
      r.name AS resource_name,
      i.quantity,
      i.minimum_quantity
    FROM inventory i
    JOIN camp c ON i.camp_id = c.camp_id
    JOIN resource r ON i.resource_id = r.resource_id
    WHERE i.quantity < i.minimum_quantity
    ORDER BY i.camp_id, r.name
  `);

  return rows;
};
