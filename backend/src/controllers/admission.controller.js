import { createAdmission } from '../models/admission.model.js';
import { approveAdmission } from '../models/admission.model.js';
import { getAdmissions } from '../models/admission.model.js';
import { rejectAdmission } from '../models/admission.model.js';

export const createAdmissionController = async (req, res) => {
  try {
    const { person_id, camp_id, skills } = req.body;

    // validation
    if (!person_id || !camp_id) {
      return res.status(400).json({
        message: 'person_id and camp_id are required',
      });
    }

    if (!skills || skills.trim() === '') {
      return res.status(400).json({
        message: 'skills are required',
      });
    }

    const admission = await createAdmission({
      person_id,
      camp_id,
      skills,
    });

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating admission',
      error: error.message,
    });
  }
};

export const approveAdmissionController = async (req, res) => {
  try {
    const { id } = req.params;

    const approved_by = req.user?.user_id;

    const result = await approveAdmission(id, approved_by);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error approving admission',
      error: error.message,
    });
  }
};

export const getAdmissionsController = async (req, res) => {
  try {
    const admissions = await getAdmissions();
    res.json(admissions);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching admissions',
      error: error.message,
    });
  }
};

export const rejectAdmissionController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await rejectAdmission(id);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error rejecting admission',
      error: error.message,
    });
  }
};
