import { Request, Response } from 'express';
import Loan from '../Models/Loan.model';
import Return from '../Models/Return.model';
import Student, { IStudent } from '../Models/Student.model';
import Tool, { ITool } from '../Models/Tool.model';
import { Types } from 'mongoose';

// Obtener historial completo de préstamos y devoluciones
export const getCompleteHistory = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      type = 'all', 
      entityFilter = '',
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    console.log('Fetching complete history with filters:', {
      page, limit, search, type, entityFilter, sortBy, sortOrder
    });

    // Obtener préstamos con populate completo
    const loans = await Loan.find({})
      .populate('student_id', 'student_id full_name email career')
      .populate('supervisor_id', 'full_name email')
      .populate({
        path: 'tools_borrowed.tool_id',
        select: 'specificName generalName uniqueId category'
      })
      .sort({ loan_date: -1 })
      .lean();

    // Obtener devoluciones con populate completo
    const returns = await Return.find({})
      .populate('student_id', 'student_id full_name email career')
      .populate('supervisor_id', 'full_name email')
      .populate('admin_id', 'name email')
      .populate({
        path: 'tools_returned.tool_id',
        select: 'specificName generalName uniqueId category'
      })
      .sort({ return_date: -1 })
      .lean();

    console.log(`Found ${loans.length} loans and ${returns.length} returns`);

    // Crear historial unificado
    const historyEntries = [];

    // Procesar préstamos
    for (const loan of loans) {
      try {
        const student = loan.student_id as any;
        const supervisor = loan.supervisor_id as any;

        if (!student) {
          console.warn(`Loan ${loan._id} has no student populated`);
          continue;
        }

        // Crear entrada por cada herramienta en el préstamo
        for (const toolBorrowed of loan.tools_borrowed) {
          try {
            const tool = toolBorrowed.tool_id as any;
            
            if (!tool) {
              console.warn(`Tool not populated in loan ${loan._id}`);
              continue;
            }

            // Determinar el estado del préstamo
            let status = 'Préstamo';
            let statusColor = 'blue';
            
            if (loan.status === 'returned') {
              status = 'Devuelto';
              statusColor = 'green';
            } else if (loan.status === 'delayed' || 
                      (loan.status === 'active' && new Date() > new Date(loan.estimated_return_date))) {
              status = 'Préstamo Vencido';
              statusColor = 'red';
            } else if (loan.status === 'active') {
              status = 'Préstamo Activo';
              statusColor = 'blue';
            }

            const historyEntry = {
              id: `L-${loan._id}-${tool._id}`,
              type: 'Préstamo',
              status: status,
              statusColor: statusColor,
              studentId: student.student_id,
              studentName: student.full_name || 'Sin nombre',
              studentEmail: student.email,
              studentCareer: student.career,
              toolId: tool.uniqueId || tool._id,
              toolName: tool.specificName || tool.generalName || 'Sin nombre',
              toolCategory: tool.category || 'Sin categoría',
              quantity: toolBorrowed.quantity || 1,
              loanDateTime: loan.loan_date,
              dueDateTime: loan.estimated_return_date,
              actualReturnDateTime: loan.actual_return_date || null,
              admin: supervisor?.full_name || 'Sin supervisor',
              adminEmail: supervisor?.email || '',
              details: `Préstamo de ${toolBorrowed.quantity || 1} unidad(es)`,
              loanId: loan._id,
              configuredTime: loan.configured_time || 0,
              // Para ordenamiento
              sortDate: new Date(loan.loan_date),
              searchableText: `${student.full_name} ${student.student_id} ${tool.specificName} ${tool.generalName} ${tool.uniqueId} ${supervisor?.full_name || ''}`
            };

            historyEntries.push(historyEntry);

          } catch (toolError) {
            console.error(`Error processing tool in loan ${loan._id}:`, toolError);
          }
        }
      } catch (loanError) {
        console.error(`Error processing loan ${loan._id}:`, loanError);
      }
    }

    // Procesar devoluciones
    for (const returnEntry of returns) {
      try {
        const student = returnEntry.student_id as any;
        const supervisor = returnEntry.supervisor_id as any;
        const admin = returnEntry.admin_id as any;

        if (!student) {
          console.warn(`Return ${returnEntry._id} has no student populated`);
          continue;
        }

        // Crear entrada por cada herramienta devuelta
        for (const toolReturned of returnEntry.tools_returned) {
          try {
            const tool = toolReturned.tool_id as any;
            
            if (!tool) {
              console.warn(`Tool not populated in return ${returnEntry._id}`);
              continue;
            }

            const historyEntry = {
              id: `R-${returnEntry._id}-${tool._id}`,
              type: 'Devolución',
              status: 'Devuelto',
              statusColor: 'green',
              studentId: student.student_id,
              studentName: student.full_name || 'Sin nombre',
              studentEmail: student.email,
              studentCareer: student.career,
              toolId: tool.uniqueId || tool._id,
              toolName: tool.specificName || tool.generalName || 'Sin nombre',
              toolCategory: tool.category || 'Sin categoría',
              quantity: toolReturned.quantity || 1,
              loanDateTime: null, // Las devoluciones no tienen fecha de préstamo
              dueDateTime: null,
              actualReturnDateTime: returnEntry.return_date,
              admin: admin?.name || supervisor?.full_name || 'Sin administrador',
              adminEmail: admin?.email || supervisor?.email || '',
              details: `Devolución de ${toolReturned.quantity || 1} unidad(es) en condición: ${toolReturned.condition || 'No especificada'}${returnEntry.late_return ? ' (Devolución tardía)' : ''}`,
              returnId: returnEntry._id,
              condition: toolReturned.condition,
              lateReturn: returnEntry.late_return,
              notes: returnEntry.notes,
              // Para ordenamiento
              sortDate: new Date(returnEntry.return_date),
              searchableText: `${student.full_name} ${student.student_id} ${tool.specificName} ${tool.generalName} ${tool.uniqueId} ${admin?.name || supervisor?.full_name || ''}`
            };

            historyEntries.push(historyEntry);

          } catch (toolError) {
            console.error(`Error processing tool in return ${returnEntry._id}:`, toolError);
          }
        }
      } catch (returnError) {
        console.error(`Error processing return ${returnEntry._id}:`, returnError);
      }
    }

    console.log(`Created ${historyEntries.length} history entries`);

    // Aplicar filtros
    let filteredEntries = historyEntries;

    // Filtro por tipo
    if (type !== 'all') {
      filteredEntries = filteredEntries.filter(entry => {
        switch (type) {
          case 'préstamo':
            return entry.type === 'Préstamo';
          case 'devolución':
            return entry.type === 'Devolución';
          case 'activos':
            return entry.status === 'Préstamo Activo';
          case 'vencidos':
            return entry.status === 'Préstamo Vencido';
          default:
            return true;
        }
      });
    }

    // Filtro por búsqueda general
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredEntries = filteredEntries.filter(entry =>
        entry.searchableText.toLowerCase().includes(searchTerm) ||
        entry.details.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por entidad (estudiante o herramienta)
    if (entityFilter) {
      const entityTerm = entityFilter.toString().toLowerCase();
      filteredEntries = filteredEntries.filter(entry =>
        entry.studentName.toLowerCase().includes(entityTerm) ||
        entry.studentId.toLowerCase().includes(entityTerm) ||
        entry.toolName.toLowerCase().includes(entityTerm) ||
        entry.toolId.toLowerCase().includes(entityTerm)
      );
    }

    // Ordenamiento
    filteredEntries.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'student':
          aValue = a.studentName.toLowerCase();
          bValue = b.studentName.toLowerCase();
          break;
        case 'tool':
          aValue = a.toolName.toLowerCase();
          bValue = b.toolName.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'date':
        default:
          aValue = a.sortDate.getTime();
          bValue = b.sortDate.getTime();
          break;
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Paginación
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    // Estadísticas
    const stats = {
      totalEntries: filteredEntries.length,
      totalLoans: filteredEntries.filter(e => e.type === 'Préstamo').length,
      totalReturns: filteredEntries.filter(e => e.type === 'Devolución').length,
      activeLoans: filteredEntries.filter(e => e.status === 'Préstamo Activo').length,
      overdueLoans: filteredEntries.filter(e => e.status === 'Préstamo Vencido').length,
      uniqueStudents: [...new Set(filteredEntries.map(e => e.studentId))].length,
      uniqueTools: [...new Set(filteredEntries.map(e => e.toolId))].length
    };

    res.json({
      success: true,
      data: paginatedEntries,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(filteredEntries.length / Number(limit)),
        totalEntries: filteredEntries.length,
        hasNext: endIndex < filteredEntries.length,
        hasPrev: Number(page) > 1,
        limit: Number(limit)
      },
      stats,
      filters: {
        search, type, entityFilter, sortBy, sortOrder
      }
    });

  } catch (error: any) {
    console.error('Error fetching complete history:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar fecha límite de un préstamo activo
export const updateLoanDueDate = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { newDueDate, reason } = req.body;
    const adminId = (req as any).user?.id || (req as any).user?._id;

    if (!adminId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    console.log(`Updating due date for loan ${loanId} to ${newDueDate}`);

    // Validar fecha
    const dueDate = new Date(newDueDate);
    if (isNaN(dueDate.getTime())) {
      return res.status(400).json({
        message: 'Fecha inválida'
      });
    }

    // Buscar el préstamo
    const loan = await Loan.findById(loanId)
      .populate('student_id', 'full_name student_id')
      .populate({
        path: 'tools_borrowed.tool_id',
        select: 'specificName generalName uniqueId'
      });

    if (!loan) {
      return res.status(404).json({
        message: 'Préstamo no encontrado'
      });
    }

    // Verificar que el préstamo esté activo
    if (loan.status !== 'active') {
      return res.status(400).json({
        message: 'Solo se pueden modificar préstamos activos'
      });
    }

    // Actualizar la fecha límite
    const oldDueDate = loan.estimated_return_date;
    loan.estimated_return_date = dueDate;

    await loan.save();

    const student = loan.student_id as any;
    const toolNames = loan.tools_borrowed.map(tb => {
      const tool = tb.tool_id as any;
      return tool.specificName || tool.generalName || 'Herramienta';
    }).join(', ');

    console.log(`Due date updated successfully for loan ${loanId}`);

    res.json({
      success: true,
      message: 'Fecha límite actualizada exitosamente',
      loan: {
        id: loan._id,
        studentName: student.full_name,
        studentId: student.student_id,
        tools: toolNames,
        oldDueDate: oldDueDate,
        newDueDate: dueDate,
        updatedBy: (req as any).user?.name || (req as any).user?.email,
        updatedAt: new Date(),
        reason: reason || 'Actualización administrativa'
      }
    });

  } catch (error: any) {
    console.error('Error updating loan due date:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener estadísticas del historial
export const getHistoryStats = async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calcular fecha de inicio según el período
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Estadísticas de préstamos
    const [totalLoans, activeLoans, overdueLoans, totalReturns] = await Promise.all([
      Loan.countDocuments({ loan_date: { $gte: startDate } }),
      Loan.countDocuments({ 
        status: 'active',
        loan_date: { $gte: startDate }
      }),
      Loan.countDocuments({ 
        status: { $in: ['delayed', 'active'] },
        estimated_return_date: { $lt: now },
        loan_date: { $gte: startDate }
      }),
      Return.countDocuments({ return_date: { $gte: startDate } })
    ]);

    // Herramientas más prestadas
    const topTools = await Loan.aggregate([
      { $match: { loan_date: { $gte: startDate } } },
      { $unwind: '$tools_borrowed' },
      { 
        $lookup: {
          from: 'tools',
          localField: 'tools_borrowed.tool_id',
          foreignField: '_id',
          as: 'tool'
        }
      },
      { $unwind: '$tool' },
      {
        $group: {
          _id: '$tool._id',
          toolName: { $first: { $ifNull: ['$tool.specificName', '$tool.generalName'] } },
          toolCode: { $first: '$tool.uniqueId' },
          count: { $sum: '$tools_borrowed.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Estudiantes más activos
    const topStudents = await Loan.aggregate([
      { $match: { loan_date: { $gte: startDate } } },
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student._id',
          studentName: { $first: '$student.full_name' },
          studentId: { $first: '$student.student_id' },
          loanCount: { $sum: 1 }
        }
      },
      { $sort: { loanCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      period,
      stats: {
        totalLoans,
        activeLoans,
        overdueLoans,
        totalReturns,
        onTimeReturnRate: totalReturns > 0 ? ((totalReturns - overdueLoans) / totalReturns * 100).toFixed(1) : 0
      },
      topTools,
      topStudents,
      generatedAt: new Date()
    });

  } catch (error: any) {
    console.error('Error fetching history stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// AGREGA estas funciones al final de History.controller.ts

// Obtener historial de un estudiante específico (público, sin auth)
export const getStudentHistoryPublic = async (req: Request, res: Response) => {
  try {
    const { studentEmail } = req.params;
    
    console.log(`Getting history for student: ${studentEmail}`);
    
    // Buscar el estudiante por email
    const Student = require('../Models/Student.model').default;
    const student = await Student.findOne({ email: studentEmail.toLowerCase() });
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Estudiante no encontrado' 
      });
    }

    console.log(`Found student: ${student.full_name} (${student.student_id})`);

    // Obtener préstamos del estudiante
    const loans = await Loan.find({ student_id: student._id })
      .populate({
        path: 'tools_borrowed.tool_id',
        select: 'specificName generalName uniqueId category'
      })
      .populate('supervisor_id', 'full_name email')
      .sort({ loan_date: -1 })
      .lean();

    // Obtener devoluciones del estudiante
    const returns = await Return.find({ student_id: student._id })
      .populate({
        path: 'tools_returned.tool_id',
        select: 'specificName generalName uniqueId category'
      })
      .populate('supervisor_id', 'full_name email')
      .populate('admin_id', 'name email')
      .sort({ return_date: -1 })
      .lean();

    console.log(`Found ${loans.length} loans and ${returns.length} returns for student`);

    // Crear historial unificado para el estudiante
    const historyEntries = [];

    // Procesar préstamos
    for (const loan of loans) {
      const supervisor = loan.supervisor_id as any;
      
      for (const toolBorrowed of loan.tools_borrowed) {
        const tool = toolBorrowed.tool_id as any;
        
        if (!tool) continue;

        // Determinar el estado del préstamo
        let status = 'Préstamo';
        let statusType = 'completed';
        
        if (loan.status === 'returned') {
          status = 'Devuelto';
          statusType = 'completed';
        } else if (loan.status === 'delayed' || 
                  (loan.status === 'active' && new Date() > new Date(loan.estimated_return_date))) {
          status = 'Préstamo Vencido';
          statusType = 'alert';
        } else if (loan.status === 'active') {
          status = 'Préstamo Activo';
          statusType = 'warning';
        }

        // Calcular duración
        let duration = '';
        if (loan.actual_return_date) {
          const diffMs = new Date(loan.actual_return_date).getTime() - new Date(loan.loan_date).getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          duration = `${diffHours}h ${diffMins}m`;
        } else if (loan.status === 'active') {
          const diffMs = new Date().getTime() - new Date(loan.loan_date).getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          duration = `${diffHours}h en curso`;
        } else {
          duration = 'No devuelto';
        }

        const historyEntry = {
          id: `L-${loan._id}-${tool._id}`,
          name: tool.specificName || tool.generalName || 'Sin nombre',
          type: status,
          date: new Date(loan.loan_date).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          duration: duration,
          category: tool.category || 'Sin categoría',
          status: statusType,
          quantity: toolBorrowed.quantity || 1,
          supervisor: supervisor?.full_name || 'Sin supervisor',
          loanDate: loan.loan_date,
          dueDate: loan.estimated_return_date,
          returnDate: loan.actual_return_date
        };

        historyEntries.push(historyEntry);
      }
    }

    // Procesar devoluciones
    for (const returnEntry of returns) {
      const supervisor = returnEntry.supervisor_id as any;
      const admin = returnEntry.admin_id as any;
      
      for (const toolReturned of returnEntry.tools_returned) {
        const tool = toolReturned.tool_id as any;
        
        if (!tool) continue;

        const historyEntry = {
          id: `R-${returnEntry._id}-${tool._id}`,
          name: tool.specificName || tool.generalName || 'Sin nombre',
          type: 'Devolución',
          date: new Date(returnEntry.return_date).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          duration: returnEntry.late_return ? 'Devolución tardía' : 'A tiempo',
          category: tool.category || 'Sin categoría',
          status: 'completed',
          quantity: toolReturned.quantity || 1,
          condition: toolReturned.condition || 'No especificada',
          supervisor: admin?.name || supervisor?.full_name || 'Sin supervisor',
          returnDate: returnEntry.return_date,
          notes: returnEntry.notes
        };

        historyEntries.push(historyEntry);
      }
    }

// REEMPLAZA el ordenamiento con esto (usando any para evitar errores de TypeScript):

// Ordenar por fecha descendente
historyEntries.sort((a: any, b: any) => {
  // Usar las fechas disponibles en cada objeto
  let dateA, dateB;
  
  // Para a - usar returnDate si existe, sino loanDate
  if (a.returnDate) {
    dateA = new Date(a.returnDate).getTime();
  } else if (a.loanDate) {
    dateA = new Date(a.loanDate).getTime();
  } else {
    dateA = 0;
  }
  
  // Para b - usar returnDate si existe, sino loanDate
  if (b.returnDate) {
    dateB = new Date(b.returnDate).getTime();
  } else if (b.loanDate) {
    dateB = new Date(b.loanDate).getTime();
  } else {
    dateB = 0;
  }
  
  return dateB - dateA; // Descendente (más reciente primero)
});
    // Estadísticas del estudiante
    const stats = {
      totalLoans: loans.length,
      activeLoans: loans.filter(l => l.status === 'active').length,
      overdueLoans: loans.filter(l => 
        l.status === 'delayed' || 
        (l.status === 'active' && new Date() > new Date(l.estimated_return_date))
      ).length,
      totalReturns: returns.length,
      totalHistory: historyEntries.length
    };

    // Generar alertas
    const alerts = [];
    
    if (stats.overdueLoans > 0) {
      alerts.push({
        type: 'warning',
        text: `Tienes ${stats.overdueLoans} préstamo${stats.overdueLoans > 1 ? 's' : ''} vencido${stats.overdueLoans > 1 ? 's' : ''}`
      });
    }
    
    if (stats.activeLoans > 3) {
      alerts.push({
        type: 'info',
        text: `Tienes ${stats.activeLoans} préstamos activos`
      });
    }

    console.log(`Returning ${historyEntries.length} history entries for ${student.full_name}`);

    res.json({
      success: true,
      student: {
        name: student.full_name,
        email: student.email,
        studentId: student.student_id,
        career: student.career
      },
      history: historyEntries,
      stats: stats,
      alerts: alerts
    });

  } catch (error: any) {
    console.error('Error fetching student history:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGA esta función temporal al final de History.controller.ts para debug

export const testStudentData = async (req: Request, res: Response) => {
  try {
    const { studentEmail } = req.params;
    
    console.log(`=== TEST ENDPOINT ===`);
    console.log(`Buscando datos para: ${studentEmail}`);
    
    // Buscar el estudiante
    const Student = require('../Models/Student.model').default;
    const student = await Student.findOne({ email: studentEmail.toLowerCase() });
    
    if (!student) {
      console.log('Estudiante NO encontrado');
      return res.json({
        success: false,
        message: 'Estudiante no encontrado',
        searchedEmail: studentEmail,
        foundEmails: await Student.find().select('email').limit(5)
      });
    }
    
    console.log('Estudiante encontrado:', student.full_name);
    
    // Buscar préstamos
    const loans = await Loan.find({ student_id: student._id }).limit(5);
    console.log(`Préstamos encontrados: ${loans.length}`);
    
    // Buscar devoluciones  
    const returns = await Return.find({ student_id: student._id }).limit(5);
    console.log(`Devoluciones encontradas: ${returns.length}`);
    
    res.json({
      success: true,
      student: {
        name: student.full_name,
        email: student.email,
        id: student._id
      },
      loansCount: loans.length,
      returnsCount: returns.length,
      totalHistoryItems: loans.length + returns.length,
      sampleLoan: loans[0] || null,
      sampleReturn: returns[0] || null
    });
    
  } catch (error: any) {
    console.error('Error en test endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};