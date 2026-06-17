import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

import { processDailyProductionController } from '../controllers/production.controller.js';

const router = Router();

router.post(
  '/process-daily/:camp_id',
  authenticate,
  authorizeRoles('SuperAdmin', 'Admin'),
  processDailyProductionController,
);

export default router;
