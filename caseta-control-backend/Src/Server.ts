// import dotenv from 'dotenv';
// dotenv.config();

// import app from './App';

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(` Server is running on port ${PORT}`);
//   console.log(` CORS configured for frontend: http://localhost:5173`);
// });

// ========== CARGAR VARIABLES DE ENTORNO PRIMERO ==========
import dotenv from 'dotenv';

// Configurar dotenv para funcionar en todos los entornos
dotenv.config();

// En producción, las variables también vienen del sistema
// Este log nos ayudará a diagnosticar
console.log('Environment check - NODE_ENV:', process.env.NODE_ENV);
console.log('Environment check - JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('Environment check - MONGO_URI exists:', !!process.env.MONGO_URI);

// ========== VERIFICAR VARIABLES CRÍTICAS ==========
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined in environment variables.');
  console.error('Please add JWT_SECRET to your environment');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}
console.log('Environment variables loaded successfully');

// ========== IMPORTAR APLICACIÓN ==========
import app from './App';

// ========== CONFIGURAR PUERTO E INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS configured for frontend: http://localhost:5173`);
  console.log(`MongoDB: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
  console.log(`JWT: ${process.env.JWT_SECRET ? 'Configured' : 'Missing'}`);
  console.log(`Email service: ${process.env.GMAIL_USER ? 'Ready' : 'Not configured'}`);
  console.log('All systems ready!');
});

// ========== MANEJO DE ERRORES ==========
server.on('error', (error: any) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default server;
