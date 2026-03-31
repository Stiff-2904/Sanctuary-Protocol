import { Router } from 'express';
import { loginController } from '../controllers/auth.controller.js';
import { registerController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/auth/register', registerController);
router.post('/auth/login', loginController);

export default router;
