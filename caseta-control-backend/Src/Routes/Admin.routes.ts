import { Router } from 'express';
import {
  registerSupervisor,
  getAllSupervisors,
  toggleSupervisorStatus,
} from '../Controllers/Admin.controller';
import { verifyToken, isAdmin } from '../Middlewares/Auth.middleware';

const router = Router();

// Admin must be authenticated and be admin role
router.post('/supervisors', verifyToken, isAdmin, registerSupervisor);
router.get('/supervisors', verifyToken, isAdmin, getAllSupervisors);
router.put('/supervisors/:id/toggle', verifyToken, isAdmin, toggleSupervisorStatus);
router.get('/supervisors', getAllSupervisors);


export default router;
