import { Router } from 'express';
import { getCampsController } from '../controllers/camp.controller.js';
import { createCampController } from '../controllers/camp.controller.js';
import { updateCampController } from '../controllers/camp.controller.js';
import { getCampByIdController } from '../controllers/camp.controller.js';

const router = Router();

router.get('/', getCampsController);
router.get('/:id', getCampByIdController);
router.post('/', createCampController);
router.put('/:id', updateCampController);
export default router;
