import { Router } from 'express';
import { getPersonsController } from '../controllers/person.controller.js';
import { getPersonByIdController } from '../controllers/person.controller.js';
import { createPersonController } from '../controllers/person.controller.js';
import { updatePersonController } from '../controllers/person.controller.js';

const router = Router();

router.get('/persons', getPersonsController);
router.get('/persons/:id', getPersonByIdController);
router.post('/persons', createPersonController);
router.put('/persons/:id', updatePersonController);

export default router;
