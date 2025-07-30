

// import { Request, Response } from 'express';
// import Return from '../Models/Return.model';
// import Loan from '../Models/Loan.model';
// import Tool, { ITool } from '../Models/Tool.model';
// import Student, { IStudent } from '../Models/Student.model';
// import { Types } from 'mongoose';

// // Regex para validar MongoDB ObjectIds
// const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// // Obtener préstamos activos de un estudiante por matrícula
// export const getActiveLoansForStudent = async (req: Request, res: Response) => {
//   try {
//     const { studentCode } = req.params;
    
//     console.log(`Searching active loans for student code: ${studentCode}`);
    
//     // Buscar el estudiante por su código/matrícula
//     const student = await Student.findOne({ student_id: studentCode }) as IStudent | null;
//     if (!student) {
//       return res.status(404).json({ 
//         message: 'Estudiante no encontrado',
//         studentCode 
//       });
//     }

//     console.log(`Student found: ${student.full_name} (${student.student_id})`);

//     // Verificar si el estudiante está bloqueado
//     if (student.blocked) {
//       return res.status(400).json({
//         message: 'El estudiante está bloqueado',
//         studentInfo: {
//           id: student._id,
//           name: student.full_name,
//           studentId: student.student_id,
//           status: 'Bloqueado',
//           blockReason: student.block_reason
//         }
//       });
//     }

//     // Buscar préstamos activos del estudiante
//     const activeLoans = await Loan.find({
//       student_id: student._id,
//       status: { $in: ['active', 'delayed'] }
//     })
//     .populate('supervisor_id', 'full_name email')
//     .populate({
//       path: 'tools_borrowed.tool_id',
//       select: 'specificName generalName uniqueId category available_quantity total_quantity'
//     })
//     .sort({ loan_date: -1 });

//     console.log(`Found ${activeLoans.length} active loans for student`);

//     // Mapear los datos para el frontend con mejor manejo de errores
//     const mappedLoans = activeLoans.map((loan, loanIndex) => {
//       const now = new Date();
//       const isOverdue = new Date(loan.estimated_return_date) < now;
      
//       // file deepcode ignore FormatString: <please specify a reason of ignoring this>
//       console.log(`Processing loan ${loanIndex + 1}:`, {
//         loanId: loan._id,
//         toolsCount: loan.tools_borrowed?.length || 0
//       });

//       // Mapear herramientas con manejo seguro de errores
//       const mappedTools = (loan.tools_borrowed || []).map((toolBorrowed, toolIndex) => {
//         try {
//           console.log(`Processing tool ${toolIndex + 1} in loan ${loanIndex + 1}:`, {
//             tool_id: toolBorrowed.tool_id,
//             quantity: toolBorrowed.quantity,
//             toolType: typeof toolBorrowed.tool_id
//           });

//           // Verificar si tool_id está poblado
//           if (!toolBorrowed.tool_id) {
//             console.warn(`Tool ID is null/undefined for tool ${toolIndex + 1} in loan ${loan._id}`);
//             return {
//               toolId: 'unknown',
//               toolName: 'Herramienta no encontrada',
//               toolCode: 'N/A',
//               category: 'Sin categoría',
//               quantityBorrowed: toolBorrowed.quantity || 1,
//               toolDetails: null,
//               error: 'Tool not populated'
//             };
//           }

//           // Si tool_id es solo un string (ObjectId), no está poblado
//           if (typeof toolBorrowed.tool_id === 'string' || toolBorrowed.tool_id instanceof Types.ObjectId) {
//             console.warn(`Tool ${toolIndex + 1} in loan ${loan._id} is not populated, only ObjectId present:`, toolBorrowed.tool_id);
//             return {
//               toolId: toolBorrowed.tool_id.toString(),
//               toolName: `Herramienta ID: ${toolBorrowed.tool_id}`,
//               toolCode: toolBorrowed.tool_id.toString(),
//               category: 'Sin categoría',
//               quantityBorrowed: toolBorrowed.quantity || 1,
//               toolDetails: { _id: toolBorrowed.tool_id },
//               error: 'Tool not populated'
//             };
//           }

//           // Si tool_id está poblado correctamente
//           const tool = toolBorrowed.tool_id as any;
//           return {
//             toolId: tool._id || tool.id || 'unknown',
//             toolName: tool.specificName || tool.generalName || tool.name || 'Sin nombre',
//             toolCode: tool.uniqueId || tool.code || tool._id || 'Sin código',
//             category: tool.category || 'Sin categoría',
//             quantityBorrowed: toolBorrowed.quantity || 1,
//             toolDetails: tool
//           };

//         } catch (toolError) {
//           console.error(`Error processing tool ${toolIndex + 1} in loan ${loan._id}:`, toolError);
//           return {
//             toolId: 'error',
//             toolName: 'Error al cargar herramienta',
//             toolCode: 'ERROR',
//             category: 'Error',
//             quantityBorrowed: toolBorrowed.quantity || 1,
//             toolDetails: null,
//             error: typeof toolError === 'object' && toolError !== null && 'message' in toolError ? (toolError as any).message : String(toolError)
//           };
//         }
//       });

//       return {
//         id: loan._id,
//         loanDate: loan.loan_date,
//         estimatedReturnDate: loan.estimated_return_date,
//         status: isOverdue ? 'Vencido' : 'Activo',
//         isOverdue,
//         configuredTime: loan.configured_time,
//         supervisor: loan.supervisor_id,
//         tools: mappedTools
//       };
//     });

//     res.json({
//       studentInfo: {
//         id: student._id,
//         name: student.full_name,
//         studentId: student.student_id,
//         email: student.email,
//         career: student.career,
//         status: 'Activo'
//       },
//       activeLoans: mappedLoans
//     });

//   } catch (error: any) {
//     console.error('Error getting active loans for student:', error);
//     console.error('Error stack:', error.stack);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? {
//         message: error.message,
//         stack: error.stack
//       } : undefined
//     });
//   }
// };

// // Buscar estudiante por huella dactilar (simulación)
// export const getStudentByFingerprint = async (req: Request, res: Response) => {
//   try {
//     const { fingerprintId } = req.params;
    
//     console.log(`Searching student by fingerprint: ${fingerprintId}`);
    
//     // En una implementación real, aquí buscarías por el ID de huella dactilar
//     // Por ahora, simularemos buscando por student_id o nombre
//     const student = await Student.findOne({
//       $or: [
//         { student_id: fingerprintId },
//         { full_name: { $regex: fingerprintId, $options: 'i' } }
//       ]
//     }) as IStudent | null;

//     if (!student) {
//       return res.status(404).json({ 
//         message: 'Estudiante no encontrado con esa huella dactilar',
//         fingerprintId 
//       });
//     }

//     // // Redirigir a la función de préstamos activos
//     // req.params.studentCode = student.student_id;
//     // return getActiveLoansForStudent(req, res);

//   } catch (error: any) {
//     console.error('Error searching student by fingerprint:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Procesar devolución de herramientas
// export const processReturn = async (req: Request, res: Response) => {
//   try {
//     const { 
//       studentCode, 
//       loanId, 
//       toolsToReturn, 
//       notes, 
//       supervisorId 
//     } = req.body;

//     const adminId = (req as any).user?.id || (req as any).user?._id;
    
//     if (!adminId) {
//       return res.status(401).json({ message: 'Usuario no autenticado' });
//     }

//     console.log(`Processing return for student: ${studentCode}, loan: ${loanId}`);

//     // Validaciones básicas
//     if (!studentCode || !loanId || !Array.isArray(toolsToReturn) || toolsToReturn.length === 0) {
//       return res.status(400).json({
//         message: 'Datos incompletos: studentCode, loanId y toolsToReturn son requeridos'
//       });
//     }

//     // Buscar el estudiante
//     const student = await Student.findOne({ student_id: studentCode }) as IStudent | null;
//     if (!student) {
//       return res.status(404).json({ message: 'Estudiante no encontrado' });
//     }

//     // Buscar el préstamo con populate completo
//     const loan = await Loan.findOne({
//       _id: loanId,
//       student_id: student._id,
//       status: { $in: ['active', 'delayed'] }
//     }).populate({
//       path: 'tools_borrowed.tool_id',
//       select: 'specificName generalName uniqueId _id'
//     });

//     if (!loan) {
//       return res.status(404).json({ message: 'Préstamo no encontrado o ya devuelto' });
//     }

//     // Verificar que las herramientas a devolver están en el préstamo
//     const validToolsToReturn = [];
//     for (const toolReturn of toolsToReturn) {
//       const loanedTool = loan.tools_borrowed.find(
//         tb => {
//           try {
//             const tool = tb.tool_id as any;
//             if (!tool || !tool._id) {
//               console.warn('Tool in loan is not properly populated:', tb);
//               return false;
//             }
//             return tool._id.toString() === toolReturn.toolId;
//           } catch (error) {
//             console.error('Error comparing tool IDs:', error);
//             return false;
//           }
//         }
//       );
      
//       if (!loanedTool) {
//         return res.status(400).json({
//           message: `La herramienta ${toolReturn.toolId} no está en este préstamo`
//         });
//       }

//       if (toolReturn.quantity > loanedTool.quantity) {
//         return res.status(400).json({
//           message: `Cantidad a devolver (${toolReturn.quantity}) mayor que la prestada (${loanedTool.quantity})`
//         });
//       }

//       validToolsToReturn.push({
//         tool_id: toolReturn.toolId,
//         quantity: toolReturn.quantity,
//         condition: toolReturn.condition || 'Bueno'
//       });
//     }

//     // Verificar si es devolución tardía
//     const isLateReturn = new Date() > new Date(loan.estimated_return_date);

//     // Crear el registro de devolución
//     const returnRecord = new Return({
//       loan_id: loan._id,
//       student_id: student._id,
//       supervisor_id: supervisorId || loan.supervisor_id,
//       tools_returned: validToolsToReturn,
//       return_date: new Date(),
//       notes: notes || '',
//       admin_id: adminId,
//       late_return: isLateReturn,
//       return_status: 'complete'
//     });

//     await returnRecord.save();

//     // Actualizar el stock de herramientas
//     for (const toolReturn of validToolsToReturn) {
//       await Tool.findByIdAndUpdate(
//         toolReturn.tool_id,
//         { $inc: { available_quantity: toolReturn.quantity } }
//       );
//     }

//     // Actualizar el estado del préstamo
//     const totalBorrowed = loan.tools_borrowed.reduce((sum, tb) => sum + tb.quantity, 0);
//     const totalReturned = validToolsToReturn.reduce((sum, tr) => sum + tr.quantity, 0);
    
//     if (totalReturned >= totalBorrowed) {
//       loan.status = 'returned';
//       loan.actual_return_date = new Date();
//       returnRecord.return_status = 'complete';
//     } else {
//       returnRecord.return_status = 'partial';
//     }

//     await loan.save();
//     await returnRecord.save();

//     // Poblar el registro de devolución para la respuesta
//     const populatedReturn = await Return.findById(returnRecord._id)
//       .populate('student_id', 'full_name student_id')
//       .populate('supervisor_id', 'full_name')
//       .populate('tools_returned.tool_id', 'specificName generalName uniqueId');

//     console.log(`Return processed successfully. Status: ${returnRecord.return_status}`);

//     res.status(201).json({
//       message: 'Devolución procesada exitosamente',
//       returnRecord: populatedReturn,
//       loanStatus: loan.status,
//       isLateReturn,
//       summary: {
//         studentName: student.full_name,
//         toolsReturned: validToolsToReturn.length,
//         totalQuantity: totalReturned,
//         returnStatus: returnRecord.return_status
//       }
//     });

//   } catch (error: any) {
//     console.error('Error processing return:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Verificar herramienta por código/ID
// export const verifyToolForReturn = async (req: Request, res: Response) => {
//   try {
//     const { toolCode, studentCode, loanId } = req.params;
    
//     console.log(`Verifying tool ${toolCode} for student ${studentCode} in loan ${loanId}`);

//     // Buscar la herramienta
//     const tool = await Tool.findOne({
//       $or: [
//         { uniqueId: toolCode },
//         { _id: MONGO_ID_REGEX.test(toolCode) ? new Types.ObjectId(toolCode) : null }
//       ]
//     }) as ITool | null;

//     if (!tool) {
//       return res.status(404).json({
//         message: 'Herramienta no encontrada',
//         toolCode
//       });
//     }

//     // Buscar el préstamo y verificar que la herramienta esté en él
//     const loan = await Loan.findById(loanId).populate({
//       path: 'tools_borrowed.tool_id',
//       select: 'specificName generalName uniqueId _id'
//     });
    
//     if (!loan) {
//       return res.status(404).json({ message: 'Préstamo no encontrado' });
//     }

//     const toolInLoan = loan.tools_borrowed.find(
//       tb => {
//         try {
//           const loanTool = tb.tool_id as any;
//           if (!loanTool || !loanTool._id) return false;
//           return loanTool._id.toString() === (tool._id as Types.ObjectId).toString();
//         } catch (error) {
//           console.error('Error comparing tools in loan:', error);
//           return false;
//         }
//       }
//     );

//     if (!toolInLoan) {
//       return res.status(400).json({
//         message: 'Esta herramienta no está en el préstamo del estudiante',
//         toolName: tool.specificName || tool.generalName,
//         toolCode: tool.uniqueId
//       });
//     }

//     res.json({
//       tool: {
//         id: tool._id,
//         name: tool.specificName || tool.generalName,
//         code: tool.uniqueId,
//         category: tool.category,
//         quantityInLoan: toolInLoan.quantity
//       },
//       canReturn: true,
//       message: 'Herramienta verificada correctamente'
//     });

//   } catch (error: any) {
//     console.error('Error verifying tool for return:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Obtener historial de devoluciones
// export const getReturnHistory = async (req: Request, res: Response) => {
//   try {
//     const { page = 1, limit = 10, studentCode } = req.query;
    
//     const query: any = {};
//     if (studentCode) {
//       const student = await Student.findOne({ student_id: studentCode as string });
//       if (student) {
//         query.student_id = student._id;
//       }
//     }

//     const returns = await Return.find(query)
//       .populate('student_id', 'full_name student_id')
//       .populate('supervisor_id', 'full_name')
//       .populate('tools_returned.tool_id', 'specificName generalName uniqueId')
//       .sort({ return_date: -1 })
//       .limit(Number(limit))
//       .skip((Number(page) - 1) * Number(limit));

//     const total = await Return.countDocuments(query);

//     res.json({
//       returns,
//       pagination: {
//         currentPage: Number(page),
//         totalPages: Math.ceil(total / Number(limit)),
//         totalReturns: total,
//         hasNext: Number(page) < Math.ceil(total / Number(limit)),
//         hasPrev: Number(page) > 1
//       }
//     });

//   } catch (error: any) {
//     console.error('Error getting return history:', error);
//     res.status(500).json({
//       message: 'Error interno del servidor',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

import { Request, Response } from 'express';
import Return from '../Models/Return.model';
import Loan from '../Models/Loan.model';
import Tool, { ITool } from '../Models/Tool.model';
import Student, { IStudent } from '../Models/Student.model';
import { Types } from 'mongoose';

// Regex para validar MongoDB ObjectIds
const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// Obtener préstamos activos de un estudiante por matrícula
export const getActiveLoansForStudent = async (req: Request, res: Response) => {
  try {
    const { studentCode } = req.params;
    
    console.log(`Searching active loans for student code: ${studentCode}`);
    
    // Buscar el estudiante por su código/matrícula
    const student = await Student.findOne({ student_id: studentCode }) as IStudent | null;
    if (!student) {
      return res.status(404).json({ 
        message: 'Estudiante no encontrado',
        studentCode 
      });
    }

    console.log(`Student found: ${student.full_name} (${student.student_id})`);

    // Verificar si el estudiante está bloqueado
    if (student.blocked) {
      return res.status(400).json({
        message: 'El estudiante está bloqueado',
        studentInfo: {
          id: student._id,
          name: student.full_name,
          studentId: student.student_id,
          status: 'Bloqueado',
          blockReason: student.block_reason
        }
      });
    }

    // Buscar préstamos activos del estudiante
    const activeLoans = await Loan.find({
      student_id: student._id,
      status: { $in: ['active', 'delayed'] }
    })
    .populate('supervisor_id', 'full_name email')
    .populate({
      path: 'tools_borrowed.tool_id',
      select: 'specificName generalName uniqueId category available_quantity total_quantity'
    })
    .sort({ loan_date: -1 });

    console.log(`Found ${activeLoans.length} active loans for student`);

    // Mapear los datos para el frontend con mejor manejo de errores
    const mappedLoans = activeLoans.map((loan, loanIndex) => {
      const now = new Date();
      const isOverdue = new Date(loan.estimated_return_date) < now;
      
      // file deepcode ignore FormatString: <please specify a reason of ignoring this>
      console.log(`Processing loan ${loanIndex + 1}:`, {
        loanId: loan._id,
        toolsCount: loan.tools_borrowed?.length || 0
      });

      // Mapear herramientas con manejo seguro de errores
      const mappedTools = (loan.tools_borrowed || []).map((toolBorrowed, toolIndex) => {
        try {
          console.log(`Processing tool ${toolIndex + 1} in loan ${loanIndex + 1}:`, {
            tool_id: toolBorrowed.tool_id,
            quantity: toolBorrowed.quantity,
            toolType: typeof toolBorrowed.tool_id
          });

          // Verificar si tool_id está poblado
          if (!toolBorrowed.tool_id) {
            console.warn(`Tool ID is null/undefined for tool ${toolIndex + 1} in loan ${loan._id}`);
            return {
              toolId: 'unknown',
              toolName: 'Herramienta no encontrada',
              toolCode: 'N/A',
              category: 'Sin categoría',
              quantityBorrowed: toolBorrowed.quantity || 1,
              toolDetails: null,
              error: 'Tool not populated'
            };
          }

          // Si tool_id es solo un string (ObjectId), no está poblado
          if (typeof toolBorrowed.tool_id === 'string' || toolBorrowed.tool_id instanceof Types.ObjectId) {
            console.warn(`Tool ${toolIndex + 1} in loan ${loan._id} is not populated, only ObjectId present:`, toolBorrowed.tool_id);
            return {
              toolId: toolBorrowed.tool_id.toString(),
              toolName: `Herramienta ID: ${toolBorrowed.tool_id}`,
              toolCode: toolBorrowed.tool_id.toString(),
              category: 'Sin categoría',
              quantityBorrowed: toolBorrowed.quantity || 1,
              toolDetails: { _id: toolBorrowed.tool_id },
              error: 'Tool not populated'
            };
          }

          // Si tool_id está poblado correctamente
          const tool = toolBorrowed.tool_id as any;
          return {
            toolId: tool._id || tool.id || 'unknown',
            toolName: tool.specificName || tool.generalName || tool.name || 'Sin nombre',
            toolCode: tool.uniqueId || tool.code || tool._id || 'Sin código',
            category: tool.category || 'Sin categoría',
            quantityBorrowed: toolBorrowed.quantity || 1,
            toolDetails: tool
          };

        } catch (toolError) {
          console.error(`Error processing tool ${toolIndex + 1} in loan ${loan._id}:`, toolError);
          return {
            toolId: 'error',
            toolName: 'Error al cargar herramienta',
            toolCode: 'ERROR',
            category: 'Error',
            quantityBorrowed: toolBorrowed.quantity || 1,
            toolDetails: null,
            error: typeof toolError === 'object' && toolError !== null && 'message' in toolError ? (toolError as any).message : String(toolError)
          };
        }
      });

      return {
        id: loan._id,
        loanDate: loan.loan_date,
        estimatedReturnDate: loan.estimated_return_date,
        status: isOverdue ? 'Vencido' : 'Activo',
        isOverdue,
        configuredTime: loan.configured_time,
        supervisor: loan.supervisor_id,
        tools: mappedTools
      };
    });

    res.json({
      studentInfo: {
        id: student._id,
        name: student.full_name,
        studentId: student.student_id,
        email: student.email,
        career: student.career,
        cuatrimestre: (student as any).semester || 1,
        group: (student as any).group || '',
        phone: (student as any).phone || '',
        avatar: (student as any).avatar || 'https://images.unsplash.com/photo-1698431048673-53ed1765ea07',
        status: 'Activo'
      },
      activeLoans: mappedLoans
    });

  } catch (error: any) {
    console.error('Error getting active loans for student:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// Buscar estudiante por huella dactilar - FUNCIÓN CORREGIDA
export const getStudentByFingerprint = async (req: Request, res: Response) => {
  try {
    const { fingerprintId } = req.params;
    
    console.log(`Searching student by fingerprint: ${fingerprintId}`);
    
    // Buscar estudiante por fingerprint_id (campo que necesitas agregar a tu modelo)
    let student = await Student.findOne({ 
      fingerprint_id: parseInt(fingerprintId) 
    }) as IStudent | null;

    // Si no se encuentra por fingerprint_id, buscar por otros campos como fallback
    if (!student) {
      console.log('No student found by fingerprint_id, trying alternative search...');
      student = await Student.findOne({
        $or: [
          { student_id: fingerprintId },
          { full_name: { $regex: fingerprintId, $options: 'i' } }
        ]
      }) as IStudent | null;
    }

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Estudiante no encontrado con esa huella dactilar',
        fingerprintId 
      });
    }

    console.log(`Student found by fingerprint: ${student.full_name} (${student.student_id})`);

    // Verificar si el estudiante está bloqueado
    if (student.blocked) {
      return res.json({
        success: true,
        studentInfo: {
          id: student._id,
          name: student.full_name,
          studentId: student.student_id,
          email: student.email,
          career: student.career,
          cuatrimestre: (student as any).semester || 1,
          group: (student as any).group || '',
          phone: (student as any).phone || '',
          avatar: (student as any).avatar || 'https://images.unsplash.com/photo-1698431048673-53ed1765ea07',
          status: 'Bloqueado',
          blockReason: student.block_reason || 'Sin razón especificada'
        },
        activeLoans: [],
        message: 'Estudiante encontrado pero está bloqueado'
      });
    }

    // Buscar préstamos activos del estudiante
    const activeLoans = await Loan.find({
      student_id: student._id,
      status: { $in: ['active', 'delayed'] }
    })
    .populate('supervisor_id', 'full_name email')
    .populate({
      path: 'tools_borrowed.tool_id',
      select: 'specificName generalName uniqueId category available_quantity total_quantity'
    })
    .sort({ loan_date: -1 });

    console.log(`Found ${activeLoans.length} active loans for student via fingerprint`);

    // Mapear los datos para el frontend (reutilizar la lógica existente)
    const mappedLoans = activeLoans.map((loan, loanIndex) => {
      const now = new Date();
      const isOverdue = new Date(loan.estimated_return_date) < now;
      
      // Mapear herramientas con manejo seguro de errores
      const mappedTools = (loan.tools_borrowed || []).map((toolBorrowed, toolIndex) => {
        try {
          // Verificar si tool_id está poblado
          if (!toolBorrowed.tool_id) {
            return {
              toolId: 'unknown',
              toolName: 'Herramienta no encontrada',
              toolCode: 'N/A',
              category: 'Sin categoría',
              quantityBorrowed: toolBorrowed.quantity || 1
            };
          }

          // Si tool_id es solo un string (ObjectId), no está poblado
          if (typeof toolBorrowed.tool_id === 'string' || toolBorrowed.tool_id instanceof Types.ObjectId) {
            return {
              toolId: toolBorrowed.tool_id.toString(),
              toolName: `Herramienta ID: ${toolBorrowed.tool_id}`,
              toolCode: toolBorrowed.tool_id.toString(),
              category: 'Sin categoría',
              quantityBorrowed: toolBorrowed.quantity || 1
            };
          }

          // Si tool_id está poblado correctamente
          const tool = toolBorrowed.tool_id as any;
          return {
            toolId: tool._id || tool.id || 'unknown',
            toolName: tool.specificName || tool.generalName || tool.name || 'Sin nombre',
            toolCode: tool.uniqueId || tool.code || tool._id || 'Sin código',
            category: tool.category || 'Sin categoría',
            quantityBorrowed: toolBorrowed.quantity || 1
          };

        } catch (toolError) {
          console.error(`Error processing tool ${toolIndex + 1} in loan ${loan._id}:`, toolError);
          return {
            toolId: 'error',
            toolName: 'Error al cargar herramienta',
            toolCode: 'ERROR',
            category: 'Error',
            quantityBorrowed: toolBorrowed.quantity || 1
          };
        }
      });

      return {
        id: loan._id,
        loanDate: loan.loan_date,
        estimatedReturnDate: loan.estimated_return_date,
        status: isOverdue ? 'Vencido' : 'Activo',
        isOverdue,
        configuredTime: loan.configured_time,
        supervisor: loan.supervisor_id,
        tools: mappedTools
      };
    });

    // Respuesta exitosa con el mismo formato que getActiveLoansForStudent
    res.json({
      success: true,
      studentInfo: {
        id: student._id,
        name: student.full_name,
        studentId: student.student_id,
        email: student.email,
        career: student.career,
        cuatrimestre: (student as any).semester || 1,
        group: (student as any).group || '',
        phone: (student as any).phone || '',
        avatar: (student as any).avatar || 'https://images.unsplash.com/photo-1698431048673-53ed1765ea07',
        status: 'Activo'
      },
      activeLoans: mappedLoans,
      message: `Estudiante encontrado con ${mappedLoans.length} préstamo(s) activo(s)`
    });

  } catch (error: any) {
    console.error('Error searching student by fingerprint:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Procesar devolución de herramientas
export const processReturn = async (req: Request, res: Response) => {
  try {
    const { 
      studentCode, 
      loanId, 
      toolsToReturn, 
      notes, 
      supervisorId 
    } = req.body;

    const adminId = (req as any).user?.id || (req as any).user?._id;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    console.log(`Processing return for student: ${studentCode}, loan: ${loanId}`);

    // Validaciones básicas
    if (!studentCode || !loanId || !Array.isArray(toolsToReturn) || toolsToReturn.length === 0) {
      return res.status(400).json({
        message: 'Datos incompletos: studentCode, loanId y toolsToReturn son requeridos'
      });
    }

    // Buscar el estudiante
    const student = await Student.findOne({ student_id: studentCode }) as IStudent | null;
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Buscar el préstamo con populate completo
    const loan = await Loan.findOne({
      _id: loanId,
      student_id: student._id,
      status: { $in: ['active', 'delayed'] }
    }).populate({
      path: 'tools_borrowed.tool_id',
      select: 'specificName generalName uniqueId _id'
    });

    if (!loan) {
      return res.status(404).json({ message: 'Préstamo no encontrado o ya devuelto' });
    }

    // Verificar que las herramientas a devolver están en el préstamo
    const validToolsToReturn = [];
    for (const toolReturn of toolsToReturn) {
      const loanedTool = loan.tools_borrowed.find(
        tb => {
          try {
            const tool = tb.tool_id as any;
            if (!tool || !tool._id) {
              console.warn('Tool in loan is not properly populated:', tb);
              return false;
            }
            return tool._id.toString() === toolReturn.toolId;
          } catch (error) {
            console.error('Error comparing tool IDs:', error);
            return false;
          }
        }
      );
      
      if (!loanedTool) {
        return res.status(400).json({
          message: `La herramienta ${toolReturn.toolId} no está en este préstamo`
        });
      }

      if (toolReturn.quantity > loanedTool.quantity) {
        return res.status(400).json({
          message: `Cantidad a devolver (${toolReturn.quantity}) mayor que la prestada (${loanedTool.quantity})`
        });
      }

      validToolsToReturn.push({
        tool_id: toolReturn.toolId,
        quantity: toolReturn.quantity,
        condition: toolReturn.condition || 'Bueno'
      });
    }

    // Verificar si es devolución tardía
    const isLateReturn = new Date() > new Date(loan.estimated_return_date);

    // Crear el registro de devolución
    const returnRecord = new Return({
      loan_id: loan._id,
      student_id: student._id,
      supervisor_id: supervisorId || loan.supervisor_id,
      tools_returned: validToolsToReturn,
      return_date: new Date(),
      notes: notes || '',
      admin_id: adminId,
      late_return: isLateReturn,
      return_status: 'complete'
    });

    await returnRecord.save();

    // Actualizar el stock de herramientas
    for (const toolReturn of validToolsToReturn) {
      await Tool.findByIdAndUpdate(
        toolReturn.tool_id,
        { $inc: { available_quantity: toolReturn.quantity } }
      );
    }

    // Actualizar el estado del préstamo
    const totalBorrowed = loan.tools_borrowed.reduce((sum, tb) => sum + tb.quantity, 0);
    const totalReturned = validToolsToReturn.reduce((sum, tr) => sum + tr.quantity, 0);
    
    if (totalReturned >= totalBorrowed) {
      loan.status = 'returned';
      loan.actual_return_date = new Date();
      returnRecord.return_status = 'complete';
    } else {
      returnRecord.return_status = 'partial';
    }

    await loan.save();
    await returnRecord.save();

    // Poblar el registro de devolución para la respuesta
    const populatedReturn = await Return.findById(returnRecord._id)
      .populate('student_id', 'full_name student_id')
      .populate('supervisor_id', 'full_name')
      .populate('tools_returned.tool_id', 'specificName generalName uniqueId');

    console.log(`Return processed successfully. Status: ${returnRecord.return_status}`);

    res.status(201).json({
      message: 'Devolución procesada exitosamente',
      returnRecord: populatedReturn,
      loanStatus: loan.status,
      isLateReturn,
      summary: {
        studentName: student.full_name,
        toolsReturned: validToolsToReturn.length,
        totalQuantity: totalReturned,
        returnStatus: returnRecord.return_status
      }
    });

  } catch (error: any) {
    console.error('Error processing return:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar herramienta por código/ID
export const verifyToolForReturn = async (req: Request, res: Response) => {
  try {
    const { toolCode, studentCode, loanId } = req.params;
    
    console.log(`Verifying tool ${toolCode} for student ${studentCode} in loan ${loanId}`);

    // Buscar la herramienta
    const tool = await Tool.findOne({
      $or: [
        { uniqueId: toolCode },
        { _id: MONGO_ID_REGEX.test(toolCode) ? new Types.ObjectId(toolCode) : null }
      ]
    }) as ITool | null;

    if (!tool) {
      return res.status(404).json({
        message: 'Herramienta no encontrada',
        toolCode
      });
    }

    // Buscar el préstamo y verificar que la herramienta esté en él
    const loan = await Loan.findById(loanId).populate({
      path: 'tools_borrowed.tool_id',
      select: 'specificName generalName uniqueId _id'
    });
    
    if (!loan) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    const toolInLoan = loan.tools_borrowed.find(
      tb => {
        try {
          const loanTool = tb.tool_id as any;
          if (!loanTool || !loanTool._id) return false;
          return loanTool._id.toString() === (tool._id as Types.ObjectId).toString();
        } catch (error) {
          console.error('Error comparing tools in loan:', error);
          return false;
        }
      }
    );

    if (!toolInLoan) {
      return res.status(400).json({
        message: 'Esta herramienta no está en el préstamo del estudiante',
        toolName: tool.specificName || tool.generalName,
        toolCode: tool.uniqueId
      });
    }

    res.json({
      tool: {
        id: tool._id,
        name: tool.specificName || tool.generalName,
        code: tool.uniqueId,
        category: tool.category,
        quantityInLoan: toolInLoan.quantity
      },
      canReturn: true,
      message: 'Herramienta verificada correctamente'
    });

  } catch (error: any) {
    console.error('Error verifying tool for return:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener historial de devoluciones
export const getReturnHistory = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, studentCode } = req.query;
    
    const query: any = {};
    if (studentCode) {
      const student = await Student.findOne({ student_id: studentCode as string });
      if (student) {
        query.student_id = student._id;
      }
    }

    const returns = await Return.find(query)
      .populate('student_id', 'full_name student_id')
      .populate('supervisor_id', 'full_name')
      .populate('tools_returned.tool_id', 'specificName generalName uniqueId')
      .sort({ return_date: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Return.countDocuments(query);

    res.json({
      returns,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalReturns: total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1
      }
    });

  } catch (error: any) {
    console.error('Error getting return history:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};