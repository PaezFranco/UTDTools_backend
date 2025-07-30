import { Router } from 'express';
import {
  getAllLoans,
  getLoanById,
  createLoan,
  createLoanWithValidation,
  returnLoan,
  getLoansByStudentId,
  getLoansByStudentCode,
  getActiveLoansSimple,
  getLoansBasic
} from '../Controllers/Loan.controller';
import { verifyToken, isAdmin, requireSupervisor } from '../Middlewares/Auth.middleware';

const loanRouter = Router();

// Rutas específicas deben ir antes que las genéricas
loanRouter.get('/student/:studentId', verifyToken, getLoansByStudentId);
loanRouter.get('/student-code/:studentCode', verifyToken, getLoansByStudentCode);

// Ruta para crear préstamo con validaciones (requiere permisos de supervisor o admin)
loanRouter.post('/create-with-validation', verifyToken, requireSupervisor, createLoanWithValidation);

// Rutas principales
loanRouter.get('/', verifyToken, getAllLoans);
loanRouter.get('/:id', verifyToken, getLoanById);
loanRouter.post('/', verifyToken, requireSupervisor, createLoan);

// Ruta para devolver préstamo (requiere permisos de supervisor o admin)
loanRouter.put('/:id/return', verifyToken, requireSupervisor, returnLoan);
loanRouter.get('/active/:studentEmail', getActiveLoansSimple);
loanRouter.get('/basic-test', getLoansBasic);
export default loanRouter;