// import { Router } from 'express';
// import { 
//   getAllStudents, 
//   getStudentById, 
//   getStudentByStudentId,
//   createStudent,
//   updateStudentProfile,
//   registerFingerprint,
//   verifyFingerprint,
//   getStudentsWithFingerprint,
//   toggleStudentBlock,
//   deleteStudent,
//   searchStudents,
//   getStudentByCode
// } from '../Controllers/Student.controller';
// import { verifyToken } from '../Middlewares/Auth.middleware';

// const studentRouter = Router();

// // Aplicar middleware de autenticación a todas las rutas
// studentRouter.use(verifyToken);

// // Rutas básicas CRUD - Todas protegidas
// studentRouter.get('/', getAllStudents);                    // GET /api/students
// studentRouter.get('/search', searchStudents);              // GET /api/students/search?name=...&career=...
// studentRouter.get('/with-fingerprint', getStudentsWithFingerprint); // GET /api/students/with-fingerprint
// studentRouter.get('/:id', getStudentById);                 // GET /api/students/:id
// studentRouter.get('/by-student-id/:student_id', getStudentByStudentId); // GET /api/students/by-student-id/123456
// studentRouter.post('/', createStudent);                    // POST /api/students
// studentRouter.put('/:id', updateStudentProfile);           // PUT /api/students/:id
// studentRouter.delete('/:id', deleteStudent);               // DELETE /api/students/:id
// studentRouter.get('/by-code/:studentCode', getStudentByCode); // GET /api/students/by-code/123456

// // Rutas específicas para la aplicación C# y manejo de huellas - Todas protegidas
// studentRouter.post('/fingerprint/:student_id', registerFingerprint);   // POST /api/students/fingerprint/123456
// studentRouter.get('/fingerprint/verify/:student_id', verifyFingerprint); // GET /api/students/fingerprint/verify/123456
// studentRouter.put('/block/:student_id', toggleStudentBlock);            // PUT /api/students/block/123456

// // export default studentRouter;
// import { Router } from 'express';
// import { 
//   getAllStudents, 
//   getStudentById, 
//   getStudentByStudentId,
//   createStudent,
//   updateStudentProfile,
//   registerFingerprint,
//   verifyFingerprint,
//   getStudentsWithFingerprint,
//   toggleStudentBlock,
//   deleteStudent,
//   searchStudents,
//   getStudentByCode,
//   // NUEVOS IMPORTS
//   registerFromMobile,
//   getMobilePendingRegistrations,
//   completeMobileRegistration,
//   mobileLogin
// } from '../Controllers/Student.controller';
// import { verifyToken } from '../Middlewares/Auth.middleware';

// const studentRouter = Router();

// // ========== RUTAS SIN AUTENTICACIÓN (Para app móvil) ==========
// studentRouter.post('/mobile/register', registerFromMobile);     // POST /api/students/mobile/register
// studentRouter.post('/mobile/login', mobileLogin);               // POST /api/students/mobile/login

// // ========== RUTAS CON AUTENTICACIÓN (Para dashboard web) ==========
// // Aplicar middleware de autenticación a todas las demás rutas
// studentRouter.use(verifyToken);

// // Rutas para manejar registros pendientes
// studentRouter.get('/mobile/pending', getMobilePendingRegistrations);           // GET /api/students/mobile/pending
// studentRouter.put('/mobile/complete/:id', completeMobileRegistration);         // PUT /api/students/mobile/complete/:id (corregido)

// // Rutas básicas CRUD - Todas protegidas
// studentRouter.get('/', getAllStudents);                    // GET /api/students
// studentRouter.get('/search', searchStudents);              // GET /api/students/search?name=...&career=...
// studentRouter.get('/with-fingerprint', getStudentsWithFingerprint); // GET /api/students/with-fingerprint
// studentRouter.get('/:id', getStudentById);                 // GET /api/students/:id
// studentRouter.get('/by-student-id/:student_id', getStudentByStudentId); // GET /api/students/by-student-id/123456
// studentRouter.post('/', createStudent);                    // POST /api/students
// studentRouter.put('/:id', updateStudentProfile);           // PUT /api/students/:id
// studentRouter.delete('/:id', deleteStudent);               // DELETE /api/students/:id
// studentRouter.get('/by-code/:studentCode', getStudentByCode); // GET /api/students/by-code/123456

// // Rutas específicas para la aplicación C# y manejo de huellas - Todas protegidas
// studentRouter.post('/fingerprint/:student_id', registerFingerprint);   // POST /api/students/fingerprint/123456
// studentRouter.get('/fingerprint/verify/:student_id', verifyFingerprint); // GET /api/students/fingerprint/verify/123456
// studentRouter.put('/block/:student_id', toggleStudentBlock);            // PUT /api/students/block/123456

// export default studentRouter;

// import { Router } from 'express';
// import { 
//   getAllStudents, 
//   getStudentById, 
//   getStudentByStudentId,
//   createStudent,
//   updateStudentProfile,
//   registerFingerprint,
//   verifyFingerprint,
//   getStudentsWithFingerprint,
//   toggleStudentBlock,
//   deleteStudent,
//   searchStudents,
//   getStudentByCode,
//   registerFromMobile,
//   getMobilePendingRegistrations,
//   completeMobileRegistration,
//   mobileLogin
// } from '../Controllers/Student.controller';
// import { verifyToken } from '../Middlewares/Auth.middleware';

// const studentRouter = Router();

// /* 
// ========================
//   RUTAS PÚBLICAS (APP)
// ========================
// Estas rutas NO requieren token.
// Se utilizan para el registro e inicio de sesión desde la app móvil.
// */
// studentRouter.post('/mobile/register', registerFromMobile);  // POST /api/students/mobile/register
// studentRouter.post('/mobile-login', mobileLogin);           // POST /api/students/mobile/login

// /* 
// ========================
//   RUTAS PROTEGIDAS (WEB + C#)
// ========================
// Todas las rutas después de esta línea requieren JWT.
// */
// studentRouter.use(verifyToken);

// // Gestión de registros móviles (usado desde dashboard web)
// studentRouter.get('/mobile/pending', getMobilePendingRegistrations);            // GET /api/students/mobile/pending
// studentRouter.put('/mobile/complete/:id', completeMobileRegistration);          // PUT /api/students/mobile/complete/:id

// // CRUD completo
// studentRouter.get('/', getAllStudents);                                         // GET /api/students
// studentRouter.get('/search', searchStudents);                                   // GET /api/students/search
// studentRouter.get('/with-fingerprint', getStudentsWithFingerprint);            // GET /api/students/with-fingerprint
// studentRouter.get('/:id', getStudentById);                                      // GET /api/students/:id
// studentRouter.get('/by-student-id/:student_id', getStudentByStudentId);        // GET /api/students/by-student-id/:matricula
// studentRouter.post('/', createStudent);                                         // POST /api/students
// studentRouter.put('/:id', updateStudentProfile);                                // PUT /api/students/:id
// studentRouter.delete('/:id', deleteStudent);                                    // DELETE /api/students/:id
// studentRouter.get('/by-code/:studentCode', getStudentByCode);                  // GET /api/students/by-code/314123...

// // Funciones para biometría (desde app C#)
// studentRouter.post('/fingerprint/:student_id', registerFingerprint);           // POST /api/students/fingerprint/:id
// studentRouter.get('/fingerprint/verify/:student_id', verifyFingerprint);       // GET /api/students/fingerprint/verify/:id
// studentRouter.put('/block/:student_id', toggleStudentBlock);                   // PUT /api/students/block/:id

// export default studentRouter;

// Agregar estas rutas a tu archivo Student.routes.ts

import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  getStudentByStudentId,
  createStudent,
  updateStudentProfile,
  registerFingerprint,
  verifyFingerprint,
  getStudentsWithFingerprint,
  toggleStudentBlock,
  deleteStudent,
  searchStudents,
  getStudentByCode,
  registerFromMobile,
  getMobilePendingRegistrations,
  completeMobileRegistration,
  mobileLogin,
  getStudentByEmail,
  mobileLoginWithSync
} from '../Controllers/Student.controller';
import { verifyToken } from '../Middlewares/Auth.middleware';

const studentRouter = Router();

/*
========================
  RUTAS PÚBLICAS (APP)
========================
Estas rutas NO requieren token.
Se utilizan para el registro e inicio de sesión desde la app móvil.
*/
studentRouter.post('/mobile/register', registerFromMobile);           // POST /api/students/mobile/register
studentRouter.post('/mobile-login', mobileLoginWithSync);             // POST /api/students/mobile-login (con sincronización completa)
studentRouter.get('/by-email/:email', getStudentByEmail);             // GET /api/students/by-email/user@utd.edu.mx (para sincronización móvil)

/*
========================
  RUTAS PROTEGIDAS (WEB + C#)
========================
Todas las rutas después de esta línea requieren JWT.
*/
studentRouter.use(verifyToken);

// Gestión de registros móviles (usado desde dashboard web)
studentRouter.get('/mobile/pending', getMobilePendingRegistrations);            // GET /api/students/mobile/pending
studentRouter.put('/mobile/complete/:id', completeMobileRegistration);          // PUT /api/students/mobile/complete/:id

// CRUD completo
studentRouter.get('/', getAllStudents);                                         // GET /api/students
studentRouter.get('/search', searchStudents);                                   // GET /api/students/search
studentRouter.get('/with-fingerprint', getStudentsWithFingerprint);            // GET /api/students/with-fingerprint
studentRouter.get('/:id', getStudentById);                                      // GET /api/students/:id
studentRouter.get('/by-student-id/:student_id', getStudentByStudentId);        // GET /api/students/by-student-id/:matricula
studentRouter.post('/', createStudent);                                         // POST /api/students
studentRouter.put('/:id', updateStudentProfile);                                // PUT /api/students/:id
studentRouter.delete('/:id', deleteStudent);                                    // DELETE /api/students/:id
studentRouter.get('/by-code/:studentCode', getStudentByCode);                  // GET /api/students/by-code/314123...

// Funciones para biometría (desde app C#)
studentRouter.post('/fingerprint/:student_id', registerFingerprint);           // POST /api/students/fingerprint/:id
studentRouter.get('/fingerprint/verify/:student_id', verifyFingerprint);       // GET /api/students/fingerprint/verify/:id
studentRouter.put('/block/:student_id', toggleStudentBlock);                   // PUT /api/students/block/:id

export default studentRouter;