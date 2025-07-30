// import { Router } from 'express';
// import { 
//   authenticateToken, 
//   requireSupervisorOrAdmin,
//   authLogger 
// } from '../Middlewares/Auth.middleware';
// import {
//   getOverdueLoans,
//   notifyStudent,
//   blockStudentForOverdue,
//   getOverdueStats
// } from '../Controllers/Overdue.controller';

// const router = Router();

// // Aplicar logging de autenticación en desarrollo
// if (process.env.NODE_ENV === 'development') {
//   router.use(authLogger);
// }

// // Todas las rutas requieren autenticación
// router.use(authenticateToken);

// // ========== RUTAS DE CONSULTA ==========

// // Obtener todos los préstamos vencidos
// router.get('/loans', requireSupervisorOrAdmin, getOverdueLoans);

// // Obtener estadísticas de préstamos vencidos
// router.get('/stats', requireSupervisorOrAdmin, getOverdueStats);

// // ========== RUTAS DE ACCIÓN ==========

// // Notificar estudiante sobre préstamo vencido
// router.post('/notify', requireSupervisorOrAdmin, notifyStudent);

// // Bloquear estudiante por préstamos vencidos
// router.post('/block-student', requireSupervisorOrAdmin, blockStudentForOverdue);

// export default router;

import { Router } from 'express';
import { 
  authenticateToken, 
  requireSupervisorOrAdmin,
  authLogger 
} from '../Middlewares/Auth.middleware';
import {
  getOverdueLoans,
  notifyStudent,
  blockStudentForOverdue,
  getOverdueStats
} from '../Controllers/Overdue.controller';

const router = Router();

// Aplicar logging de autenticación en desarrollo
if (process.env.NODE_ENV === 'development') {
  router.use(authLogger);
}

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// ========== RUTAS DE CONSULTA ==========

// Obtener todos los préstamos vencidos
router.get('/loans', requireSupervisorOrAdmin, getOverdueLoans);

// Obtener estadísticas de préstamos vencidos
router.get('/stats', requireSupervisorOrAdmin, getOverdueStats);

// ========== RUTAS DE ACCIÓN ==========

// Notificar estudiante sobre préstamo vencido (AHORA CON EMAIL)
router.post('/notify', requireSupervisorOrAdmin, notifyStudent);

// Bloquear estudiante por préstamos vencidos
router.post('/block-student', requireSupervisorOrAdmin, blockStudentForOverdue);

export default router;