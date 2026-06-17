import { Router } from 'express';
import {
  evaluatePersonController,
  assignProfessionController,
  confirmDecisionController,
} from '../controllers/ai.Controller.js';

const router = Router();

router.post('/evaluate-person', evaluatePersonController);
router.post('/assign-profession', assignProfessionController);
router.put('/confirm-decision/:id', confirmDecisionController);

export default router;
