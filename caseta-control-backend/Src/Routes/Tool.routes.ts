// import { Router } from 'express';
// import {
//   getAllTools,
//   getToolById,
//   createTool,
//   updateTool,
//   deleteTool,
//   getToolsByCategory,
//   getToolsByStatus,
//   checkUniqueId,
//   searchTools
// } from '../Controllers/Tool.controller';
// import { verifyToken, isAdmin, requireSupervisor } from '../Middlewares/Auth.middleware';

// const toolRouter = Router();

// // IMPORTANTE: Las rutas más específicas deben ir ANTES que las genéricas
// // Rutas públicas o con autenticación opcional
// toolRouter.get('/check/:uniqueId', checkUniqueId);
// toolRouter.get('/search/:query', verifyToken, searchTools);
// toolRouter.get('/category/:category', verifyToken, getToolsByCategory);
// toolRouter.get('/status/:status', verifyToken, getToolsByStatus);

// // Rutas principales protegidas
// toolRouter.get('/', verifyToken, getAllTools);
// toolRouter.get('/:id', verifyToken, getToolById);

// // Rutas que requieren permisos de administrador o supervisor
// toolRouter.post('/', verifyToken, requireSupervisor, createTool);
// toolRouter.put('/:id', verifyToken, requireSupervisor, updateTool);
// toolRouter.delete('/:id', verifyToken, isAdmin, deleteTool);

// export default toolRouter;

import { Router } from 'express';

import {
  getAllTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
  getToolsByCategory,
  getToolsByStatus,
  checkUniqueId,
  searchTools,
  getToolsForStudents,
  searchToolsForStudents,
  getToolsByCategoryForStudents,
  getToolsPublic
} from '../Controllers/Tool.controller';
import { verifyToken, isAdmin, requireSupervisor } from '../Middlewares/Auth.middleware';

const toolRouter = Router();
toolRouter.get('/public/inventory', getToolsPublic);
// RUTAS PARA ESTUDIANTES (solo lectura)
toolRouter.get('/students/inventory', verifyToken, getToolsForStudents);
toolRouter.get('/students/search/:query', verifyToken, searchToolsForStudents);
toolRouter.get('/students/category/:category', verifyToken, getToolsByCategoryForStudents);

// RUTAS ADMINISTRATIVAS
// Las rutas más específicas deben ir ANTES que las genéricas
toolRouter.get('/check/:uniqueId', checkUniqueId);
toolRouter.get('/search/:query', verifyToken, searchTools);
toolRouter.get('/category/:category', verifyToken, getToolsByCategory);
toolRouter.get('/status/:status', verifyToken, getToolsByStatus);

// Rutas principales protegidas
toolRouter.get('/', verifyToken, getAllTools);
toolRouter.get('/:id', verifyToken, getToolById);

// Rutas que requieren permisos de administrador o supervisor
toolRouter.post('/', verifyToken, requireSupervisor, createTool);
toolRouter.put('/:id', verifyToken, requireSupervisor, updateTool);
toolRouter.delete('/:id', verifyToken, isAdmin, deleteTool);

export default toolRouter;