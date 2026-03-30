import { Router } from 'express';
import { getProfessionsController } from '../controllers/profession.controller.js';
import { getProfessionByIdController } from '../controllers/profession.controller.js';
import { createProfessionController } from '../controllers/profession.controller.js';
import { updateProfessionController } from '../controllers/profession.controller.js';

const router = Router();

router.get('/professions', getProfessionsController);
router.get('/professions/:id', getProfessionByIdController);
router.post('/professions', createProfessionController);
router.put('/professions/:id', updateProfessionController);

export default router;
