import { Router } from 'express';
import {
  getInventoryController,
  getInventoryByCampController,
  addInventoryController,
  updateInventoryController,
  getInventoryAlertsController,
  getResourceStatsController,
} from '../controllers/inventory.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorizeRoles('SuperAdmin'),
  getInventoryController,
);

router.get(
  '/me',
  authenticate,
  authorizeRoles(
    'Worker',
    'ResourceManager',
    'ExpeditionManager',
    'SuperAdmin',
  ),
  getInventoryByCampController,
);

router.post(
  '/',
  authenticate,
  authorizeRoles('SuperAdmin', 'ResourceManager'),
  addInventoryController,
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('SuperAdmin', 'ResourceManager', 'Worker'),
  updateInventoryController,
);

router.get(
  '/alerts',
  authenticate,
  authorizeRoles('SuperAdmin', 'ResourceManager', 'Admin'),
  getInventoryAlertsController,
);

router.get(
  '/stats',
  authenticate,
  authorizeRoles('SuperAdmin', 'ResourceManager', 'Admin'),
  getResourceStatsController,
);

export default router;
