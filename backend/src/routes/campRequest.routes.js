import { Router } from 'express';
import { createCampRequestController } from '../controllers/campRequest.controller.js';
import { addResourceController } from '../controllers/campRequest.controller.js';
import { addPersonController } from '../controllers/campRequest.controller.js';
import { approveCampRequestController } from '../controllers/campRequest.controller.js';
import { rejectCampRequestController } from '../controllers/campRequest.controller.js';

const router = Router();

router.post('/camp-requests', createCampRequestController);

router.post('/camp-requests/:id/resources', addResourceController);
router.post('/camp-requests/:id/persons', addPersonController);

router.put('/camp-requests/:id/approve', approveCampRequestController);
router.put('/camp-requests/:id/reject', rejectCampRequestController);

export default router;
