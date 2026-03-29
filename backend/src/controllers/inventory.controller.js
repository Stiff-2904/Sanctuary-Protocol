import { getInventory } from '../models/inventory.model.js';
import { getInventoryByCamp } from '../models/inventory.model.js';
import { addInventory } from '../models/inventory.model.js';
import { updateInventory } from '../models/inventory.model.js';

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

// GET BY CAMP
export const getInventoryByCampController = async (req, res) => {
  try {
    const data = await getInventoryByCamp(req.params.camp_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching camp inventory',
      error: error.message,
    });
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
