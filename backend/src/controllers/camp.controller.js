import { getCamps } from '../models/camp.model.js';
import { createCamp } from '../models/camp.model.js';
import { updateCamp } from '../models/camp.model.js';
import { getCampById } from '../models/camp.model.js';

export const getCampsController = async (req, res) => {
  try {
    const camps = await getCamps();
    res.json(camps);
  } catch (error) {
    res.status(500).json({
      message: 'Error to get camps',
      error: error.message,
    });
  }
};

export const getCampByIdController = async (req, res) => {
  try {
    const camp = await getCampById(req.params.id);
    res.json(camp);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const createCampController = async (req, res) => {
  try {
    const { name, location, status } = req.body;

    const newCamp = await createCamp({ name, location, status });

    res.status(201).json(newCamp);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating camp',
      error: error.message,
    });
  }
};

export const updateCampController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, status } = req.body;

    const updatedCamp = await updateCamp(id, { name, location, status });

    res.json(updatedCamp);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating camp',
      error: error.message,
    });
  }
};
