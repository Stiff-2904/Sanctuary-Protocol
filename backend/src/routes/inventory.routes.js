import { Router } from 'express';
import { getInventoryController } from '../controllers/inventory.controller.js';
import { getInventoryByCampController } from '../controllers/inventory.controller.js';
import { addInventoryController } from '../controllers/inventory.controller.js';
import { updateInventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

// SEE ALL INVENTORY
router.get(
  '/inventory',
  authenticate,
  authorizeRoles('SuperAdmin'),
  getInventoryController,
);

// SEE INVENTORY BY CAMP (for Worker and ResourceManager)
router.get(
  '/inventory/me',
  authenticate,
  authorizeRoles('Worker', 'ResourceManager'),
  getInventoryByCampController,
);

// ADD INVENTORY (for ResourceManager and SuperAdmin)
router.post(
  '/inventory',
  authenticate,
  authorizeRoles('SuperAdmin', 'ResourceManager'),
  addInventoryController,
);

// UPDATE INVENTORY
router.put(
  '/inventory/:id',
  authenticate,
  authorizeRoles('SuperAdmin', 'ResourceManager', 'Worker'),
  updateInventoryController,
);

export default router;
