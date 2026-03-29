import { createCampRequest } from '../models/campRequest.model.js';
import { addResourceToRequest } from '../models/campRequest.model.js';
import { addPersonToRequest } from '../models/campRequest.model.js';
import { approveCampRequest } from '../models/campRequest.model.js';
import { rejectCampRequest } from '../models/campRequest.model.js';
import { getCampRequests } from '../models/campRequest.model.js';

export const createCampRequestController = async (req, res) => {
  try {
    const result = await createCampRequest(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating camp request',
      error: error.message,
    });
  }
};

export const addResourceController = async (req, res) => {
  try {
    const result = await addResourceToRequest({
      request_id: req.params.id,
      ...req.body,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error adding resource',
      error: error.message,
    });
  }
};

export const addPersonController = async (req, res) => {
  try {
    const result = await addPersonToRequest({
      request_id: req.params.id,
      ...req.body,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error adding person',
      error: error.message,
    });
  }
};

export const approveCampRequestController = async (req, res) => {
  try {
    const result = await approveCampRequest(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error approving request',
      error: error.message,
    });
  }
};

export const rejectCampRequestController = async (req, res) => {
  try {
    const result = await rejectCampRequest(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error rejecting request',
      error: error.message,
    });
  }
};

export const getCampRequestsController = async (req, res) => {
  try {
    const data = await getCampRequests();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching requests',
      error: error.message,
    });
  }
};
