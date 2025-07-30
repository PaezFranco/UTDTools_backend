import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import lusca from 'lusca';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import fingerprintRoutes from './Routes/fingerprint.routes';
// Cargar variables de entorno PRIMERO
dotenv.config();

// Debug de configuración
console.log('🔧 Environment:', process.env.NODE_ENV || 'undefined');
console.log('🔧 Gmail user:', process.env.GMAIL_USER ? 'Set' : 'Not set');
console.log('🔧 Gmail password:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');

// Rutas
import authRoutes from './Routes/Auth.routes';
import studentRoutes from './Routes/Student.routes';
import supervisorRoutes from './Routes/Supervisor.routes';
import toolRoutes from './Routes/Tool.routes';
import loanRoutes from './Routes/Loan.routes';
import iaSuggestionRoutes from './Routes/IaSuggestion.routes';
import mobileRoutes from './Routes/Mobile.routes';
import returnRoutes from './Routes/Return.routes';
import overdueRoutes from './Routes/Overdue.routes'; 
import reportsRoutes from './Routes/Reports.routes';
import historyRoutes from './Routes/History.routes';
import emailRoutes from './Routes/Email.routes';
import { errorHandler } from './Middlewares/Error.middleware';

const app = express();

app.disable('x-powered-by');

// Rate limiting para prevenir ataques
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate limiting específico para emails (más restrictivo)
const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // máximo 5 correos por minuto
  message: {
    error: 'Too many email requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "same-origin" }
}));

// CORS con configuración estricta
const corsOptions = {
  origin: function (origin: any, callback: any) {
    const allowedOrigins = ['http://localhost:5173'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middlewares
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/api/fingerprint', fingerprintRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando con sistema de huellas' });
});
// Validar variables de entorno requeridas
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

// Validar configuración de email
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn('⚠️  Email configuration missing:');
  console.warn('   GMAIL_USER:', process.env.GMAIL_USER ? '✓ Configured' : '✗ Missing');
  console.warn('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✓ Configured' : '✗ Missing');
  console.warn('   Email notifications will not work without proper configuration.');
} else {
  console.log('✓ Email configuration detected');
}

// Configuración de sesiones (requerido para CSRF)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI as string,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true,
    sameSite: 'strict'
  }
}));

// CSRF habilitado solo en producción 
if (process.env.NODE_ENV === 'production') {
  app.use(lusca({
    csrf: true
  }));
} else {
  console.log('🔓 CSRF protection disabled in development mode');
}

// Endpoint para obtener el token CSRF (si está habilitado)
app.get('/api/csrf-token', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.json({ csrfToken: (req as any).csrfToken() });
  } else {
    res.json({ csrfToken: 'development-mode-no-csrf' });
  }
});

// Debug de cookies (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (req.url.includes('/email/') && req.method === 'POST') {
      console.log('📧 Email request:', {
        url: req.url,
        method: req.method,
        body: req.body
      });
    }
    next();
  });
}

// ========== RUTAS DE DEBUG (SIN AUTENTICACIÓN) ==========
console.log('🔧 Setting up debug routes...');

// Ruta de prueba super simple
app.get('/api/test', (req, res) => {
  console.log('📍 Test route hit!');
  res.json({ 
    message: 'Test route working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'undefined'
  });
});

// Ruta de debug de email config
app.get('/api/debug/email-config', (req, res) => {
  console.log('📧 Email config debug route hit!');
  
  const config = {
    GMAIL_USER: process.env.GMAIL_USER || 'NOT_SET',
    GMAIL_USER_VALUE: process.env.GMAIL_USER ? process.env.GMAIL_USER : 'NOT_SET',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT_SET',
    GMAIL_APP_PASSWORD_LENGTH: process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 0,
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'NOT_SET',
    INSTITUTION_NAME: process.env.INSTITUTION_NAME || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  };
  
  console.log('📧 Config values:', config);
  
  res.json({
    message: 'Email configuration debug',
    config,
    timestamp: new Date().toISOString()
  });
});

// Ruta de verificación de email
app.get('/api/debug/email-verify', async (req, res) => {
  console.log('📧 Email verify debug route hit!');
  
  try {
    // Verificar si el archivo existe
    console.log('📧 Attempting to import EmailService...');
    const EmailService = require('./Services/EmailServices');
    console.log('📧 EmailService file found and imported');
    
    // Verificar conexión
    console.log('📧 Testing email connection...');
    const connectionOk = await EmailService.default.verifyConnection();
    console.log('📧 Connection result:', connectionOk);
    
    res.json({
      message: 'Email service verification',
      connection: connectionOk ? 'OK' : 'Failed',
      serviceFile: 'Found',
      config: {
        GMAIL_USER: process.env.GMAIL_USER ? 'Set' : 'Missing',
        GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Missing'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Email verify error:', error);
    res.status(500).json({
      message: 'Email service verification failed',
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      serviceFile: 'Missing or Error',
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta de test de email
app.post('/api/debug/test-email', async (req, res) => {
  console.log('📨 Test email debug route hit!');
  console.log('📨 Request body:', req.body);
  
  try {
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ No email provided in request');
      return res.status(400).json({
        message: 'Email required',
        example: { email: 'test@example.com' },
        received: req.body
      });
    }

    console.log('📨 Attempting to send test email to:', email);
    
    // Verificar configuración antes de enviar
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log('❌ Gmail not configured');
      return res.status(500).json({
        message: 'Gmail not configured',
        missing: {
          GMAIL_USER: !process.env.GMAIL_USER,
          GMAIL_APP_PASSWORD: !process.env.GMAIL_APP_PASSWORD
        }
      });
    }

    const EmailService = require('./Services/EmailServices');
    console.log('📨 EmailService imported, sending email...');
    
    const result = await EmailService.default.sendTestEmail(email);
    console.log('📨 Email send result:', result);
    
    res.json({
      message: result ? 'Email sent successfully!' : 'Email failed to send',
      success: result,
      sentTo: email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      message: 'Error sending test email',
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta para listar todas las rutas
app.get('/api/debug/routes', (req, res) => {
  console.log('📋 Routes debug route hit!');
  
  const routes: string[] = [];
  
  // Obtener rutas registradas
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.regexp) {
      const routerPath = middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^', '');
      if (middleware.handle && middleware.handle.stack) {
        middleware.handle.stack.forEach((handler: any) => {
          if (handler.route) {
            routes.push(`${Object.keys(handler.route.methods)[0].toUpperCase()} ${routerPath}${handler.route.path}`);
          }
        });
      }
    }
  });

  res.json({
    message: 'Available routes',
    totalRoutes: routes.length,
    debugRoutes: [
      'GET /api/test',
      'GET /api/debug/email-config',
      'GET /api/debug/email-verify',
      'POST /api/debug/test-email',
      'GET /api/debug/routes'
    ],
    allRoutes: routes.sort(),
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Debug routes set up successfully:');
console.log('   GET /api/test');
console.log('   GET /api/debug/email-config');
console.log('   GET /api/debug/email-verify');
console.log('   POST /api/debug/test-email');
console.log('   GET /api/debug/routes');

// ========== RUTAS PRINCIPALES ==========

// Rutas de autenticación y usuarios
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/supervisors', supervisorRoutes);

// Rutas de herramientas y préstamos
app.use('/api/tools', toolRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/returns', returnRoutes);

// Rutas de gestión avanzada
app.use('/api/overdue', overdueRoutes); // Incluye notificaciones por email
app.use('/api/email', emailLimiter, emailRoutes); // Rutas específicas de email con limitación
app.use('/api/reports', reportsRoutes);
app.use('/api/history', historyRoutes);

// Rutas auxiliares
app.use('/api/iasuggestions', iaSuggestionRoutes);
app.use('/api/mobile', mobileRoutes);

// ========== ENDPOINTS DE SALUD Y ESTADO ==========

// Prueba de salud básica
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      email: process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? 'Configured' : 'Not configured'
    }
  });
});

// Endpoint específico para verificar configuración de email
app.get('/api/health/email', (req, res) => {
  const emailConfig = {
    configured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    gmailUser: process.env.GMAIL_USER ? '✓ Set' : '✗ Missing',
    gmailPassword: process.env.GMAIL_APP_PASSWORD ? '✓ Set' : '✗ Missing',
    institutionName: process.env.INSTITUTION_NAME || 'Not set',
    mailFromName: process.env.MAIL_FROM_NAME || 'Not set'
  };

  res.json({
    message: 'Email service status',
    timestamp: new Date().toISOString(),
    config: emailConfig,
    status: emailConfig.configured ? 'Ready' : 'Not configured'
  });
});

// Manejo de errores específicos para email
app.use('/api/email', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Email service error:', err);
  
  if (err.message.includes('Authentication failed')) {
    return res.status(500).json({
      message: 'Email service authentication failed',
      error: 'Please check Gmail credentials configuration',
      hint: 'Verify GMAIL_USER and GMAIL_APP_PASSWORD environment variables'
    });
  }
  
  if (err.message.includes('ECONNREFUSED')) {
    return res.status(500).json({
      message: 'Email service connection failed',
      error: 'Cannot connect to Gmail SMTP server',
      hint: 'Check internet connection and Gmail SMTP settings'
    });
  }
  
  next(err);
});

// Manejo de errores general
app.use(errorHandler);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✓ Connected to MongoDB Atlas');
    
    // Verificar configuración de email al iniciar
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('✓ Email service configured and ready');
    } else {
      console.warn('⚠️  Email service not configured - notifications will not work');
    }
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

export default app;