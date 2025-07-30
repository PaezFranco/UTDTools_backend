import nodemailer from 'nodemailer';
import { ISupervisor } from '../Models/Supervisor.model';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OverdueReminderData {
  studentName: string;
  studentEmail: string;
  toolName: string;
  toolCode: string;
  daysOverdue: number;
  dueDate: string;
  loanDate: string;
  supervisorName: string;
  institutionName?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log(' EmailService constructor called');
    console.log(' GMAIL_USER:', process.env.GMAIL_USER);
    console.log(' GMAIL_APP_PASSWORD length:', process.env.GMAIL_APP_PASSWORD?.length);
    console.log(' GMAIL_APP_PASSWORD preview:', process.env.GMAIL_APP_PASSWORD?.substring(0, 4) + '...');
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      debug: true, // Habilitar debug de nodemailer
      logger: true // Habilitar logging
    });
  }

  // Verificar configuración del transporter
  async verifyConnection(): Promise<boolean> {
    try {
      console.log(' Starting email connection verification...');
      console.log(' Using Gmail user:', process.env.GMAIL_USER);
      console.log(' Password length:', process.env.GMAIL_APP_PASSWORD?.length);
      
      await this.transporter.verify();
      console.log('✓ Servidor de correo listo para enviar mensajes');
      return true;
    } catch (error) {
      console.error('✗ Error en configuración de correo:');
      console.error('Error type:', typeof error);
      console.error('Error message:', (error as Error).message);
      console.error('Error code:', (error as any).code);
      console.error('Error command:', (error as any).command);
      console.error('Full error:', error);
      return false;
    }
  }

  // Enviar correo genérico
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: process.env.MAIL_FROM_NAME || 'Sistema de Préstamos',
          address: process.env.GMAIL_USER || '',
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      console.log(' Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✓ Correo enviado exitosamente:', result.messageId);
      return true;
    } catch (error) {
      console.error('✗ Error enviando correo:', error);
      return false;
    }
  }

  // Enviar correo de prueba
  async sendTestEmail(to: string): Promise<boolean> {
    console.log(' Sending test email to:', to);
    
    const emailOptions: EmailOptions = {
      to,
      subject: ' Prueba de Sistema de Correos - UTD',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; text-align: center;"> ¡Sistema de Correos Funcionando!</h2>
            <p style="color: #374151; text-align: center;">
              Este es un correo de prueba para verificar que el sistema de envío de recordatorios está funcionando correctamente.
            </p>
            <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
              <strong style="color: #166534;">✓ Configuración exitosa</strong>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
              Enviado por el Sistema de Préstamos UTD<br>
              ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      `,
      text: 'Sistema de correos funcionando correctamente. Esto es una prueba desde UTD.'
    };

    return await this.sendEmail(emailOptions);
  }

  // Generar plantilla HTML para recordatorio de devolución
  private generateOverdueReminderHTML(data: OverdueReminderData): string {
    const urgencyLevel = data.daysOverdue > 7 ? 'CRÍTICO' : data.daysOverdue > 3 ? 'URGENTE' : 'IMPORTANTE';
    const urgencyColor = data.daysOverdue > 7 ? '#dc2626' : data.daysOverdue > 3 ? '#ea580c' : '#ca8a04';

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Devolución</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f3f4f6;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #1f2937, #374151);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .urgency-badge {
                display: inline-block;
                background: ${urgencyColor};
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                margin-top: 10px;
            }
            .content {
                padding: 30px 20px;
            }
            .greeting {
                font-size: 18px;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .message {
                color: #374151;
                margin-bottom: 25px;
                font-size: 16px;
            }
            .tool-details {
                background: #f9fafb;
                border-left: 4px solid ${urgencyColor};
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 0 5px 5px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 8px;
            }
            .detail-row:last-child {
                margin-bottom: 0;
                border-bottom: none;
                padding-bottom: 0;
            }
            .detail-label {
                font-weight: 600;
                color: #374151;
            }
            .detail-value {
                color: #6b7280;
                text-align: right;
            }
            .overdue-highlight {
                color: ${urgencyColor};
                font-weight: bold;
            }
            .footer {
                background: #f9fafb;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            .footer-text {
                color: #6b7280;
                font-size: 14px;
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1> ${data.institutionName}</h1>
                <h2>Recordatorio de Devolución</h2>
                <div class="urgency-badge">${urgencyLevel} - ${data.daysOverdue} día${data.daysOverdue !== 1 ? 's' : ''} vencido${data.daysOverdue !== 1 ? 's' : ''}</div>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Estimado/a <strong>${data.studentName}</strong>,
                </div>
                
                <div class="message">
                    Te escribimos para recordarte que tienes una herramienta pendiente de devolución que <strong class="overdue-highlight">lleva ${data.daysOverdue} día${data.daysOverdue !== 1 ? 's' : ''} vencida</strong>.
                </div>
                
                <div class="tool-details">
                    <h3 style="margin-top: 0; color: #1f2937;"> Detalles del Préstamo</h3>
                    <div class="detail-row">
                        <span class="detail-label">Herramienta:</span>
                        <span class="detail-value"><strong>${data.toolName}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Código:</span>
                        <span class="detail-value">${data.toolCode}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha de préstamo:</span>
                        <span class="detail-value">${data.loanDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha límite:</span>
                        <span class="detail-value overdue-highlight">${data.dueDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Días vencido:</span>
                        <span class="detail-value overdue-highlight">${data.daysOverdue} día${data.daysOverdue !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                
                <div class="message">
                    Por favor, devuelve la herramienta lo antes posible en las instalaciones del laboratorio durante el horario de atención.
                </div>
                
                <div class="message">
                    Si ya devolviste la herramienta o hay algún error, contacta inmediatamente con el supervisor responsable.
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    <strong>Supervisor:</strong> ${data.supervisorName}
                </div>
                <div class="footer-text">
                    <strong>Sistema:</strong> ${data.institutionName}
                </div>
                <div class="footer-text">
                     ${new Date().toLocaleDateString('es-ES')}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generar texto plano como fallback
  private generateOverdueReminderText(data: OverdueReminderData): string {
    return `
RECORDATORIO DE DEVOLUCIÓN - ${data.daysOverdue} DÍAS VENCIDO

Estimado/a ${data.studentName},

Te escribimos para recordarte que tienes una herramienta pendiente de devolución:

DETALLES DEL PRÉSTAMO:
- Herramienta: ${data.toolName}
- Código: ${data.toolCode}
- Fecha de préstamo: ${data.loanDate}
- Fecha límite: ${data.dueDate}
- Días vencido: ${data.daysOverdue}

Por favor, devuelve la herramienta lo antes posible.

Supervisor: ${data.supervisorName}
Sistema: ${data.institutionName}
    `.trim();
  }

  // Enviar recordatorio de devolución
  async sendOverdueReminder(data: OverdueReminderData): Promise<boolean> {
    const subject = ` RECORDATORIO UTD: Herramienta vencida - ${data.daysOverdue} día${data.daysOverdue !== 1 ? 's' : ''} de retraso`;
    
    const emailOptions: EmailOptions = {
      to: data.studentEmail,
      subject,
      html: this.generateOverdueReminderHTML(data),
      text: this.generateOverdueReminderText(data),
    };

    return await this.sendEmail(emailOptions);
  }
}

export default new EmailService();