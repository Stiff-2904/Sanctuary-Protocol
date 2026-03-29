import { Router } from 'express';
import { createAdmissionController } from '../controllers/admission.controller.js';
import { approveAdmissionController } from '../controllers/admission.controller.js';
import { getAdmissionsController } from '../controllers/admission.controller.js';
import { rejectAdmissionController } from '../controllers/admission.controller.js';

const router = Router();

router.post('/admissions', createAdmissionController);

router.put('/admissions/:id/approve', approveAdmissionController);

router.get('/admissions', getAdmissionsController);

router.put('/admissions/:id/reject', rejectAdmissionController);

export default router;
