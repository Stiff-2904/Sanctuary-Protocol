import { Router } from 'express';
import { getResourcesController } from '../controllers/resource.controller.js';
import { getResourceByIdController } from '../controllers/resource.controller.js';
import { createResourceController } from '../controllers/resource.controller.js';
import { updateResourceController } from '../controllers/resource.controller.js';

const router = Router();

router.get('/', getResourcesController);
router.get('/:id', getResourceByIdController);
router.post('/', createResourceController);
router.put('/:id', updateResourceController);

export default router;