import { getResources } from '../models/resource.model.js';
import { getResourceById } from '../models/resource.model.js';
import { createResource } from '../models/resource.model.js';
import { updateResource } from '../models/resource.model.js';

// GET ALL
export const getResourcesController = async (req, res) => {
  try {
    const data = await getResources();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching resources',
      error: error.message,
    });
  }
};

// GET ONE
export const getResourceByIdController = async (req, res) => {
  try {
    const data = await getResourceById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({
      message: 'Error fetching resource',
      error: error.message,
    });
  }
};

// CREATE
export const createResourceController = async (req, res) => {
  try {
    const result = await createResource(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating resource',
      error: error.message,
    });
  }
};

// UPDATE
export const updateResourceController = async (req, res) => {
  try {
    const result = await updateResource(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating resource',
      error: error.message,
    });
  }
};
