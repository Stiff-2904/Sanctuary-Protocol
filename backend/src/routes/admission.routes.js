import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import {
  createAdmission,
  decideAdmission,
  getAllAdmissions,
  getAdmissionById,
  getAIEvaluationController,
} from '../controllers/admission.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', createAdmission);

router.get('/', authorizeRoles('Admin', 'SuperAdmin'), getAllAdmissions);

router.get('/:id', getAdmissionById);

router.patch(
  '/:id/decide',
  authorizeRoles('Admin', 'SuperAdmin'),
  decideAdmission,
);

router.get('/:request_id/evaluation', authenticate, getAIEvaluationController);

export default router;
