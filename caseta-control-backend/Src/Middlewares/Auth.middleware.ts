// import { Request, Response, NextFunction } from 'express';
// import jwt, { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';

// if (!process.env.JWT_SECRET) {
//   throw new Error('JWT_SECRET is not defined in environment variables.');
// }

// const JWT_SECRET = process.env.JWT_SECRET!;

// interface JWTPayload {
//   id: string;
//   role: 'student' | 'supervisor' | 'admin';
//   email?: string;
//   name?: string;
//   iat: number;
//   exp: number;
// }

// // Tipos para los errores de JWT
// type JWTError = JsonWebTokenError | TokenExpiredError | NotBeforeError;

// // Extender Request para incluir user
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         role: 'student' | 'supervisor' | 'admin';
//         email?: string;
//         name?: string;
//       };
//     }
//   }
// }

// // ========== Verificar Token de Acceso (con soporte para cookies) ==========
// export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Buscar token en cookies primero, luego en headers
//     let token = req.cookies?.authToken;
    
//     if (!token) {
//       const authHeader = req.headers['authorization'];
//       if (authHeader) {
//         token = authHeader.split(' ')[1]; // Bearer TOKEN
//       }
//     }

//     if (!token) {
//       return res.status(401).json({
//         message: 'Access token not provided',
//         code: 'NO_TOKEN'
//       });
//     }

//     jwt.verify(token, JWT_SECRET, (err: JWTError | null, decoded: string | jwt.JwtPayload | undefined) => {
//       if (err) {
//         // Limpiar cookie si es inválido
//         if (req.cookies?.authToken) {
//           res.clearCookie('authToken');
//         }
        
//         if (err.name === 'TokenExpiredError') {
//           return res.status(401).json({
//             message: 'Access token expired',
//             code: 'TOKEN_EXPIRED'
//           });
//         }

//         return res.status(401).json({
//           message: 'Invalid access token',
//           code: 'INVALID_TOKEN'
//         });
//       }

//       if (!decoded || typeof decoded === 'string') {
//         return res.status(401).json({
//           message: 'Invalid token payload',
//           code: 'INVALID_PAYLOAD'
//         });
//       }

//       const payload = decoded as JWTPayload;
//       req.user = {
//         id: payload.id,
//         role: payload.role,
//         email: payload.email,
//         name: payload.name
//       };

//       // También mantener compatibilidad con tu código actual
//       req.body.userId = payload.id;

//       console.log('Token verified successfully for user:', payload.email || payload.id);
//       next();
//     });
//   } catch (error) {
//     console.error('Error verifying token:', error);
//     return res.status(500).json({
//       message: 'Error verifying token',
//       error: error
//     });
//   }
// };

// // ========== Verificar Rol de Usuario ==========
// export const requireRole = (roles: ('student' | 'supervisor' | 'admin')[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ 
//         message: 'User not authenticated',
//         code: 'NO_USER'
//       });
//     }

//     if (!roles.includes(req.user.role)) {
//       console.log(`Access denied. User role: ${req.user.role}, Required roles: ${roles.join(', ')}`);
//       return res.status(403).json({
//         message: 'Insufficient permissions',
//         code: 'INSUFFICIENT_PERMISSIONS',
//         required_roles: roles,
//         user_role: req.user.role
//       });
//     }

//     console.log(`Access granted. User role: ${req.user.role} matches required roles: ${roles.join(', ')}`);
//     next();
//   };
// };

// // ========== Middleware Solo para Estudiantes ==========
// export const requireStudent = requireRole(['student']);

// // ========== Middleware Solo para Supervisores (incluye admin) ==========
// export const requireSupervisor = requireRole(['supervisor', 'admin']);

// // ========== Middleware Solo para Administradores ==========
// export const isAdmin = requireRole(['admin']);

// // ========== Middleware que permite supervisor y admin ==========
// export const requireSupervisorOrAdmin = requireRole(['supervisor', 'admin']);

// // ========== Middleware Opcional (no falla si no hay token) ==========
// export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Buscar token en cookies primero, luego en headers
//     let token = req.cookies?.authToken;
    
//     if (!token) {
//       const authHeader = req.headers['authorization'];
//       if (authHeader) {
//         token = authHeader.split(' ')[1]; // Bearer TOKEN
//       }
//     }

//     if (!token) {
//       return next(); // Continuar sin autenticación
//     }

//     jwt.verify(token, JWT_SECRET, (err: JWTError | null, decoded: string | jwt.JwtPayload | undefined) => {
//       if (!err && decoded && typeof decoded !== 'string') {
//         const payload = decoded as JWTPayload;
//         req.user = {
//           id: payload.id,
//           role: payload.role,
//           email: payload.email,
//           name: payload.name
//         };
//         req.body.userId = payload.id;
//         console.log('Optional auth - Token verified for user:', payload.email || payload.id);
//       } else {
//         console.log('Optional auth - Invalid token, continuing without authentication');
//       }

//       next(); // Continuar independientemente del resultado
//     });
//   } catch (error) {
//     console.error('Error in optional auth:', error);
//     next(); // Continuar sin autenticación en caso de error
//   }
// };

// // ========== Middleware para verificar si es propietario del recurso ==========
// export const requireOwnershipOrSupervisor = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       message: 'User not authenticated',
//       code: 'NO_USER'
//     });
//   }

//   // Si es admin o supervisor, puede acceder a cualquier recurso
//   if (['admin', 'supervisor'].includes(req.user.role)) {
//     return next();
//   }

//   // Si es estudiante, solo puede acceder a sus propios recursos
//   const resourceUserId = req.params.userId || req.params.studentId || req.body.student_id;
//   if (req.user.role === 'student' && req.user.id === resourceUserId) {
//     return next();
//   }

//   return res.status(403).json({
//     message: 'Access denied. You can only access your own resources.',
//     code: 'OWNERSHIP_REQUIRED'
//   });
// };


// import { Request, Response, NextFunction } from 'express';
// import jwt, { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';

// if (!process.env.JWT_SECRET) {
//   throw new Error('JWT_SECRET is not defined in environment variables.');
// }

// const JWT_SECRET = process.env.JWT_SECRET!;

// interface JWTPayload {
//   id: string;
//   role: 'student' | 'supervisor' | 'admin';
//   email?: string;
//   name?: string;
//   iat: number;
//   exp: number;
// }

// // Tipos para los errores de JWT
// type JWTError = JsonWebTokenError | TokenExpiredError | NotBeforeError;

// // Extender Request para incluir user (compatible con el sistema de devoluciones)
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         _id: string; // Alias para compatibilidad
//         role: 'student' | 'supervisor' | 'admin';
//         email?: string;
//         name?: string;
//       };
//     }
//   }
// }

// // ========== Función para extraer token (mejorada) ==========
// const extractToken = (req: Request): string | null => {
//   // Prioridad 1: Cookie (más seguro)
//   if (req.cookies && req.cookies.authToken) {
//     return req.cookies.authToken;
//   }
  
//   // Prioridad 2: Header Authorization
//   const authHeader = req.headers.authorization || req.headers['authorization'];
//   if (authHeader && authHeader.startsWith('Bearer ')) {
//     return authHeader.substring(7);
//   }
  
//   return null;
// };

// // ========== Verificar Token de Acceso (actualizado para devoluciones) ==========
// export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = extractToken(req);

//     if (!token) {
//       console.log('No token provided in request');
//       return res.status(401).json({
//         message: 'Token de acceso requerido',
//         code: 'NO_TOKEN'
//       });
//     }

//     jwt.verify(token, JWT_SECRET, (err: JWTError | null, decoded: string | jwt.JwtPayload | undefined) => {
//       if (err) {
//         // Limpiar cookie si es inválido
//         if (req.cookies?.authToken) {
//           res.clearCookie('authToken');
//         }
        
//         console.error('Token verification failed:', err.message);
        
//         if (err.name === 'TokenExpiredError') {
//           return res.status(401).json({
//             message: 'Token expirado',
//             code: 'TOKEN_EXPIRED'
//           });
//         } else if (err.name === 'JsonWebTokenError') {
//           return res.status(401).json({
//             message: 'Token inválido',
//             code: 'INVALID_TOKEN'
//           });
//         } else if (err.name === 'NotBeforeError') {
//           return res.status(401).json({
//             message: 'Token no válido aún',
//             code: 'TOKEN_NOT_ACTIVE'
//           });
//         }

//         return res.status(401).json({
//           message: 'Error de autenticación',
//           code: 'AUTH_ERROR'
//         });
//       }

//       if (!decoded || typeof decoded === 'string') {
//         return res.status(401).json({
//           message: 'Payload de token inválido',
//           code: 'INVALID_PAYLOAD'
//         });
//       }

//       const payload = decoded as JWTPayload;
      
//       // Configurar usuario en request (compatible con sistema de devoluciones)
//       req.user = {
//         id: payload.id,
//         _id: payload.id, // Alias para compatibilidad
//         role: payload.role,
//         email: payload.email,
//         name: payload.name
//       };

//       // También mantener compatibilidad con tu código actual
//       req.body.userId = payload.id;

//       console.log('Token verified successfully for user:', payload.email || payload.id);
//       next();
//     });
//   } catch (error) {
//     console.error('Error verifying token:', error);
//     return res.status(500).json({
//       message: 'Error verificando token',
//       error: process.env.NODE_ENV === 'development' ? error : undefined
//     });
//   }
// };

// // ========== Alias para compatibilidad con el sistema de devoluciones ==========
// export const authenticateToken = verifyToken;

// // ========== Verificar Rol de Usuario ==========
// export const requireRole = (roles: ('student' | 'supervisor' | 'admin')[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ 
//         message: 'Usuario no autenticado',
//         code: 'NO_USER'
//       });
//     }

//     if (!roles.includes(req.user.role)) {
//       console.log(`Access denied. User role: ${req.user.role}, Required roles: ${roles.join(', ')}`);
//       return res.status(403).json({
//         message: 'No tiene permisos para acceder a este recurso',
//         code: 'INSUFFICIENT_PERMISSIONS',
//         requiredRoles: roles,
//         userRole: req.user.role
//       });
//     }

//     console.log(`Access granted. User role: ${req.user.role} matches required roles: ${roles.join(', ')}`);
//     next();
//   };
// };

// // ========== Middleware Solo para Estudiantes ==========
// export const requireStudent = requireRole(['student']);

// // ========== Middleware Solo para Supervisores (incluye admin) ==========
// export const requireSupervisor = requireRole(['supervisor', 'admin']);

// // ========== Middleware Solo para Administradores ==========
// export const isAdmin = requireRole(['admin']);
// export const requireAdmin = requireRole(['admin']);

// // ========== Middleware que permite supervisor y admin (para devoluciones) ==========
// export const requireSupervisorOrAdmin = requireRole(['supervisor', 'admin']);

// // ========== Middleware para autorizar roles específicos (nueva función) ==========
// export const authorizeRoles = (allowedRoles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ 
//         message: 'Usuario no autenticado',
//         code: 'NOT_AUTHENTICATED'
//       });
//     }

//     const userRole = req.user.role;
    
//     if (!allowedRoles.includes(userRole)) {
//       console.log(`Access denied for role: ${userRole}. Required: ${allowedRoles.join(', ')}`);
//       return res.status(403).json({ 
//         message: 'No tiene permisos para acceder a este recurso',
//         code: 'INSUFFICIENT_PERMISSIONS',
//         requiredRoles: allowedRoles,
//         userRole
//       });
//     }

//     console.log(`Access granted for role: ${userRole}`);
//     next();
//   };
// };

// // ========== Middleware Opcional (no falla si no hay token) ==========
// export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = extractToken(req);

//     if (!token) {
//       console.log('Optional auth - No token provided, continuing without authentication');
//       return next(); // Continuar sin autenticación
//     }

//     jwt.verify(token, JWT_SECRET, (err: JWTError | null, decoded: string | jwt.JwtPayload | undefined) => {
//       if (!err && decoded && typeof decoded !== 'string') {
//         const payload = decoded as JWTPayload;
//         req.user = {
//           id: payload.id,
//           _id: payload.id, // Alias para compatibilidad
//           role: payload.role,
//           email: payload.email,
//           name: payload.name
//         };
//         req.body.userId = payload.id;
//         console.log('Optional auth - Token verified for user:', payload.email || payload.id);
//       } else {
//         console.log('Optional auth - Invalid token, continuing without authentication');
//       }

//       next(); // Continuar independientemente del resultado
//     });
//   } catch (error) {
//     console.error('Error in optional auth:', error);
//     next(); // Continuar sin autenticación en caso de error
//   }
// };

// // ========== Middleware para verificar si es propietario del recurso ==========
// export const requireOwnershipOrSupervisor = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       message: 'Usuario no autenticado',
//       code: 'NO_USER'
//     });
//   }

//   // Si es admin o supervisor, puede acceder a cualquier recurso
//   if (['admin', 'supervisor'].includes(req.user.role)) {
//     return next();
//   }

//   // Si es estudiante, solo puede acceder a sus propios recursos
//   const resourceUserId = req.params.userId || req.params.studentId || req.params.studentCode || req.body.student_id;
//   if (req.user.role === 'student' && req.user.id === resourceUserId) {
//     return next();
//   }

//   return res.status(403).json({
//     message: 'Acceso denegado. Solo puede acceder a sus propios recursos.',
//     code: 'OWNERSHIP_REQUIRED'
//   });
// };

// // ========== Middleware para logs de autenticación (desarrollo) ==========
// export const authLogger = (req: Request, res: Response, next: NextFunction) => {
//   if (process.env.NODE_ENV === 'development') {
//     console.log(`Auth Request: ${req.method} ${req.path}`);
//     console.log('User:', req.user ? `${req.user.name || req.user.email} (${req.user.role})` : 'Not authenticated');
//     console.log('Cookies:', req.cookies);
//     console.log('Authorization Header:', req.headers.authorization ? 'Present' : 'Not present');
//   }
//   next();
// };

// // ========== Middleware específico para operaciones de devolución ==========
// export const requireReturnPermissions = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       message: 'Usuario no autenticado',
//       code: 'NO_USER'
//     });
//   }

//   // Solo supervisores y administradores pueden procesar devoluciones
//   if (!['supervisor', 'admin'].includes(req.user.role)) {
//     return res.status(403).json({
//       message: 'Solo supervisores y administradores pueden procesar devoluciones',
//       code: 'INSUFFICIENT_PERMISSIONS_FOR_RETURNS',
//       userRole: req.user.role,
//       requiredRoles: ['supervisor', 'admin']
//     });
//   }

//   console.log(`Return operation authorized for ${req.user.role}: ${req.user.name || req.user.email}`);
//   next();
// };



import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables.');
}

const JWT_SECRET = process.env.JWT_SECRET!;

interface JWTPayload {
  id: string;
  role: 'student' | 'supervisor' | 'admin';
  email?: string;
  name?: string;
  iat: number;
  exp: number;
}

// Tipos para los errores de JWT
type JWTError = JsonWebTokenError | TokenExpiredError | NotBeforeError;

// Extender Request para incluir user (compatible con el sistema de devoluciones)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id: string; // Alias para compatibilidad
        role: 'student' | 'supervisor' | 'admin';
        email?: string;
        name?: string;
      };
    }
  }
}

// ========== Función para extraer token (mejorada) ==========
const extractToken = (req: Request): string | null => {
  // Prioridad 1: Cookie (más seguro)
  if (req.cookies && req.cookies.authToken) {
    return req.cookies.authToken;
  }
  
  // Prioridad 2: Header Authorization
  const authHeader = req.headers.authorization || req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

// ========== Verificar Token de Acceso (actualizado para devoluciones) ==========
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({
        message: 'Token de acceso requerido',
        code: 'NO_TOKEN'
      });
    }

    jwt.verify(token, JWT_SECRET, (err: JWTError | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (err) {
        // Limpiar cookie si es inválido
        if (req.cookies?.authToken) {
          res.clearCookie('authToken');
        }
        
        console.error('Token verification failed:', err.message);
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            message: 'Token expirado',
            code: 'TOKEN_EXPIRED'
          });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            message: 'Token inválido',
            code: 'INVALID_TOKEN'
          });
        } else if (err.name === 'NotBeforeError') {
          return res.status(401).json({
            message: 'Token no válido aún',
            code: 'TOKEN_NOT_ACTIVE'
          });
        }

        return res.status(401).json({
          message: 'Error de autenticación',
          code: 'AUTH_ERROR'
        });
      }

      if (!decoded || typeof decoded === 'string') {
        return res.status(401).json({
          message: 'Payload de token inválido',
          code: 'INVALID_PAYLOAD'
        });
      }

      const payload = decoded as JWTPayload;
      
      // Configurar usuario en request (compatible con sistema de devoluciones)
      req.user = {
        id: payload.id,
        _id: payload.id, // Alias para compatibilidad
        role: payload.role,
        email: payload.email,
        name: payload.name
      };

      // También mantener compatibilidad con tu código actual
      req.body.userId = payload.id;

      console.log('Token verified successfully for user:', payload.email || payload.id);
      next();
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({
      message: 'Error verificando token',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// ========== Alias para compatibilidad con el sistema de devoluciones ==========
export const authenticateToken = verifyToken;

// ========== Verificar Rol de Usuario ==========
export const requireRole = (roles: ('student' | 'supervisor' | 'admin')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado',
        code: 'NO_USER'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`Access denied. User role: ${req.user.role}, Required roles: ${roles.join(', ')}`);
      return res.status(403).json({
        message: 'No tiene permisos para acceder a este recurso',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    console.log(`Access granted. User role: ${req.user.role} matches required roles: ${roles.join(', ')}`);
    next();
  };
};

// ========== Middleware Solo para Estudiantes ==========
export const requireStudent = requireRole(['student']);

// ========== Middleware Solo para Supervisores (incluye admin) ==========
export const requireSupervisor = requireRole(['supervisor', 'admin']);

// ========== Middleware Solo para Administradores ==========
export const isAdmin = requireRole(['admin', 'supervisor']);
export const requireAdmin = requireRole(['admin', 'supervisor']);

// ========== Middleware que permite supervisor y admin (para devoluciones) ==========
export const requireSupervisorOrAdmin = requireRole(['supervisor', 'admin']);

// ========== Middleware para autorizar roles específicos (nueva función) ==========
export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      console.log(`Access denied for role: ${userRole}. Required: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        message: 'No tiene permisos para acceder a este recurso',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole
      });
    }

    console.log(`Access granted for role: ${userRole}`);
    next();
  };
};

// ========== Middleware Opcional (no falla si no hay token) ==========
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    if (!token) {
      console.log('Optional auth - No token provided, continuing without authentication');
      return next(); // Continuar sin autenticación
    }

    jwt.verify(token, JWT_SECRET, (err: JWTError | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (!err && decoded && typeof decoded !== 'string') {
        const payload = decoded as JWTPayload;
        req.user = {
          id: payload.id,
          _id: payload.id, // Alias para compatibilidad
          role: payload.role,
          email: payload.email,
          name: payload.name
        };
        req.body.userId = payload.id;
        console.log('Optional auth - Token verified for user:', payload.email || payload.id);
      } else {
        console.log('Optional auth - Invalid token, continuing without authentication');
      }

      next(); // Continuar independientemente del resultado
    });
  } catch (error) {
    console.error('Error in optional auth:', error);
    next(); // Continuar sin autenticación en caso de error
  }
};

// ========== Middleware para verificar si es propietario del recurso ==========
export const requireOwnershipOrSupervisor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Usuario no autenticado',
      code: 'NO_USER'
    });
  }

  // Si es admin o supervisor, puede acceder a cualquier recurso
  if (['admin', 'supervisor'].includes(req.user.role)) {
    return next();
  }

  // Si es estudiante, solo puede acceder a sus propios recursos
  const resourceUserId = req.params.userId || req.params.studentId || req.params.studentCode || req.body.student_id;
  if (req.user.role === 'student' && req.user.id === resourceUserId) {
    return next();
  }

  return res.status(403).json({
    message: 'Acceso denegado. Solo puede acceder a sus propios recursos.',
    code: 'OWNERSHIP_REQUIRED'
  });
};

// ========== Middleware para logs de autenticación (desarrollo) ==========
export const authLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Auth Request: ${req.method} ${req.path}`);
    console.log('User:', req.user ? `${req.user.name || req.user.email} (${req.user.role})` : 'Not authenticated');
    console.log('Cookies:', req.cookies);
    console.log('Authorization Header:', req.headers.authorization ? 'Present' : 'Not present');
  }
  next();
};

// ========== Middleware específico para operaciones de devolución ==========
export const requireReturnPermissions = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Usuario no autenticado',
      code: 'NO_USER'
    });
  }

  // Solo supervisores y administradores pueden procesar devoluciones
  if (!['supervisor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Solo supervisores y administradores pueden procesar devoluciones',
      code: 'INSUFFICIENT_PERMISSIONS_FOR_RETURNS',
      userRole: req.user.role,
      requiredRoles: ['supervisor', 'admin']
    });
  }

  console.log(`Return operation authorized for ${req.user.role}: ${req.user.name || req.user.email}`);
  next();
};