import { getProfessions } from '../models/profession.model.js';
import { getProfessionById } from '../models/profession.model.js';
import { createProfession } from '../models/profession.model.js';
import { updateProfession } from '../models/profession.model.js';

// GET ALL
export const getProfessionsController = async (req, res) => {
  try {
    const data = await getProfessions();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching professions',
      error: error.message,
    });
  }
};

// GET ONE
export const getProfessionByIdController = async (req, res) => {
  try {
    const data = await getProfessionById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({
      message: 'Error fetching profession',
      error: error.message,
    });
  }
};

// CREATE
export const createProfessionController = async (req, res) => {
  try {
    const result = await createProfession(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating profession',
      error: error.message,
    });
  }
};

// UPDATE
export const updateProfessionController = async (req, res) => {
  try {
    const result = await updateProfession(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating profession',
      error: error.message,
    });
  }
};
