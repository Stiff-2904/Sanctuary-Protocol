import { Router } from 'express';
import { getInventoryController } from '../controllers/inventory.controller.js';
import { getInventoryByCampController } from '../controllers/inventory.controller.js';
import { addInventoryController } from '../controllers/inventory.controller.js';
import { updateInventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/inventory',
  authenticate,
  authorizeRoles('SuperAdmin'),
  getInventoryController,
);

router.get(
  '/inventory/me',
  authenticate,
  authorizeRoles('Worker', 'ResourceManager'),
  getInventoryByCampController,
);

router.post(
  '/inventory',
  authenticate,
  authorizeRoles('SuperAdmin', 'ResourceManager'),
  addInventoryController,
);

router.put(
  '/inventory/:id',
  authenticate,
  authorizeRoles('SuperAdmin', 'ResourceManager', 'Worker'),
  updateInventoryController,
);

export default router;
