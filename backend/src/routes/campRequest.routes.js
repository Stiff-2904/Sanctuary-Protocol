import { Router } from 'express';
import { createCampRequestController } from '../controllers/campRequest.controller.js';
import { addResourceController } from '../controllers/campRequest.controller.js';
import { addPersonController } from '../controllers/campRequest.controller.js';
import { approveCampRequestController } from '../controllers/campRequest.controller.js';
import { rejectCampRequestController } from '../controllers/campRequest.controller.js';
import { getCampRequestsController } from '../controllers/campRequest.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', authenticate, authorizeRoles('SuperAdmin', 'ExpeditionManager'), getCampRequestsController);

router.post('/', authenticate, authorizeRoles('ExpeditionManager'), createCampRequestController);

router.post('/:id/resources', authenticate, authorizeRoles('ExpeditionManager'), addResourceController);

router.post('/:id/persons', authenticate, authorizeRoles('ExpeditionManager'), addPersonController);

router.put('/:id/approve', authenticate, authorizeRoles('SuperAdmin'), approveCampRequestController);

router.put('/:id/reject', authenticate, authorizeRoles('SuperAdmin'), rejectCampRequestController);

export default router;