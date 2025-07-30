import { Router } from 'express';
import { 
  loginSupervisor, 
  loginStudent, 
  registerStudent, 
  refreshToken, 
  logout, 
  logoutAllSessions 
} from '../Controllers/Auth.controller';
import { verifyToken } from '../Middlewares/Auth.middleware';

const authRouter = Router();

// ========== Rutas de Autenticación ==========
authRouter.post('/login/supervisor', loginSupervisor);  
authRouter.post('/login/student', loginStudent);        
authRouter.post('/register/student', registerStudent);  

// ========== Rutas de Token ==========
authRouter.post('/refresh', refreshToken);               

// ========== Rutas de Logout (requieren autenticación) ==========
authRouter.post('/logout', logout);                      
authRouter.post('/logout-all', verifyToken, logoutAllSessions); 

// ========== Ruta para verificar token (útil para el frontend) ==========
authRouter.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({ 
    message: 'Token valid', 
    user: req.user 
  });
});

export default authRouter;