import { Router } from 'express';
import { getPersonsController } from '../controllers/person.controller.js';
import { getPersonByIdController } from '../controllers/person.controller.js';
import { createPersonController } from '../controllers/person.controller.js';
import { updatePersonController } from '../controllers/person.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Ver todas las personas (Admin y SuperAdmin)
router.get(
  '/persons',
  authenticate,
  authorizeRoles('Admin', 'SuperAdmin'),
  getPersonsController,
);

// Ver persona por ID (Admin y SuperAdmin)
router.get(
  '/persons/:id',
  authenticate,
  authorizeRoles('Admin', 'SuperAdmin'),
  getPersonByIdController,
);

// Crear persona (Admin y SuperAdmin)
router.post(
  '/persons',
  authenticate,
  authorizeRoles('Admin', 'SuperAdmin'),
  createPersonController,
);

// Actualizar persona (Admin y SuperAdmin)
router.put(
  '/persons/:id',
  authenticate,
  authorizeRoles('Admin', 'SuperAdmin'),
  updatePersonController,
);

export default router;