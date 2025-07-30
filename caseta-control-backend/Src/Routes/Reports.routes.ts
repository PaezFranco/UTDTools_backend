import { Router } from 'express';
import { 
  authenticateToken, 
  requireSupervisorOrAdmin 
} from '../Middlewares/Auth.middleware';
import {
  generateMaintenanceReport,
  generateUsageOptimizationReport,
  generateStudentBehaviorReport,
  generateEfficiencyReport,
  generateInventoryReport
} from '../Controllers/Reports.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);
router.use(requireSupervisorOrAdmin);

// Rutas de generación de reportes con IA
router.post('/maintenance', generateMaintenanceReport);
router.post('/optimization', generateUsageOptimizationReport);
router.post('/behavior', generateStudentBehaviorReport);
router.post('/efficiency', generateEfficiencyReport);
router.post('/inventory', generateInventoryReport);

export default router;