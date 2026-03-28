import { Router } from 'express';
import { getCampsController } from '../controllers/camp.controller.js';
import { createCampController } from '../controllers/camp.controller.js';
import { updateCampController } from '../controllers/camp.controller.js';

const router = Router();

router.get('/camps', getCampsController);

export default router;

router.post('/camps', createCampController);

router.put('/camps/:id', updateCampController);
