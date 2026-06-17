import { getInventory } from '../models/inventory.model.js';
import { getInventoryByCamp } from '../models/inventory.model.js';
import { addInventory } from '../models/inventory.model.js';
import { updateInventory } from '../models/inventory.model.js';
import { getInventoryAlerts } from '../models/inventory.model.js';
import { pool } from '../config/db.js';

// GET ALL
export const getInventoryController = async (req, res) => {
  try {
    const data = await getInventory();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching inventory',
      error: error.message,
    });
  }
};

// GET INVENTORY DEL CAMP DEL USUARIO
export const getInventoryByCampController = async (req, res) => {
  try {
    const camp_id = req.user.camp_id || req.query.camp_id;

    if (!camp_id) {
      return res.status(400).json({ message: 'No camp assigned' });
    }

    const data = await getInventoryByCamp(camp_id);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching camp inventory', error: error.message });
  }
};

// ADD
export const addInventoryController = async (req, res) => {
  try {
    const result = await addInventory(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error adding inventory',
      error: error.message,
    });
  }
};

// UPDATE
export const updateInventoryController = async (req, res) => {
  try {
    const result = await updateInventory(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating inventory',
      error: error.message,
    });
  }
};

// GET INVENTORY ALERTS
export const getInventoryAlertsController = async (req, res) => {
  try {
    const data = await getInventoryAlerts();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching inventory alerts',
      error: error.message,
    });
  }
};

export const getLowResourceAlerts = async (req, res) => {
  try {
    const campId = req.user.camp_id;

    const [alerts] = await pool.query(
      `SELECT i.*, r.name as resource_name, r.minimum_quantity,
              ROUND((i.quantity * 100.0 / r.minimum_quantity), 2) as percentage
       FROM inventory i
       JOIN resource r ON i.resource_type = r.type
       WHERE i.camp_id = ? AND i.quantity < r.minimum_quantity
       ORDER BY percentage ASC`,
      [campId],
    );

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      critical: alerts.filter((a) => a.percentage < 50).length,
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getResourceStatsController = async (req, res) => {
  try {
    const campId = req.user.camp_id;

    const [stats] = await pool.query(
      `SELECT 
         COUNT(DISTINCT i.inventory_id) as total_resources,
         SUM(CASE WHEN i.quantity < r.minimum_quantity THEN 1 ELSE 0 END) as low_resources,
         SUM(i.quantity) as total_quantity
       FROM inventory i
       JOIN resource r ON i.resource_type = r.type
       WHERE i.camp_id = ?`,
      [campId],
    );

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error('Error en stats:', error);
    res.status(500).json({ error: error.message });
  }
};
