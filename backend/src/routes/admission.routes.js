import { Router } from 'express';
import { createAdmissionController } from '../controllers/admission.controller.js';
import { approveAdmissionController } from '../controllers/admission.controller.js';
import { getAdmissionsController } from '../controllers/admission.controller.js';
import { rejectAdmissionController } from '../controllers/admission.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.post('/admissions', createAdmissionController);

router.get(
  '/admissions',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  getAdmissionsController,
);

router.put(
  '/admissions/:id/approve',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  approveAdmissionController,
);

router.put(
  '/admissions/:id/reject',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  rejectAdmissionController,
);

export default router;
