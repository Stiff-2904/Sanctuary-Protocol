import {
  getExplorations,
  getExplorationById,
  createExploration,
  updateExploration,
  assignPersonToExploration,
  addResourceToExploration,
  completeExploration,
} from '../models/exploration.model.js';

// GET ALL
export const getExplorationsController = async (req, res) => {
  try {
    const camp_id = req.user.camp_id || req.query.camp_id;
    const data = await getExplorations(camp_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching explorations', error: error.message });
  }
};

// GET BY ID
export const getExplorationByIdController = async (req, res) => {
  try {
    const data = await getExplorationById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// CREATE
export const createExplorationController = async (req, res) => {
  try {
    const result = await createExploration(req.body);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating exploration',
      error: error.message,
    });
  }
};

// UPDATE
export const updateExplorationController = async (req, res) => {
  try {
    const result = await updateExploration(req.params.id, req.body);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating exploration',
      error: error.message,
    });
  }
};

// ASSIGN PERSON
export const assignPersonController = async (req, res) => {
  try {
    const { person_id } = req.body;

    const result = await assignPersonToExploration(req.params.id, person_id);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error assigning person',
      error: error.message,
    });
  }
};

// ADD RESOURCE
export const addResourceController = async (req, res) => {
  try {
    const { resource_id, quantity_obtained } = req.body;

    const result = await addResourceToExploration(
      req.params.id,
      resource_id,
      quantity_obtained,
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error adding resource',
      error: error.message,
    });
  }
};

// COMPLETE EXPLORATION
export const completeExplorationController = async (req, res) => {
  try {
    const result = await completeExploration(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error completing exploration',
      error: error.message,
    });
  }
};