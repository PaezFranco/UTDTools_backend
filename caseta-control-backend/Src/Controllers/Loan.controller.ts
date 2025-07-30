import { Request, Response } from 'express';
import Loan from '../Models/Loan.model';
import { IStudent } from '../Models/Student.model';

export const getAllLoans = async (_req: Request, res: Response) => {
  try {
    const loans = await Loan.find().populate('student_id').populate('supervisor_id').populate('tools_borrowed.tool_id');
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error });
  }
};

export const getLoanById = async (req: Request, res: Response) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('student_id').populate('supervisor_id').populate('tools_borrowed.tool_id');
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loan', error });
  }
};

// Nueva función para obtener préstamos por estudiante
export const getLoansByStudentId = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // Buscar préstamos por student_id (ObjectId) o por student_id en el documento Student
    const loans = await Loan.find()
      .populate({
        path: 'student_id',
        match: { student_id: studentId } // Buscar por el campo student_id del estudiante
      })
      .populate('supervisor_id')
      .populate('tools_borrowed.tool_id')
      .exec();

    // Filtrar préstamos donde el populate de student_id no sea null
    const filteredLoans = loans.filter(loan => loan.student_id !== null);

    res.json(filteredLoans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student loans', error });
  }
};

export const getLoansByStudentCode = async (req: Request, res: Response) => {
  try {
    const { studentCode } = req.params;

    // Importar el modelo Student correctamente
    const Student = require('../Models/Student.model').default;
    const studentDoc = await Student.findOne({ student_id: studentCode }).exec() as IStudent | null;

    if (!studentDoc) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const loans = await Loan.find({ student_id: studentDoc._id })
      .populate('student_id')
      .populate('supervisor_id')
      .populate({
        path: 'tools_borrowed.tool_id',
        // ✅ CORRECCIÓN: Usar los campos correctos del modelo Tool
        select: 'specificName generalName uniqueId category brand model description available_quantity total_quantity'
      })
      .sort({ loan_date: -1 });

    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans by studentCode:', error);
    res.status(500).json({ message: 'Error fetching student loans', error });
  }
};


export const createLoan = async (req: Request, res: Response) => {
  try {
    const newLoan = new Loan(req.body);
    await newLoan.save();
    
    // Poblar los datos para devolver información completa
    const populatedLoan = await Loan.findById(newLoan._id)
      .populate('student_id')
      .populate('supervisor_id')
      .populate('tools_borrowed.tool_id');
    
    res.status(201).json(populatedLoan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating loan', error });
  }
};

// Nueva función para crear préstamo con validaciones
export const createLoanWithValidation = async (req: Request, res: Response) => {
  try {
    const { student_code, supervisor_id, tools, configured_time_hours } = req.body;
    
    // Buscar el estudiante por su código
    const Student = require('../Models/Student.model').default;
    const student = await Student.findOne({ student_id: student_code });
    
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Verificar si el estudiante está bloqueado
    if (student.blocked) {
      return res.status(400).json({ message: 'El estudiante está bloqueado y no puede solicitar préstamos' });
    }

    // Verificar disponibilidad de herramientas
    const Tool = require('../Models/Tool.model').default;
    // file deepcode ignore HTTPSourceWithUncheckedType: <please specify a reason of ignoring this>
    const toolIds = tools.map((t: { tool_id: any; }) => t.tool_id);
    const availableTools = await Tool.find({ _id: { $in: toolIds } });
    
    if (availableTools.length !== toolIds.length) {
      return res.status(400).json({ message: 'Algunas herramientas no existen' });
    }

    // Verificar stock disponible
    for (const requestedTool of tools) {
      const tool = availableTools.find((t: { _id: { toString: () => any; }; }) => t._id.toString() === requestedTool.tool_id);
      if (tool.available_quantity < requestedTool.quantity) {
        return res.status(400).json({ 
          message: `Stock insuficiente para ${tool.name}. Disponible: ${tool.available_quantity}, Solicitado: ${requestedTool.quantity}` 
        });
      }
    }

    // Calcular fecha de devolución
    const configuredTimeMinutes = configured_time_hours ? configured_time_hours * 60 : 360; // Default 6 horas
    const estimatedReturnDate = new Date();
    estimatedReturnDate.setMinutes(estimatedReturnDate.getMinutes() + configuredTimeMinutes);

    // Crear el préstamo
    const newLoan = new Loan({
      student_id: student._id,
      supervisor_id: supervisor_id,
      tools_borrowed: tools,
      loan_date: new Date(),
      estimated_return_date: estimatedReturnDate,
      status: 'active',
      configured_time: configuredTimeMinutes
    });

    await newLoan.save();

    // Actualizar stock de herramientas
    for (const requestedTool of tools) {
      await Tool.findByIdAndUpdate(
        requestedTool.tool_id,
        { $inc: { available_quantity: -requestedTool.quantity } }
      );
    }

    // Devolver el préstamo con datos poblados
    const populatedLoan = await Loan.findById(newLoan._id)
      .populate('student_id')
      .populate('supervisor_id')
      .populate('tools_borrowed.tool_id');

    res.status(201).json({
      message: 'Préstamo creado exitosamente',
      loan: populatedLoan
    });

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error creating loan', error: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};

export const returnLoan = async (req: Request, res: Response) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'returned', 
        actual_return_date: new Date() 
      }, 
      { new: true }
    );
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error returning loan', error });
  }
};

// AGREGA esta función al final de Loan.controller.ts

export const getActiveLoansSimple = async (req: Request, res: Response) => {
  try {
    const { studentEmail } = req.params;
    
    console.log(`Buscando préstamos activos para: ${studentEmail}`);
    
    // Buscar estudiante
    const Student = require('../Models/Student.model').default;
    const student = await Student.findOne({ email: studentEmail.toLowerCase() });
    
    if (!student) {
      console.log('Estudiante no encontrado');
      return res.json({
        success: false,
        message: 'Estudiante no encontrado',
        activeLoans: [],
        totalActive: 0
      });
    }

    console.log(`Estudiante encontrado: ${student.full_name} (ID: ${student._id})`);

    // Buscar préstamos con status 'active'
    const activeLoans = await Loan.find({ 
      student_id: student._id,
      status: 'active'
    })
      .populate({
        path: 'tools_borrowed.tool_id',
        select: 'specificName generalName uniqueId category'
      })
      .sort({ loan_date: -1 });

    console.log(`Préstamos activos encontrados: ${activeLoans.length}`);

    // Procesar cada préstamo
    const processedLoans = [];
    
    for (const loan of activeLoans) {
      console.log(`Procesando préstamo: ${loan._id}, herramientas: ${loan.tools_borrowed.length}`);
      
      for (const toolBorrowed of loan.tools_borrowed) {
        const tool = toolBorrowed.tool_id as any;
        
        if (!tool) {
          console.log('Herramienta no encontrada o no populada');
          continue;
        }

        const loanDate = new Date(loan.loan_date);
        const returnDate = new Date(loan.estimated_return_date);
        
        const loanItem = {
          id: `${loan._id}-${tool._id}`,
          name: tool.specificName || tool.generalName || 'Herramienta sin nombre',
          quantity: toolBorrowed.quantity || 1,
          category: tool.category || 'Sin categoría',
          loanDate: loanDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          returnDate: returnDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long', 
            year: 'numeric'
          }),
          returnDateShort: returnDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short'
          }),
          loanDateTime: loan.loan_date,
          returnDateTime: loan.estimated_return_date,
          status: new Date() > returnDate ? 'Vencido' : 'Activo'
        };
        
        processedLoans.push(loanItem);
        console.log(`Agregado: ${loanItem.name}`);
      }
    }

    console.log(`Total items procesados: ${processedLoans.length}`);

    res.json({
      success: true,
      student: {
        name: student.full_name,
        email: student.email,
        studentId: student.student_id
      },
      activeLoans: processedLoans,
      totalActive: processedLoans.length,
      debug: {
        studentFound: true,
        studentId: student._id,
        rawLoansCount: activeLoans.length,
        processedLoansCount: processedLoans.length
      }
    });

  } catch (error: any) {
    console.error('Error completo:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message,
      activeLoans: [],
      totalActive: 0
    });
  }
};

// AGREGA al final de Loan.controller.ts

export const getLoansBasic = async (req: Request, res: Response) => {
  try {
    console.log('ENDPOINT BASICO LLAMADO');
    
    // Obtener TODOS los préstamos sin filtros
    const allLoans = await Loan.find({})
      .populate('student_id', 'email full_name')
      .populate('tools_borrowed.tool_id', 'specificName generalName category')
      .limit(10);
    
    console.log(`Total préstamos en BD: ${allLoans.length}`);
    
    // Formatear para respuesta
    const formatted = allLoans.map(loan => {
      const student = loan.student_id as any;
      const tools = loan.tools_borrowed.map(t => {
        const tool = t.tool_id as any;
        return {
          name: tool?.specificName || tool?.generalName || 'Sin nombre',
          category: tool?.category || 'Sin categoría',
          quantity: t.quantity || 1
        };
      });
      
      return {
        id: loan._id,
        studentEmail: student?.email || 'Sin email',
        studentName: student?.full_name || 'Sin nombre',
        status: loan.status,
        tools: tools,
        loanDate: loan.loan_date,
        returnDate: loan.estimated_return_date
      };
    });
    
    res.json({
      success: true,
      message: 'Endpoint básico funcionando',
      totalLoans: allLoans.length,
      loans: formatted
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    res.json({
      success: false,
      error: error.message,
      loans: []
    });
  }
};