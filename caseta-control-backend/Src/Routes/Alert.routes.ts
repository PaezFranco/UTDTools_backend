import { Router } from 'express';
import { getStudentAlerts } from '../Controllers/Alert.controller';
import { verifyToken } from '../Middlewares/Auth.middleware';

const router = Router();

router.get('/student', verifyToken, getStudentAlerts);

export default router;
