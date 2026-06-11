import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

import {
  getExplorationsController,
  getExplorationByIdController,
  createExplorationController,
  updateExplorationController,
  assignPersonController,
  addResourceController,
  completeExplorationController,
} from '../controllers/exploration.controller.js';

const router = Router();

// READ
router.get(
  '/',
  authenticate,
  authorizeRoles('Admin', 'ExpeditionManager', 'SuperAdmin'),
  getExplorationsController,
);

router.get(
  '/:id',
  authenticate,
  authorizeRoles('Admin', 'ExpeditionManager', 'SuperAdmin'),
  getExplorationByIdController,
);

// CREATE
router.post(
  '/',
  authenticate,
  authorizeRoles('ExpeditionManager', 'SuperAdmin'),
  createExplorationController,
);

// UPDATE
router.put(
  '/:id',
  authenticate,
  authorizeRoles('ExpeditionManager', 'SuperAdmin'),
  updateExplorationController,
);

// ASSIGN PERSON
router.post(
  '/:id/persons',
  authenticate,
  authorizeRoles('ExpeditionManager', 'SuperAdmin'),
  assignPersonController,
);

// ADD RESOURCE TO RECOUNT
router.post(
  '/:id/resources',
  authenticate,
  authorizeRoles('ExpeditionManager', 'SuperAdmin'),
  addResourceController,
);

// COMPLETE EXPLORATION
router.post(
  '/:id/complete',
  authenticate,
  authorizeRoles('ExpeditionManager', 'SuperAdmin'),
  completeExplorationController,
);

export default router;