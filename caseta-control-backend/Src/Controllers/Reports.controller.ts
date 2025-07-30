import { Request, Response } from 'express';
import GeminiService from '../Services/GeminiService';
import Tool from '../Models/Tool.model';
import Loan from '../Models/Loan.model';
import Student from '../Models/Student.model';

// Generar reporte de mantenimiento con IA
export const generateMaintenanceReport = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando generación de reporte de mantenimiento...');
    
    // Obtener datos del sistema
    const [tools, loans] = await Promise.all([
      Tool.find({}).lean(),
      Loan.find({}).populate('tools_borrowed.tool_id').lean()
    ]);

    console.log(`Datos obtenidos: ${tools.length} herramientas, ${loans.length} préstamos`);

    // Generar reporte con IA
    const aiReport = await GeminiService.generateMaintenanceReport(tools, loans);

    res.json({
      success: true,
      reportType: 'maintenance',
      generatedAt: new Date().toISOString(),
      dataAnalyzed: {
        tools: tools.length,
        loans: loans.length
      },
      report: aiReport
    });

  } catch (error: any) {
    console.error('Error generando reporte de mantenimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de mantenimiento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generar reporte de optimización de uso
export const generateUsageOptimizationReport = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando generación de reporte de optimización...');
    
    const [tools, loans, students] = await Promise.all([
      Tool.find({}).lean(),
      Loan.find({}).populate('tools_borrowed.tool_id').lean(),
      Student.find({}).lean()
    ]);

    const aiReport = await GeminiService.generateUsageOptimizationReport(tools, loans, students);

    res.json({
      success: true,
      reportType: 'optimization',
      generatedAt: new Date().toISOString(),
      dataAnalyzed: {
        tools: tools.length,
        loans: loans.length,
        students: students.length
      },
      report: aiReport
    });

  } catch (error: any) {
    console.error('Error generando reporte de optimización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de optimización',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generar análisis de comportamiento de estudiantes
export const generateStudentBehaviorReport = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando análisis de comportamiento de estudiantes...');
    
    const [students, loans, overdueLoans] = await Promise.all([
      Student.find({}).lean(),
      Loan.find({}).populate('student_id').populate('tools_borrowed.tool_id').lean(),
      Loan.find({ 
        status: { $in: ['active', 'delayed'] },
        estimated_return_date: { $lt: new Date() }
      }).populate('student_id').lean()
    ]);

    const aiReport = await GeminiService.generateStudentBehaviorReport(students, loans, overdueLoans);

    res.json({
      success: true,
      reportType: 'behavior',
      generatedAt: new Date().toISOString(),
      dataAnalyzed: {
        students: students.length,
        loans: loans.length,
        overdueLoans: overdueLoans.length
      },
      report: aiReport
    });

  } catch (error: any) {
    console.error('Error generando análisis de comportamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar análisis de comportamiento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generar reporte de eficiencia operativa
export const generateEfficiencyReport = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando reporte de eficiencia operativa...');
    
    const [tools, loans, students, returns] = await Promise.all([
      Tool.find({}).lean(),
      Loan.find({}).populate('student_id').populate('tools_borrowed.tool_id').lean(),
      Student.find({}).lean(),
      // Agregar datos de devoluciones si tienes el modelo Return
      // Return.find({}).populate('student_id').populate('tools_returned.tool_id').lean()
      [] // Por ahora vacío si no tienes el modelo Return implementado
    ]);

    const allData = {
      tools,
      loans,
      students,
      returns,
      summary: {
        totalTools: tools.length,
        activeLoans: loans.filter(l => l.status === 'active').length,
        totalStudents: students.length,
        blockedStudents: students.filter(s => s.blocked).length
      }
    };

    const aiReport = await GeminiService.generateEfficiencyReport(allData);

    res.json({
      success: true,
      reportType: 'efficiency',
      generatedAt: new Date().toISOString(),
      dataAnalyzed: allData.summary,
      report: aiReport
    });

  } catch (error: any) {
    console.error('Error generando reporte de eficiencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de eficiencia',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generar reporte de inventario
export const generateInventoryReport = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando reporte de inventario...');
    
    const [tools, loans] = await Promise.all([
      Tool.find({}).lean(),
      Loan.find({}).populate('tools_borrowed.tool_id').lean()
    ]);

    // Simular datos de mantenimiento (puedes conectar con datos reales)
    const maintenanceData = tools.map(tool => ({
      toolId: tool._id,
      lastMaintenance: tool.last_maintenance,
      nextMaintenance: tool.next_maintenance,
      maintenanceStatus: tool.maintenance_status,
      usageCount: tool.usage_count
    }));

    const aiReport = await GeminiService.generateInventoryReport(tools, loans, maintenanceData);

    res.json({
      success: true,
      reportType: 'inventory',
      generatedAt: new Date().toISOString(),
      dataAnalyzed: {
        tools: tools.length,
        loans: loans.length,
        maintenanceRecords: maintenanceData.length
      },
      report: aiReport
    });

  } catch (error: any) {
    console.error('Error generando reporte de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de inventario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};