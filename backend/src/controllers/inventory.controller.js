import { getInventory } from '../models/inventory.model.js';
import { getInventoryByCamp } from '../models/inventory.model.js';
import { addInventory } from '../models/inventory.model.js';
import { updateInventory } from '../models/inventory.model.js';

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
    const camp_id = req.user.camp_id;

    if (!camp_id) {
      return res.status(400).json({
        message: 'User has no assigned camp',
      });
    }

    const data = await getInventoryByCamp(camp_id);
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
