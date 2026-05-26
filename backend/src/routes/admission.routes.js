import { Router } from 'express';
import {
  createAdmission,
  decideAdmission,
  getAllAdmissions,
  getAdmissionById,
} from '../controllers/admission.controller.js';
import {
  authenticate,
  authorizeRoles,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createAdmission);

router.get('/', authorizeRoles('admin', 'system_admin'), getAllAdmissions);

router.get('/:id', getAdmissionById);

router.patch(
  '/:id/decide',
  authorizeRoles('admin', 'system_admin'),
  decideAdmission,
);

export default router;
