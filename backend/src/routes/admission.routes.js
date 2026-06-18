import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { getAIEvaluationController } from '../controllers/ai.controller.js';
import {
  createAdmission,
  decideAdmission,
  getAllAdmissions,
  getAdmissionById,
} from '../controllers/admission.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', createAdmission);

router.get('/', authorizeRoles('Admin', 'SuperAdmin'), getAllAdmissions);

router.get('/:id', getAdmissionById);

router.get('/:request_id/evaluation', authenticate, getAIEvaluationController);

router.patch(
  '/:id/decide',
  authorizeRoles('Admin', 'SuperAdmin'),
  decideAdmission,
);

export default router;
