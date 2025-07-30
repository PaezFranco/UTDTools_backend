import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Generar reporte de mantenimiento predictivo
  async generateMaintenanceReport(toolsData: any[], loansData: any[]) {
    const prompt = `
Como experto en gestión de herramientas industriales, analiza los siguientes datos y genera un reporte completo de mantenimiento predictivo:

DATOS DE HERRAMIENTAS:
${JSON.stringify(toolsData.slice(0, 20), null, 2)}

DATOS DE PRÉSTAMOS (últimos):
${JSON.stringify(loansData.slice(0, 50), null, 2)}

GENERA UN REPORTE ESTRUCTURADO QUE INCLUYA:

1. RESUMEN EJECUTIVO
2. HERRAMIENTAS QUE REQUIEREN MANTENIMIENTO INMEDIATO
3. HERRAMIENTAS CON ALTO RIESGO DE FALLA
4. RECOMENDACIONES DE MANTENIMIENTO PREVENTIVO
5. ANÁLISIS DE COSTOS DE MANTENIMIENTO
6. PLAN DE ACCIÓN PRIORITARIO

Formato: JSON con la siguiente estructura:
{
  "resumenEjecutivo": "string",
  "herramientasMantenimientoInmediato": [{"id": "string", "nombre": "string", "razon": "string", "prioridad": "Alta|Media|Baja"}],
  "herramientasAltoRiesgo": [{"id": "string", "nombre": "string", "riesgo": "string", "probabilidadFalla": "number"}],
  "recomendaciones": ["string"],
  "costoEstimado": "string",
  "planAccion": [{"accion": "string", "plazo": "string", "responsable": "string"}]
}

IMPORTANTE: Responde SOLO con el JSON válido, sin texto adicional.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Limpiar y parsear la respuesta
      const cleanedText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error generando reporte de mantenimiento:', error);
      throw new Error('Error al generar reporte con IA');
    }
  }

  // Generar reporte de optimización de uso
  async generateUsageOptimizationReport(toolsData: any[], loansData: any[], studentsData: any[]) {
    const prompt = `
Como analista de datos especializado en optimización de recursos, analiza estos datos del sistema de préstamos:

HERRAMIENTAS: ${JSON.stringify(toolsData.slice(0, 30), null, 2)}
PRÉSTAMOS: ${JSON.stringify(loansData.slice(0, 100), null, 2)}
ESTUDIANTES: ${JSON.stringify(studentsData.slice(0, 50), null, 2)}

GENERA UN ANÁLISIS DE OPTIMIZACIÓN QUE INCLUYA:

1. HERRAMIENTAS SUBUTILIZADAS
2. HERRAMIENTAS CON SOBREDEMANDA
3. PATRONES DE USO POR HORARIO/DÍA
4. RECOMENDACIONES DE REDISTRIBUCIÓN
5. SUGERENCIAS DE NUEVAS ADQUISICIONES
6. HERRAMIENTAS CANDIDATAS PARA RETIRO

Responde en formato JSON:
{
  "herramientasSubutilizadas": [{"id": "string", "nombre": "string", "porcentajeUso": "number", "recomendacion": "string"}],
  "herramientasSobredemanda": [{"id": "string", "nombre": "string", "demandasRechazadas": "number", "cantidadRecomendada": "number"}],
  "patronesUso": {"horasPico": ["string"], "diasMayorUso": ["string"], "temporadasAltas": ["string"]},
  "recomendacionesRedistribucion": ["string"],
  "nuevasAdquisiciones": [{"categoria": "string", "razon": "string", "prioridadAdquisicion": "string"}],
  "candidatasRetiro": [{"id": "string", "nombre": "string", "razon": "string"}]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error generando reporte de optimización:', error);
      throw new Error('Error al generar reporte de optimización');
    }
  }

  // Generar análisis de comportamiento de estudiantes
  async generateStudentBehaviorReport(studentsData: any[], loansData: any[], overdueData: any[]) {
    const prompt = `
Como psicólogo organizacional especializado en comportamiento de usuarios, analiza estos patrones de uso:

ESTUDIANTES: ${JSON.stringify(studentsData.slice(0, 50), null, 2)}
PRÉSTAMOS: ${JSON.stringify(loansData.slice(0, 100), null, 2)}
VENCIDOS: ${JSON.stringify(overdueData.slice(0, 30), null, 2)}

GENERA UN ANÁLISIS CONDUCTUAL QUE INCLUYA:

1. PERFILES DE USUARIOS IDENTIFICADOS
2. ESTUDIANTES DE ALTO RIESGO
3. PATRONES DE COMPORTAMIENTO PROBLEMÁTICO
4. RECOMENDACIONES DE INTERVENCIÓN
5. ESTRATEGIAS DE MEJORA
6. INDICADORES DE ALERTA TEMPRANA

Formato JSON:
{
  "perfilesUsuarios": [{"perfil": "string", "caracteristicas": ["string"], "porcentaje": "number"}],
  "estudiantesAltoRiesgo": [{"id": "string", "nombre": "string", "factoresRiesgo": ["string"], "recomendacion": "string"}],
  "patronesProblematicos": [{"patron": "string", "frecuencia": "string", "impacto": "string"}],
  "recomendacionesIntervencion": [{"accion": "string", "dirigidoA": "string", "tipoIntervencion": "string"}],
  "estrategiasMejora": ["string"],
  "indicadoresAlerta": [{"indicador": "string", "umbral": "string", "accion": "string"}]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error generando reporte de comportamiento:', error);
      throw new Error('Error al generar análisis de comportamiento');
    }
  }

  // Generar reporte de eficiencia operativa
  async generateEfficiencyReport(allData: any) {
    const prompt = `
Como consultor en eficiencia operativa, analiza estos datos del sistema de gestión:

DATOS COMPLETOS: ${JSON.stringify(allData, null, 2)}

GENERA UN REPORTE DE EFICIENCIA QUE INCLUYA:

1. MÉTRICAS DE RENDIMIENTO ACTUAL
2. CUELLOS DE BOTELLA IDENTIFICADOS
3. OPORTUNIDADES DE MEJORA
4. BENCHMARKS RECOMENDADOS
5. PLAN DE OPTIMIZACIÓN
6. ROI ESTIMADO DE MEJORAS

Formato JSON:
{
  "metricas": {"tiempoPromedioDevolucion": "string", "tasaDevolucionPuntual": "string", "utilizacionHerramientas": "string"},
  "cuellosBottella": [{"area": "string", "problema": "string", "impacto": "string"}],
  "oportunidadesMejora": [{"oportunidad": "string", "beneficioEstimado": "string", "esfuerzoImplementacion": "string"}],
  "benchmarks": [{"metrica": "string", "valorActual": "string", "valorObjetivo": "string"}],
  "planOptimizacion": [{"fase": "string", "acciones": ["string"], "tiempo": "string"}],
  "roiEstimado": {"inversionNecesaria": "string", "ahorroAnual": "string", "periodoRecuperacion": "string"}
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error generando reporte de eficiencia:', error);
      throw new Error('Error al generar reporte de eficiencia');
    }
  }

  // Generar reporte de recomendaciones de inventario
  async generateInventoryReport(toolsData: any[], loansData: any[], maintenanceData: any[]) {
    const prompt = `
Como especialista en gestión de inventarios industriales, analiza estos datos:

INVENTARIO ACTUAL: ${JSON.stringify(toolsData, null, 2)}
HISTORIAL DE PRÉSTAMOS: ${JSON.stringify(loansData.slice(0, 200), null, 2)}
DATOS DE MANTENIMIENTO: ${JSON.stringify(maintenanceData, null, 2)}

GENERA RECOMENDACIONES DE INVENTARIO:

1. ANÁLISIS DE ROTACIÓN DE INVENTARIO
2. HERRAMIENTAS A INCREMENTAR STOCK
3. HERRAMIENTAS A REDUCIR STOCK
4. NUEVAS CATEGORÍAS NECESARIAS
5. PLAN DE RENOVACIÓN DE EQUIPOS
6. PRESUPUESTO RECOMENDADO

Formato JSON:
{
  "rotacionInventario": {"altaRotacion": ["string"], "bajaRotacion": ["string"], "rotacionPromedio": "string"},
  "incrementarStock": [{"herramienta": "string", "stockActual": "number", "stockRecomendado": "number", "justificacion": "string"}],
  "reducirStock": [{"herramienta": "string", "razon": "string", "accionRecomendada": "string"}],
  "nuevasCategorias": [{"categoria": "string", "herramientasSugeridas": ["string"], "prioridad": "string"}],
  "planRenovacion": [{"herramienta": "string", "vidaUtilRestante": "string", "fechaRenovacion": "string"}],
  "presupuestoRecomendado": {"totalAnual": "string", "distribucionPorCategoria": {}, "justificacion": "string"}
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error generando reporte de inventario:', error);
      throw new Error('Error al generar reporte de inventario');
    }
  }
}

export default new GeminiService();
