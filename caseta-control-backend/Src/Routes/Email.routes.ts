import { Router } from 'express';
import { 
  sendOverdueReminder,
  sendTestEmail,
  verifyEmailConfig,
  getEmailStats
} from '../Controllers/Email.controller';
import { 
  authenticateToken, 
  requireSupervisorOrAdmin 
} from '../Middlewares/Auth.middleware';

const router = Router();

// ========== RUTAS DE DEBUG (SIN AUTENTICACIÓN) ==========
// Solo para desarrollo - quitar en producción

router.get('/debug/status', (req, res) => {
  res.json({
    message: 'Email routes are working!',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    emailConfig: {
      GMAIL_USER: process.env.GMAIL_USER ? 'Configured' : 'Missing',
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Configured' : 'Missing',
      MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'Not set',
      INSTITUTION_NAME: process.env.INSTITUTION_NAME || 'Not set'
    }
  });
});

router.get('/debug/verify-config', async (req, res) => {
  try {
    // Importar el servicio de email directamente
    const EmailService = require('../Services/EmailServices').default;
    
    const connectionOk = await EmailService.verifyConnection();
    
    const config = {
      gmailUser: process.env.GMAIL_USER ? '✓ Configurado' : '✗ Faltante',
      gmailPassword: process.env.GMAIL_APP_PASSWORD ? '✓ Configurado' : '✗ Faltante',
      institutionName: process.env.INSTITUTION_NAME || 'No configurado',
      fromName: process.env.MAIL_FROM_NAME || 'Sistema de Préstamos'
    };

    res.json({
      message: 'Email configuration status',
      connection: connectionOk ? 'OK' : 'Error',
      config,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error verifying email config:', error);
    res.status(500).json({
      message: 'Error verifying email configuration',
      error: (error as Error).message,
      connection: 'Error'
    });
  }
});

router.post('/debug/send-test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        message: 'Email address required in body: {"email": "test@example.com"}'
      });
    }

    const EmailService = require('../Services/EmailServices').default;
    const emailSent = await EmailService.sendTestEmail(email);

    if (emailSent) {
      res.json({
        message: 'Test email sent successfully',
        sentTo: email,
        sentAt: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        message: 'Failed to send test email'
      });
    }

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      message: 'Error sending test email',
      error: (error as Error).message
    });
  }
});

// ========== RUTAS NORMALES (CON AUTENTICACIÓN) ==========

// Todas las rutas normales requieren autenticación
router.use(authenticateToken);

// Enviar recordatorio de devolución (requiere supervisor o admin)
router.post('/send-overdue-reminder', requireSupervisorOrAdmin, sendOverdueReminder);

// Enviar correo de prueba (requiere supervisor o admin)
router.post('/send-test', requireSupervisorOrAdmin, sendTestEmail);

// Verificar configuración de correo (requiere supervisor o admin)
router.get('/verify-config', requireSupervisorOrAdmin, verifyEmailConfig);

// Obtener estadísticas de correos enviados (requiere supervisor o admin)
router.get('/stats', requireSupervisorOrAdmin, getEmailStats);

export default router;