import { Request, Response } from 'express';
import EmailService from '../Services/EmailServices';
import Student from '../Models/Student.model';
import Supervisor from '../Models/Supervisor.model';
import Loan from '../Models/Loan.model';

// ========== Enviar Recordatorio de Devolución ==========
export const sendOverdueReminder = async (req: Request, res: Response) => {
  try {
    const { 
      studentId, 
      loanId, 
      toolName, 
      toolCode, 
      daysOverdue,
      customMessage 
    } = req.body;

    if (!studentId || !toolName || !daysOverdue) {
      return res.status(400).json({
        message: 'Missing required fields: studentId, toolName, daysOverdue'
      });
    }

    // Buscar información del estudiante
    const student = await Student.findOne({
      $or: [
        { _id: studentId },
        { student_id: studentId }
      ]
    });

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    if (!student.email) {
      return res.status(400).json({
        message: 'Student email not found'
      });
    }

    // Buscar información del supervisor (usuario actual)
    const supervisor = await Supervisor.findById(req.user?.id);
    
    if (!supervisor) {
      return res.status(404).json({
        message: 'Supervisor not found'
      });
    }

    // Buscar información del préstamo si se proporciona
    let loanInfo = null;
    if (loanId) {
      loanInfo = await Loan.findById(loanId);
    }

    // Preparar datos para el correo
    const emailData = {
      studentName: student.full_name || 'Estudiante',
      studentEmail: student.email,
      toolName: toolName,
      toolCode: toolCode || 'N/A',
      daysOverdue: parseInt(daysOverdue),
      dueDate: loanInfo?.estimated_return_date 
        ? new Date(loanInfo.estimated_return_date).toLocaleDateString('es-ES')
        : 'No especificada',
      loanDate: loanInfo?.loan_date
        ? new Date(loanInfo.loan_date).toLocaleDateString('es-ES')
        : 'No especificada',
      supervisorName: supervisor.name,
      institutionName: process.env.INSTITUTION_NAME || 'Instituto Tecnológico'
    };

    console.log('Sending overdue reminder email to:', emailData.studentEmail);
    console.log('Email data:', emailData);

    // Enviar correo
    const emailSent = await EmailService.sendOverdueReminder(emailData);

    if (emailSent) {
      // Opcional: Registrar el envío en la base de datos
      console.log('✓ Overdue reminder sent successfully to:', emailData.studentEmail);

      return res.status(200).json({
        message: 'Reminder email sent successfully',
        sentTo: emailData.studentEmail,
        studentName: emailData.studentName,
        toolName: emailData.toolName,
        daysOverdue: emailData.daysOverdue,
        sentAt: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        message: 'Failed to send reminder email',
        error: 'Email service unavailable'
      });
    }

  } catch (error) {
    console.error('Error sending overdue reminder:', error);
    return res.status(500).json({
      message: 'Error sending reminder email',
      error: (error as Error).message
    });
  }
};

// ========== Enviar Correo de Prueba ==========
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email address is required'
      });
    }

    console.log('Sending test email to:', email);

    // Verificar conexión del servicio de correo
    const connectionOk = await EmailService.verifyConnection();
    
    if (!connectionOk) {
      return res.status(500).json({
        message: 'Email service configuration error',
        error: 'Could not connect to email server'
      });
    }

    // Enviar correo de prueba
    const emailSent = await EmailService.sendTestEmail(email);

    if (emailSent) {
      console.log('✓ Test email sent successfully to:', email);

      return res.status(200).json({
        message: 'Test email sent successfully',
        sentTo: email,
        sentAt: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        message: 'Failed to send test email',
        error: 'Email service error'
      });
    }

  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({
      message: 'Error sending test email',
      error: (error as Error).message
    });
  }
};

// ========== Verificar Configuración de Correo ==========
export const verifyEmailConfig = async (req: Request, res: Response) => {
  try {
    const connectionOk = await EmailService.verifyConnection();
    
    const config = {
      gmailUser: process.env.GMAIL_USER ? '✓ Configurado' : '✗ Faltante',
      gmailPassword: process.env.GMAIL_APP_PASSWORD ? '✓ Configurado' : '✗ Faltante',
      institutionName: process.env.INSTITUTION_NAME || 'No configurado',
      fromName: process.env.MAIL_FROM_NAME || 'Sistema de Préstamos'
    };

    return res.status(200).json({
      message: 'Email configuration status',
      connection: connectionOk ? 'OK' : 'Error',
      config,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error verifying email config:', error);
    return res.status(500).json({
      message: 'Error verifying email configuration',
      error: (error as Error).message
    });
  }
};

// ========== Obtener Estadísticas de Correos ==========
export const getEmailStats = async (req: Request, res: Response) => {
  try {
    // Aquí podrías implementar un sistema de tracking de correos enviados
    // Por ahora, devolvemos información básica
    
    const stats = {
      totalSent: 0, // Implementar contador en base de datos
      lastSent: null, // Último correo enviado
      serviceStatus: await EmailService.verifyConnection() ? 'Active' : 'Inactive',
      configuration: {
        provider: 'Gmail SMTP',
        fromEmail: process.env.GMAIL_USER || 'Not configured',
        institutionName: process.env.INSTITUTION_NAME || 'Not configured'
      }
    };

    return res.status(200).json({
      message: 'Email statistics',
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting email stats:', error);
    return res.status(500).json({
      message: 'Error getting email statistics',
      error: (error as Error).message
    });
  }
};