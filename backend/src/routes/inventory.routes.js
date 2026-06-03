import { Router } from 'express';
import { getInventoryController } from '../controllers/inventory.controller.js';
import { getInventoryByCampController } from '../controllers/inventory.controller.js';
import { addInventoryController } from '../controllers/inventory.controller.js';
import { updateInventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', authenticate, authorizeRoles('SuperAdmin'), getInventoryController);

router.get('/me', authenticate, authorizeRoles('Worker', 'ResourceManager', 'SuperAdmin'), getInventoryByCampController);

router.post('/', authenticate, authorizeRoles('SuperAdmin', 'ResourceManager'), addInventoryController);

router.put('/:id', authenticate, authorizeRoles('SuperAdmin', 'ResourceManager', 'Worker'), updateInventoryController);

export default router;