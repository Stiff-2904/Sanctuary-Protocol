import {
  getTemporaryAssignments,
  createTemporaryAssignment,
  endTemporaryAssignment,
} from '../models/temporaryAssignment.model.js';

import { getTemporaryAssignmentHistory } from '../models/temporaryAssignment.model.js';

// GET ACTIVE ASSIGNMENTS
export const getTemporaryAssignmentsController = async (req, res) => {
  try {
    const camp_id = req.user.camp_id || req.query.camp_id;
    if (!camp_id) {
      return res.status(400).json({ message: 'camp_id is required' });
    }
    const data = await getTemporaryAssignments(camp_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching temporary assignments',
      error: error.message,
    });
  }
};

// CREATE ASSIGNMENT
export const createTemporaryAssignmentController = async (req, res) => {
  try {
    const result = await createTemporaryAssignment(req.body);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating temporary assignment',
      error: error.message,
    });
  }
};

// END ASSIGNMENT
export const endTemporaryAssignmentController = async (req, res) => {
  try {
    const result = await endTemporaryAssignment(req.params.id);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error ending temporary assignment',
      error: error.message,
    });
  }
};

// GET ASSIGNMENT HISTORY
export const getTemporaryAssignmentHistoryController = async (req, res) => {
  try {
    const camp_id = req.user.camp_id || req.query.camp_id;
    if (!camp_id) {
      return res.status(400).json({ message: 'camp_id is required' });
    }
    const data = await getTemporaryAssignmentHistory(camp_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching assignment history',
      error: error.message,
    });
  }
};