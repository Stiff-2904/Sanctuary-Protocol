import { Router } from 'express';
import { getCampsController } from '../controllers/camp.controller.js';

const router = Router();

router.get('/camps', getCampsController);

export default router;
