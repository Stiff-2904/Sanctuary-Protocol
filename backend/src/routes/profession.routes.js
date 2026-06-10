import { Router } from 'express';
import { getProfessionsController } from '../controllers/profession.controller.js';
import { getProfessionByIdController } from '../controllers/profession.controller.js';
import { createProfessionController } from '../controllers/profession.controller.js';
import { updateProfessionController } from '../controllers/profession.controller.js';

const router = Router();

router.get('/', getProfessionsController);
router.get('/:id', getProfessionByIdController);
router.post('/', createProfessionController);
router.put('/:id', updateProfessionController);

export default router;
