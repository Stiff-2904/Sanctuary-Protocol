import { Router } from 'express';
import { createCampRequestController } from '../controllers/campRequest.controller.js';
import { addResourceController } from '../controllers/campRequest.controller.js';
import { addPersonController } from '../controllers/campRequest.controller.js';
import { approveCampRequestController } from '../controllers/campRequest.controller.js';
import { rejectCampRequestController } from '../controllers/campRequest.controller.js';
import { getCampRequestsController } from '../controllers/campRequest.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

// create camp request (only SuperAdmin and ExpeditionManager)
router.post(
  '/camp-requests',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  createCampRequestController,
);

// add resources to camp request (only SuperAdmin and ExpeditionManager)
router.post(
  '/camp-requests/:id/resources',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  addResourceController,
);

// add persons to camp request (only SuperAdmin and ExpeditionManager)
router.post(
  '/camp-requests/:id/persons',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  addPersonController,
);

// approve
router.put(
  '/camp-requests/:id/approve',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  approveCampRequestController,
);

// reject
router.put(
  '/camp-requests/:id/reject',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  rejectCampRequestController,
);

// see all
router.get(
  '/camp-requests',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  getCampRequestsController,
);

export default router;
