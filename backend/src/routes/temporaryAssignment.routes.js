import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

import {
  getTemporaryAssignmentsController,
  createTemporaryAssignmentController,
  endTemporaryAssignmentController,
  getTemporaryAssignmentHistoryController,
} from '../controllers/temporaryAssignment.controller.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  getTemporaryAssignmentsController,
);

router.get(
  '/history',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  getTemporaryAssignmentHistoryController,
);

router.post(
  '/',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  createTemporaryAssignmentController,
);

router.patch(
  '/:id/end',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  endTemporaryAssignmentController,
);

export default router;
