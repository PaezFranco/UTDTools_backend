// import { Router } from 'express';
// import { 
//   authenticateToken, 
//   requireSupervisorOrAdmin,
//   authLogger 
// } from '../Middlewares/Auth.middleware';
// import {
//   getCompleteHistory,
//   updateLoanDueDate,
//   getHistoryStats,
//    getStudentHistoryPublic,
//    testStudentData   
// } from '../Controllers/History.controller';

// const router = Router();

// // Aplicar logging de autenticación en desarrollo
// if (process.env.NODE_ENV === 'development') {
//   router.use(authLogger);
// }

// // Todas las rutas requieren autenticación
// router.use(authenticateToken);

// // ========== RUTAS DE CONSULTA ==========

// // Obtener historial completo con filtros y paginación
// router.get('/complete', requireSupervisorOrAdmin, getCompleteHistory);

// // Obtener estadísticas del historial
// router.get('/stats', requireSupervisorOrAdmin, getHistoryStats);

// // ========== RUTAS DE ACCIÓN ==========

// // Actualizar fecha límite de préstamo activo
// router.put('/loan/:loanId/due-date', requireSupervisorOrAdmin, updateLoanDueDate);

// // AGREGA al INICIO de History.routes.ts (antes de router.use(authenticateToken))
// router.get('/test/:studentEmail', testStudentData);

// // AGREGAR esta ruta ANTES de router.use(authenticateToken)
// router.get('/student/:studentEmail/public', getStudentHistoryPublic);

// // Aplicar logging de autenticación en desarrollo
// if (process.env.NODE_ENV === 'development') {
//   router.use(authLogger);
// }

// // Todas las demás rutas requieren autenticación
// router.use(authenticateToken);

// export default router;

// import { Router } from 'express';
// import { 
//   authenticateToken, 
//   requireSupervisorOrAdmin,
//   authLogger 
// } from '../Middlewares/Auth.middleware';
// import {
//   getCompleteHistory,
//   updateLoanDueDate,
//   getHistoryStats,
//   getStudentHistoryPublic,
//   testStudentData   
// } from '../Controllers/History.controller';

// const router = Router();

// // ========== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) ==========
// // ESTAS DEBEN IR PRIMERO, ANTES DE router.use(authenticateToken)

// router.get('/student/:studentEmail/public', getStudentHistoryPublic);
// router.get('/test/:studentEmail', testStudentData);

// // ========== MIDDLEWARE DE AUTENTICACIÓN ==========
// // Aplicar logging de autenticación en desarrollo
// if (process.env.NODE_ENV === 'development') {
//   router.use(authLogger);
// }

// // TODAS LAS RUTAS DE ABAJO REQUIEREN AUTENTICACIÓN
// router.use(authenticateToken);

// // ========== RUTAS PROTEGIDAS ==========

// // Obtener historial completo con filtros y paginación
// router.get('/complete', requireSupervisorOrAdmin, getCompleteHistory);

// // Obtener estadísticas del historial
// router.get('/stats', requireSupervisorOrAdmin, getHistoryStats);

// // Actualizar fecha límite de préstamo activo
// router.put('/loan/:loanId/due-date', requireSupervisorOrAdmin, updateLoanDueDate);

// export default router;

// REEMPLAZA todo tu History.routes.ts con esto (SIN AUTENTICACIÓN):

import { Router } from 'express';
import {
  getCompleteHistory,
  updateLoanDueDate,
  getHistoryStats,
  getStudentHistoryPublic  // NUEVA IMPORTACIÓN
} from '../Controllers/History.controller';

const router = Router();

// ========== TODAS LAS RUTAS SIN AUTENTICACIÓN ==========
router.get('/mobile/:studentEmail', getStudentHistoryPublic);
router.get('/complete', getCompleteHistory);
router.get('/stats', getHistoryStats);
router.put('/loan/:loanId/due-date', updateLoanDueDate);

export default router;