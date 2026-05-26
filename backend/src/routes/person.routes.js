import { Router } from 'express';
import { getPersonsController } from '../controllers/person.controller.js';
import { getPersonByIdController } from '../controllers/person.controller.js';
import { createPersonController } from '../controllers/person.controller.js';
import { updatePersonController } from '../controllers/person.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get(
  '/persons',
  authenticate,
  authorizeRoles('Admin', 'SuperAdmin'),
  getPersonsController,
);

router.get(
  '/persons/:id',
  authenticate,
  authorizeRoles('Admin', 'SuperAdmin'),
  getPersonByIdController,
);

router.post(
  '/persons',
  authenticate,
  authorizeRoles('Admin', 'SuperAdmin'),
  createPersonController,
);

router.put(
  '/persons/:id',
  authenticate,
  authorizeRoles('Admin', 'SuperAdmin'),
  updatePersonController,
);

export default router;
