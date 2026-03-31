import { Router } from 'express';
import { createAdmissionController } from '../controllers/admission.controller.js';
import { approveAdmissionController } from '../controllers/admission.controller.js';
import { getAdmissionsController } from '../controllers/admission.controller.js';
import { rejectAdmissionController } from '../controllers/admission.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

// create admission (anyone can apply, no auth needed)
router.post('/admissions', createAdmissionController);

// see all admissions (only Admin and SuperAdmin)
router.get(
  '/admissions',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  getAdmissionsController,
);

// approve admission (only Admin and SuperAdmin)
router.put(
  '/admissions/:id/approve',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  approveAdmissionController,
);

// reject admission (only Admin and SuperAdmin)
router.put(
  '/admissions/:id/reject',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  rejectAdmissionController,
);

export default router;
