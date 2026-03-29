import { Router } from 'express';
import { getInventoryController } from '../controllers/inventory.controller.js';
import { getInventoryByCampController } from '../controllers/inventory.controller.js';
import { addInventoryController } from '../controllers/inventory.controller.js';
import { updateInventoryController } from '../controllers/inventory.controller.js';

const router = Router();

router.get('/inventory', getInventoryController);
router.get('/inventory/:camp_id', getInventoryByCampController);
router.post('/inventory', addInventoryController);
router.put('/inventory/:id', updateInventoryController);

export default router;
