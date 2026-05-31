import { Router } from 'express';
import { getPersonsController } from '../controllers/person.controller.js';
import { getPersonByIdController } from '../controllers/person.controller.js';
import { createPersonController } from '../controllers/person.controller.js';
import { updatePersonController } from '../controllers/person.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, authorizeRoles('Admin', 'SuperAdmin'), getPersonsController);
router.get('/:id', authenticate, authorizeRoles('Admin', 'SuperAdmin'), getPersonByIdController);
router.post('/', authenticate, authorizeRoles('Admin', 'SuperAdmin'), createPersonController);
router.put('/:id', authenticate, authorizeRoles('Admin', 'SuperAdmin'), updatePersonController);

export default router;
