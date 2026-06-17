import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

import { getDashboardMetricsController } from '../controllers/metrics.controller.js';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  authorizeRoles('Admin', 'ResourceManager', 'ExpeditionManager', 'SuperAdmin', 'Worker'),
  getDashboardMetricsController,
);

export default router;