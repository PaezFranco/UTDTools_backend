import { Router } from 'express';
import { 
  authenticateToken, 
  requireSupervisorOrAdmin, 
  requireReturnPermissions,
  authLogger 
} from '../Middlewares/Auth.middleware';
import {
  getActiveLoansForStudent,
  getStudentByFingerprint,
  processReturn,
  verifyToolForReturn,
  getReturnHistory
} from '../Controllers/Return.controller';

const router = Router();

// Aplicar logging de autenticación en desarrollo
if (process.env.NODE_ENV === 'development') {
  router.use(authLogger);
}

// Todas las rutas requieren autenticación básica
router.use(authenticateToken);

// ========== RUTAS DE CONSULTA (requieren supervisor o admin) ==========

// Obtener préstamos activos de un estudiante por matrícula
router.get('/student/:studentCode/active-loans', 
  requireSupervisorOrAdmin, 
  getActiveLoansForStudent
);

// Buscar estudiante por huella dactilar
router.get('/student/fingerprint/:fingerprintId', 
  requireSupervisorOrAdmin, 
  getStudentByFingerprint
);

// Verificar herramienta para devolución
router.get('/verify-tool/:toolCode/student/:studentCode/loan/:loanId', 
  requireSupervisorOrAdmin, 
  verifyToolForReturn
);

// Obtener historial de devoluciones (con paginación)
router.get('/history', 
  requireSupervisorOrAdmin, 
  getReturnHistory
);

// ========== RUTAS DE ACCIÓN (requieren permisos específicos de devolución) ==========

// Procesar devolución de herramientas (requiere permisos especiales)
router.post('/process', 
  requireReturnPermissions, 
  processReturn
);

// ========== RUTAS ADICIONALES ÚTILES ==========

// Obtener devoluciones de un estudiante específico
router.get('/student/:studentCode/history', 
  requireSupervisorOrAdmin, 
  (req, res, next) => {
    // Pasar el studentCode como query parameter para reutilizar getReturnHistory
    req.query.studentCode = req.params.studentCode;
    next();
  },
  getReturnHistory
);

// Ruta de prueba para verificar autenticación
router.get('/test-auth', (req, res) => {
  res.json({
    message: 'Autenticación exitosa para el sistema de devoluciones',
    user: {
      id: req.user?.id,
      role: req.user?.role,
      name: req.user?.name,
      email: req.user?.email
    },
    permissions: {
      canViewLoans: ['supervisor', 'admin'].includes(req.user?.role || ''),
      canProcessReturns: ['supervisor', 'admin'].includes(req.user?.role || ''),
      canViewHistory: ['supervisor', 'admin'].includes(req.user?.role || '')
    }
  });
});

export default router;