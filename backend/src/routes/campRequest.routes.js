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

router.post(
  '/camp-requests',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  createCampRequestController,
);

router.post(
  '/camp-requests/:id/resources',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  addResourceController,
);

router.post(
  '/camp-requests/:id/persons',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  addPersonController,
);

router.put(
  '/camp-requests/:id/approve',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  approveCampRequestController,
);

router.put(
  '/camp-requests/:id/reject',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  rejectCampRequestController,
);

router.get(
  '/camp-requests',
  authenticate,
  authorizeRoles('SuperAdmin', 'ExpeditionManager'),
  getCampRequestsController,
);

export default router;
