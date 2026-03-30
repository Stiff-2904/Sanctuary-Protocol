import { Router } from 'express';
import { getResourcesController } from '../controllers/resource.controller.js';
import { getResourceByIdController } from '../controllers/resource.controller.js';
import { createResourceController } from '../controllers/resource.controller.js';
import { updateResourceController } from '../controllers/resource.controller.js';

const router = Router();

router.get('/resources', getResourcesController);
router.get('/resources/:id', getResourceByIdController);
router.post('/resources', createResourceController);
router.put('/resources/:id', updateResourceController);

export default router;
