import { Router } from 'express';
import { createCampRequestController } from '../controllers/campRequest.controller.js';
import { addResourceController } from '../controllers/campRequest.controller.js';
import { addPersonController } from '../controllers/campRequest.controller.js';
import { approveCampRequestController } from '../controllers/campRequest.controller.js';
import { rejectCampRequestController } from '../controllers/campRequest.controller.js';
import { getCampRequestsController } from '../controllers/campRequest.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { completeExpeditionController } from '../controllers/campRequest.controller.js';

const router = Router();

// GET ALL REQUESTS
router.get(
  '/',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  getCampRequestsController,
);

// CREATE REQUEST
router.post(
  '/',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  createCampRequestController,
);

// ADD RESOURCE TO REQUEST
router.post(
  '/:id/resources',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  addResourceController,
);

// ADD PERSON TO REQUEST
router.post(
  '/:id/persons',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  addPersonController,
);

// APPROVE REQUEST
router.put(
  '/:id/approve',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin', 'ExpeditionManager'),
  approveCampRequestController,
);

// REJECT REQUEST
router.put(
  '/:id/reject',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin', 'ExpeditionManager'),
  rejectCampRequestController,
);

router.post(
  '/:request_id/complete',
  authenticate,
  authorizeRoles('ExpeditionManager', 'SuperAdmin'),
  completeExpeditionController,
);

export default router;
