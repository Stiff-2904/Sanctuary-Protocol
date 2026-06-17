import { getPersons } from '../models/person.model.js';
import { getPersonById } from '../models/person.model.js';
import { createPerson } from '../models/person.model.js';
import { updatePerson } from '../models/person.model.js';
import { updateHealthStatus } from '../models/person.model.js';

export const getPersonsController = async (req, res) => {
  try {
    const camp_id = req.user.camp_id || req.query.camp_id;
    const persons = await getPersons(camp_id);
    res.json(persons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching persons', error: error.message });
  }
};

// GET BY ID
export const getPersonByIdController = async (req, res) => {
  try {
    const person = await getPersonById(req.params.id);
    res.json(person);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// CREATE
export const createPersonController = async (req, res) => {
  try {
    const result = await createPerson(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating person',
      error: error.message,
    });
  }
};

// UPDATE
export const updatePersonController = async (req, res) => {
  try {
    const result = await updatePerson(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating person',
      error: error.message,
    });
  }
};

export const updateHealthStatusController = async (req, res) => {
  try {
    const result = await updateHealthStatus(
      req.params.id,
      req.body.health_status,
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating health status',
      error: error.message,
    });
  }
};
