// import { Request, Response } from 'express';
// import Loan from '../Models/Loan.model';
// import Student, { IStudent } from '../Models/Student.model';
// import { Types } from 'mongoose';

// // Obtener todos los préstamos vencidos
// export const getOverdueLoans = async (req: Request, res: Response) => {
//   try {
//     const { sortBy = 'daysOverdue', order = 'desc', search = '' } = req.query;
    
//     console.log('Fetching overdue loans...');
    
//     // Buscar préstamos activos que ya pasaron su fecha límite
//     const now = new Date();
//     const overdueLoans = await Loan.find({
//       status: { $in: ['active', 'delayed'] },
//       estimated_return_date: { $lt: now }
//     })
//     .populate('student_id', 'student_id full_name email phone career blocked block_reason')
//     .populate('supervisor_id', 'full_name email')
//     .populate({
//       path: 'tools_borrowed.tool_id',
//       select: 'specificName generalName uniqueId category'
//     })
//     .sort({ estimated_return_date: 1 }); // Los más antiguos primero

//     console.log(`Found ${overdueLoans.length} overdue loans`);

//     // Mapear y calcular días de retraso
//     const mappedOverdueItems = [];
    
//     for (const loan of overdueLoans) {
//       try {
//         const student = loan.student_id as any;
//         const supervisor = loan.supervisor_id as any;
        
//         if (!student) {
//           console.warn(`Loan ${loan._id} has no student populated`);
//           continue;
//         }

//         // Calcular días de retraso
//         const dueDate = new Date(loan.estimated_return_date);
//         const diffTime = now.getTime() - dueDate.getTime();
//         const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//         // Procesar cada herramienta en el préstamo
//         for (const toolBorrowed of loan.tools_borrowed) {
//           try {
//             const tool = toolBorrowed.tool_id as any;
            
//             if (!tool) {
//               console.warn(`Tool not populated in loan ${loan._id}`);
//               continue;
//             }

//             const overdueItem = {
//               loanId: loan._id,
//               studentId: student.student_id,
//               studentName: student.full_name || 'Nombre no disponible',
//               studentEmail: student.email || 'Email no disponible',
//               studentPhone: student.phone || 'Teléfono no disponible',
//               studentCareer: student.career || 'Carrera no disponible',
//               studentBlocked: student.blocked || false,
//               studentBlockReason: student.block_reason || '',
//               toolName: tool.specificName || tool.generalName || 'Herramienta sin nombre',
//               toolId: tool.uniqueId || tool._id,
//               toolCategory: tool.category || 'Sin categoría',
//               quantity: toolBorrowed.quantity || 1,
//               dueDate: loan.estimated_return_date,
//               dueDateFormatted: dueDate.toLocaleString('es-ES'),
//               loanDate: loan.loan_date,
//               daysOverdue: daysOverdue,
//               adminLoan: supervisor?.full_name || 'Supervisor no disponible',
//               adminEmail: supervisor?.email || '',
//               configuredTime: loan.configured_time || 0,
//               status: daysOverdue > 7 ? 'Crítico' : daysOverdue > 3 ? 'Urgente' : 'Vencido'
//             };

//             mappedOverdueItems.push(overdueItem);
//           } catch (toolError) {
//             console.error(`Error processing tool in loan ${loan._id}:`, toolError);
//           }
//         }
//       } catch (loanError) {
//         console.error(`Error processing loan ${loan._id}:`, loanError);
//       }
//     }

//     // Filtrar por búsqueda si se proporciona
//     let filteredItems = mappedOverdueItems;
//     if (search) {
//       const searchTerm = search.toString().toLowerCase();
//       filteredItems = mappedOverdueItems.filter(item =>
//         item.studentName.toLowerCase().includes(searchTerm) ||
//         item.studentId.toLowerCase().includes(searchTerm) ||
//         item.toolName.toLowerCase().includes(searchTerm) ||
//         item.toolId.toLowerCase().includes(searchTerm) ||
//         item.studentEmail.toLowerCase().includes(searchTerm)
//       );
//     }

//     // Ordenar resultados
//     filteredItems.sort((a, b) => {
//       let aValue, bValue;
      
//       switch (sortBy) {
//         case 'daysOverdue':
//           aValue = a.daysOverdue;
//           bValue = b.daysOverdue;
//           break;
//         case 'studentName':
//           aValue = a.studentName.toLowerCase();
//           bValue = b.studentName.toLowerCase();
//           break;
//         case 'toolName':
//           aValue = a.toolName.toLowerCase();
//           bValue = b.toolName.toLowerCase();
//           break;
//         case 'dueDate':
//           aValue = new Date(a.dueDate).getTime();
//           bValue = new Date(b.dueDate).getTime();
//           break;
//         default:
//           aValue = a.daysOverdue;
//           bValue = b.daysOverdue;
//       }

//       if (order === 'desc') {
//         return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
//       } else {
//         return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
//       }
//     });

//     // Estadísticas
//     const stats = {
//       totalOverdueItems: filteredItems.length,
//       criticalItems: filteredItems.filter(item => item.daysOverdue > 7).length,
//       urgentItems: filteredItems.filter(item => item.daysOverdue > 3 && item.daysOverdue <= 7).length,
//       recentOverdue: filteredItems.filter(item => item.daysOverdue <= 3).length,
//       blockedStudents: filteredItems.filter(item => item.studentBlocked).length,
//       uniqueStudents: [...new Set(filteredItems.map(item => item.studentId))].length
//     };

//     console.log('Overdue stats:', stats);

//     res.json({
//       overdueItems: filteredItems,
//       stats,
//       message: filteredItems.length > 0 ? 
//         `Se encontraron ${filteredItems.length} herramientas vencidas` : 
//         'No hay herramientas vencidas actualmente'
//     });

//   } catch (error: any) {
//     console.error('Error fetching overdue loans:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Notificar estudiante sobre préstamo vencido
// export const notifyStudent = async (req: Request, res: Response) => {
//   try {
//     const { studentId, loanId, message } = req.body;
//     const adminId = (req as any).user?.id || (req as any).user?._id;
    
//     if (!adminId) {
//       return res.status(401).json({ message: 'Usuario no autenticado' });
//     }

//     console.log(`Notifying student ${studentId} about loan ${loanId}`);

//     // Buscar el estudiante
//     const student = await Student.findOne({ student_id: studentId }) as IStudent | null;
//     if (!student) {
//       return res.status(404).json({ message: 'Estudiante no encontrado' });
//     }

//     // Buscar el préstamo
//     const loan = await Loan.findById(loanId)
//       .populate('tools_borrowed.tool_id', 'specificName generalName uniqueId');
    
//     if (!loan) {
//       return res.status(404).json({ message: 'Préstamo no encontrado' });
//     }

//     // En una implementación real, aquí enviarías email, SMS, etc.
//     // Por ahora, simularemos la notificación

//     const notificationData = {
//       studentName: student.full_name,
//       studentEmail: student.email,
//       studentPhone: student.phone,
//       loanId: loan._id,
//       tools: loan.tools_borrowed.map(tb => {
//         const tool = tb.tool_id as any;
//         return {
//           name: tool.specificName || tool.generalName,
//           code: tool.uniqueId
//         };
//       }),
//       dueDate: loan.estimated_return_date,
//       message: message || 'Recordatorio de devolución de herramientas',
//       notifiedBy: (req as any).user?.name || (req as any).user?.email,
//       notificationDate: new Date()
//     };

//     // Aquí podrías guardar la notificación en una colección de notificaciones
//     // await Notification.create(notificationData);

//     console.log('Notification sent (simulated):', notificationData);

//     res.json({
//       message: 'Notificación enviada exitosamente',
//       notification: notificationData,
//       success: true
//     });

//   } catch (error: any) {
//     console.error('Error sending notification:', error);
//     res.status(500).json({
//       message: 'Error enviando notificación',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Bloquear estudiante por préstamos vencidos
// export const blockStudentForOverdue = async (req: Request, res: Response) => {
//   try {
//     const { studentId, reason } = req.body;
//     const adminId = (req as any).user?.id || (req as any).user?._id;
    
//     if (!adminId) {
//       return res.status(401).json({ message: 'Usuario no autenticado' });
//     }

//     console.log(`Blocking student ${studentId} for overdue items`);

//     // Buscar y actualizar el estudiante
//     const student = await Student.findOneAndUpdate(
//       { student_id: studentId },
//       { 
//         blocked: true,
//         block_reason: reason || 'Préstamos vencidos sin devolver'
//       },
//       { new: true }
//     ) as IStudent | null;

//     if (!student) {
//       return res.status(404).json({ message: 'Estudiante no encontrado' });
//     }

//     // Actualizar el estado de los préstamos a 'delayed'
//     await Loan.updateMany(
//       { 
//         student_id: student._id,
//         status: 'active',
//         estimated_return_date: { $lt: new Date() }
//       },
//       { status: 'delayed' }
//     );

//     console.log(`Student ${studentId} blocked successfully`);

//     res.json({
//       message: 'Estudiante bloqueado exitosamente',
//       student: {
//         id: student._id,
//         studentId: student.student_id,
//         name: student.full_name,
//         blocked: student.blocked,
//         blockReason: student.block_reason
//       },
//       blockedBy: (req as any).user?.name || (req as any).user?.email,
//       blockDate: new Date()
//     });

//   } catch (error: any) {
//     console.error('Error blocking student:', error);
//     res.status(500).json({
//       message: 'Error bloqueando estudiante',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Obtener estadísticas de préstamos vencidos
// export const getOverdueStats = async (req: Request, res: Response) => {
//   try {
//     const now = new Date();
    
//     // Contar préstamos vencidos por categorías
//     const totalOverdue = await Loan.countDocuments({
//       status: { $in: ['active', 'delayed'] },
//       estimated_return_date: { $lt: now }
//     });

//     const critical = await Loan.countDocuments({
//       status: { $in: ['active', 'delayed'] },
//       estimated_return_date: { $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
//     });

//     const urgent = await Loan.countDocuments({
//       status: { $in: ['active', 'delayed'] },
//       estimated_return_date: { 
//         $lt: now,
//         $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
//       }
//     });

//     const blockedStudents = await Student.countDocuments({ blocked: true });

//     res.json({
//       totalOverdue,
//       critical,
//       urgent,
//       blockedStudents,
//       lastUpdated: new Date()
//     });

//   } catch (error: any) {
//     console.error('Error fetching overdue stats:', error);
//     res.status(500).json({
//       message: 'Error obteniendo estadísticas',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };
import { Request, Response } from 'express';
import Loan from '../Models/Loan.model';
import Student, { IStudent } from '../Models/Student.model';
import Supervisor from '../Models/Supervisor.model';
import EmailService from '../Services/EmailServices';
import { Types } from 'mongoose';

// Obtener todos los préstamos vencidos
export const getOverdueLoans = async (req: Request, res: Response) => {
  try {
    const { sortBy = 'daysOverdue', order = 'desc', search = '' } = req.query;
    
    console.log('Fetching overdue loans...');
    
    // Buscar préstamos activos que ya pasaron su fecha límite
    const now = new Date();
    const overdueLoans = await Loan.find({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { $lt: now }
    })
    .populate('student_id', 'student_id full_name email phone career blocked block_reason')
    .populate('supervisor_id', 'full_name email')
    .populate({
      path: 'tools_borrowed.tool_id',
      select: 'specificName generalName uniqueId category'
    })
    .sort({ estimated_return_date: 1 }); // Los más antiguos primero

    console.log(`Found ${overdueLoans.length} overdue loans`);

    // Mapear y calcular días de retraso
    const mappedOverdueItems = [];
    
    for (const loan of overdueLoans) {
      try {
        const student = loan.student_id as any;
        const supervisor = loan.supervisor_id as any;
        
        if (!student) {
          console.warn(`Loan ${loan._id} has no student populated`);
          continue;
        }

        // Calcular días de retraso
        const dueDate = new Date(loan.estimated_return_date);
        const diffTime = now.getTime() - dueDate.getTime();
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Procesar cada herramienta en el préstamo
        for (const toolBorrowed of loan.tools_borrowed) {
          try {
            const tool = toolBorrowed.tool_id as any;
            
            if (!tool) {
              console.warn(`Tool not populated in loan ${loan._id}`);
              continue;
            }

            const overdueItem = {
              loanId: loan._id,
              studentId: student.student_id,
              studentName: student.full_name || 'Nombre no disponible',
              studentEmail: student.email || 'Email no disponible',
              studentPhone: student.phone || 'Teléfono no disponible',
              studentCareer: student.career || 'Carrera no disponible',
              studentBlocked: student.blocked || false,
              studentBlockReason: student.block_reason || '',
              toolName: tool.specificName || tool.generalName || 'Herramienta sin nombre',
              toolId: tool.uniqueId || tool._id,
              toolCategory: tool.category || 'Sin categoría',
              quantity: toolBorrowed.quantity || 1,
              dueDate: loan.estimated_return_date,
              dueDateFormatted: dueDate.toLocaleString('es-ES'),
              loanDate: loan.loan_date,
              daysOverdue: daysOverdue,
              // adminLoan: supervisor?.full_name || 'Supervisor no disponible',
              adminEmail: supervisor?.email || '',
              configuredTime: loan.configured_time || 0,
              status: daysOverdue > 7 ? 'Crítico' : daysOverdue > 3 ? 'Urgente' : 'Vencido'
            };

            mappedOverdueItems.push(overdueItem);
          } catch (toolError) {
            console.error(`Error processing tool in loan ${loan._id}:`, toolError);
          }
        }
      } catch (loanError) {
        console.error(`Error processing loan ${loan._id}:`, loanError);
      }
    }

    // Filtrar por búsqueda si se proporciona
    let filteredItems = mappedOverdueItems;
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredItems = mappedOverdueItems.filter(item =>
        item.studentName.toLowerCase().includes(searchTerm) ||
        item.studentId.toLowerCase().includes(searchTerm) ||
        item.toolName.toLowerCase().includes(searchTerm) ||
        item.toolId.toLowerCase().includes(searchTerm) ||
        item.studentEmail.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenar resultados
    filteredItems.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'daysOverdue':
          aValue = a.daysOverdue;
          bValue = b.daysOverdue;
          break;
        case 'studentName':
          aValue = a.studentName.toLowerCase();
          bValue = b.studentName.toLowerCase();
          break;
        case 'toolName':
          aValue = a.toolName.toLowerCase();
          bValue = b.toolName.toLowerCase();
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        default:
          aValue = a.daysOverdue;
          bValue = b.daysOverdue;
      }

      if (order === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Estadísticas
    const stats = {
      totalOverdueItems: filteredItems.length,
      criticalItems: filteredItems.filter(item => item.daysOverdue > 7).length,
      urgentItems: filteredItems.filter(item => item.daysOverdue > 3 && item.daysOverdue <= 7).length,
      recentOverdue: filteredItems.filter(item => item.daysOverdue <= 3).length,
      blockedStudents: filteredItems.filter(item => item.studentBlocked).length,
      uniqueStudents: [...new Set(filteredItems.map(item => item.studentId))].length
    };

    console.log('Overdue stats:', stats);

    res.json({
      overdueItems: filteredItems,
      stats,
      message: filteredItems.length > 0 ? 
        `Se encontraron ${filteredItems.length} herramientas vencidas` : 
        'No hay herramientas vencidas actualmente'
    });

  } catch (error: any) {
    console.error('Error fetching overdue loans:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Notificar estudiante sobre préstamo vencido - ACTUALIZADO CON EMAIL
export const notifyStudent = async (req: Request, res: Response) => {
  try {
    const { studentId, loanId, message } = req.body;
    const adminId = (req as any).user?.id || (req as any).user?._id;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!studentId || !loanId) {
      return res.status(400).json({ 
        message: 'Faltan datos requeridos: studentId y loanId' 
      });
    }

    console.log(`Notifying student ${studentId} about loan ${loanId}`);

    // Buscar el estudiante
    const student = await Student.findOne({ student_id: studentId }) as IStudent | null;
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    if (!student.email) {
      return res.status(400).json({ 
        message: 'El estudiante no tiene email registrado' 
      });
    }

    // Buscar el préstamo con herramientas pobladas
    const loan = await Loan.findById(loanId)
      .populate('tools_borrowed.tool_id', 'specificName generalName uniqueId category')
      .populate('supervisor_id', 'full_name email');
    
    if (!loan) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    // Buscar información del supervisor que envía la notificación
    const currentSupervisor = await Supervisor.findById(adminId);
    if (!currentSupervisor) {
      return res.status(404).json({ message: 'Supervisor no encontrado' });
    }

    // Calcular días vencidos
    const now = new Date();
    const dueDate = new Date(loan.estimated_return_date);
    const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // Obtener información de la primera herramienta (para el correo principal)
    const firstTool = loan.tools_borrowed[0]?.tool_id as any;
    if (!firstTool) {
      return res.status(400).json({ message: 'No se encontraron herramientas en el préstamo' });
    }

    // Preparar datos para el correo
    const emailData = {
      studentName: student.full_name || 'Estudiante',
      studentEmail: student.email,
      toolName: firstTool.specificName || firstTool.generalName || 'Herramienta',
      toolCode: firstTool.uniqueId || firstTool._id.toString(),
      daysOverdue: Math.max(daysOverdue, 1),
      dueDate: dueDate.toLocaleDateString('es-ES'),
      loanDate: new Date(loan.loan_date).toLocaleDateString('es-ES'),
      supervisorName: currentSupervisor.name || 'Supervisor',
      institutionName: process.env.INSTITUTION_NAME || 'Instituto Tecnológico'
    };

    console.log('Sending email with data:', {
      to: emailData.studentEmail,
      student: emailData.studentName,
      tool: emailData.toolName,
      daysOverdue: emailData.daysOverdue
    });

    // Enviar correo electrónico
    const emailSent = await EmailService.sendOverdueReminder(emailData);

    if (!emailSent) {
      return res.status(500).json({
        message: 'Error al enviar el correo electrónico',
        error: 'Servicio de correo no disponible'
      });
    }

    // Registrar la notificación en el préstamo (opcional)
    try {
      if (!loan.notifications) {
        loan.notifications = [];
      }
      
      loan.notifications.push({
        type: 'overdue_email',
        sentAt: new Date(),
        sentBy: adminId,
        daysOverdue: emailData.daysOverdue,
        sentTo: student.email,
        method: 'email'
      } as any);
      
      await loan.save();
      console.log('Notification logged in loan record');
    } catch (logError) {
      console.warn('Could not log notification in loan:', logError);
      // No fallar por esto, el correo ya se envió
    }

    const notificationData = {
      studentName: student.full_name,
      studentEmail: student.email,
      studentPhone: student.phone,
      loanId: loan._id,
      tools: loan.tools_borrowed.map(tb => {
        const tool = tb.tool_id as any;
        return {
          name: tool.specificName || tool.generalName,
          code: tool.uniqueId,
          quantity: tb.quantity
        };
      }),
      dueDate: loan.estimated_return_date,
      daysOverdue: emailData.daysOverdue,
      message: message || 'Recordatorio de devolución de herramientas',
      notifiedBy: currentSupervisor.name,
      notificationDate: new Date(),
      emailSent: true
    };

    console.log('✓ Email notification sent successfully to:', student.email);

    res.json({
      message: 'Notificación enviada exitosamente',
      sentTo: student.email,
      studentName: student.full_name,
      toolName: emailData.toolName,
      daysOverdue: emailData.daysOverdue,
      notification: notificationData,
      success: true,
      sentAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      message: 'Error enviando notificación',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Bloquear estudiante por préstamos vencidos
export const blockStudentForOverdue = async (req: Request, res: Response) => {
  try {
    const { studentId, reason } = req.body;
    const adminId = (req as any).user?.id || (req as any).user?._id;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!studentId) {
      return res.status(400).json({ message: 'studentId es requerido' });
    }

    console.log(`Blocking student ${studentId} for overdue items`);

    // Buscar y actualizar el estudiante
    const student = await Student.findOneAndUpdate(
      { student_id: studentId },
      { 
        blocked: true,
        block_reason: reason || 'Préstamos vencidos sin devolver - Acción tomada desde panel de administración',
        blocked_at: new Date(),
        blocked_by: adminId
      },
      { new: true }
    ) as IStudent | null;

    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Actualizar el estado de los préstamos a 'delayed'
    const updatedLoans = await Loan.updateMany(
      { 
        student_id: student._id,
        status: 'active',
        estimated_return_date: { $lt: new Date() }
      },
      { 
        status: 'delayed',
        blocked_by: adminId,
        blocked_at: new Date()
      }
    );

    console.log(`Student ${studentId} blocked successfully. Updated ${updatedLoans.modifiedCount} loans.`);

    // Buscar información del supervisor para el log
    const supervisor = await Supervisor.findById(adminId);

    res.json({
      message: 'Estudiante bloqueado exitosamente',
      student: {
        id: student._id,
        studentId: student.student_id,
        name: student.full_name,
        blocked: student.blocked,
        blockReason: student.block_reason,
        blockedAt: student.blocked
      },
      blockedBy: supervisor?.name || 'Supervisor',
        blockDate: new Date(),
      affectedLoans: updatedLoans.modifiedCount,
      success: true
    });

  } catch (error: any) {
    console.error('Error blocking student:', error);
    res.status(500).json({
      message: 'Error bloqueando estudiante',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de préstamos vencidos
export const getOverdueStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Fechas para categorías
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    // Contar préstamos vencidos por categorías
    const totalOverdue = await Loan.countDocuments({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { $lt: now }
    });

    const critical = await Loan.countDocuments({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { $lt: sevenDaysAgo }
    });

    const urgent = await Loan.countDocuments({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { 
        $lt: threeDaysAgo,
        $gte: sevenDaysAgo
      }
    });

    const recent = await Loan.countDocuments({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { 
        $lt: now,
        $gte: threeDaysAgo
      }
    });

    const blockedStudents = await Student.countDocuments({ blocked: true });

    // Contar estudiantes únicos con préstamos vencidos
    const overdueLoans = await Loan.find({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { $lt: now }
    }).distinct('student_id');

    const uniqueStudents = overdueLoans.length;

    const stats = {
      totalOverdueItems: totalOverdue,
      criticalItems: critical,
      urgentItems: urgent,
      recentOverdue: recent,
      blockedStudents,
      uniqueStudents,
      lastUpdated: new Date()
    };

    res.json(stats);

  } catch (error: any) {
    console.error('Error fetching overdue stats:', error);
    res.status(500).json({
      message: 'Error obteniendo estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};