import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  BarChart2, 
  ListChecks, 
  AlertTriangle, 
  Users, 
  Wrench, 
  Brain,
  Loader2,
  CheckCircle,
  TrendingUp,
  Package,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ReportsPage = () => {
  const { toast } = useToast();
  const { apiRequest, user } = useAuth();
  
  // Estados para manejo de reportes
  const [generatingReports, setGeneratingReports] = useState({});
  const [completedReports, setCompletedReports] = useState({});
  const [reportData, setReportData] = useState({});

  // Opciones de reportes con IA
  const reportOptions = [
    { 
      id: 'maintenance',
      title: "Análisis Predictivo de Mantenimiento", 
      description: "IA analiza patrones de uso y predice qué herramientas necesitarán mantenimiento próximamente.", 
      icon: <Wrench className="h-8 w-8 text-blue-500" />, 
      endpoint: '/reports/maintenance',
      aiFeatures: ['Predicción de fallas', 'Optimización de cronogramas', 'Análisis de costos'],
      color: 'blue'
    },
    { 
      id: 'optimization',
      title: "Optimización de Uso de Herramientas", 
      description: "IA identifica herramientas subutilizadas y recomienda redistribución del inventario.", 
      icon: <TrendingUp className="h-8 w-8 text-green-500" />, 
      endpoint: '/reports/optimization',
      aiFeatures: ['Detección de patrones', 'Recomendaciones de stock', 'Análisis de demanda'],
      color: 'green'
    },
    { 
      id: 'behavior',
      title: "Análisis de Comportamiento de Estudiantes", 
      description: "IA analiza patrones de préstamos para identificar comportamientos de riesgo.", 
      icon: <Users className="h-8 w-8 text-purple-500" />, 
      endpoint: '/reports/behavior',
      aiFeatures: ['Perfiles de usuario', 'Detección de riesgos', 'Recomendaciones de intervención'],
      color: 'purple'
    },
    { 
      id: 'efficiency',
      title: "Reporte de Eficiencia Operativa", 
      description: "IA evalúa el rendimiento del sistema y sugiere mejoras operacionales.", 
      icon: <Zap className="h-8 w-8 text-yellow-500" />, 
      endpoint: '/reports/efficiency',
      aiFeatures: ['Métricas de rendimiento', 'Identificación de cuellos de botella', 'Plan de optimización'],
      color: 'yellow'
    },
    { 
      id: 'inventory',
      title: "Recomendaciones de Inventario", 
      description: "IA analiza rotación y sugiere qué herramientas comprar, renovar o retirar.", 
      icon: <Package className="h-8 w-8 text-orange-500" />, 
      endpoint: '/reports/inventory',
      aiFeatures: ['Análisis de rotación', 'Planificación de compras', 'Gestión del ciclo de vida'],
      color: 'orange'
    }
  ];

  
  const handleGenerateAIReport = async (report) => {
    if (generatingReports[report.id]) return;

    setGeneratingReports(prev => ({ ...prev, [report.id]: true }));
    
    try {
      toast({
        title: " Generando Reporte con IA",
        description: `Analizando datos con inteligencia artificial para ${report.title}...`,
        duration: 3000,
      });

      console.log(`Iniciando generación de reporte: ${report.id}`);

      const response = await apiRequest(report.endpoint, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Reporte ${report.id} generado exitosamente:`, data);

        
        setReportData(prev => ({ ...prev, [report.id]: data }));
        setCompletedReports(prev => ({ ...prev, [report.id]: true }));

        toast({
          title: " Reporte Generado Exitosamente",
          description: `${report.title} ha sido generado por IA y está listo para descargar.`,
          duration: 5000,
        });

     
        setTimeout(() => {
          downloadReport(report.id, data);
        }, 2000);

      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar reporte');
      }

    } catch (error) {
      console.error(`Error generando reporte ${report.id}:`, error);
      toast({
        title: " Error al Generar Reporte",
        description: `No se pudo generar ${report.title}. ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setGeneratingReports(prev => ({ ...prev, [report.id]: false }));
    }
  };

  
  const downloadReport = (reportId, data) => {
    const report = reportOptions.find(r => r.id === reportId);
    const fileName = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: " Descarga Iniciada",
      description: `${fileName} se está descargando...`,
      duration: 3000,
    });
  };

  
  const viewReportDetails = (reportId) => {
    const data = reportData[reportId];
    if (!data) return;


    const newWindow = window.open('', '_blank', 'width=1000,height=700');
    newWindow.document.write(`
      <html>
        <head>
          <title>Reporte IA - ${reportOptions.find(r => r.id === reportId)?.title}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              line-height: 1.6; 
              background: #f8f9fa;
            }
            .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            h1 { 
              color: #2563eb; 
              border-bottom: 3px solid #3b82f6; 
              padding-bottom: 15px; 
              margin-bottom: 25px;
              font-size: 2.2em;
            }
            h2 { 
              color: #1e40af; 
              margin-top: 35px; 
              margin-bottom: 15px;
              font-size: 1.4em;
              border-left: 4px solid #3b82f6;
              padding-left: 15px;
            }
            .header-info { 
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border: 1px solid #93c5fd;
            }
            .section { 
              margin: 25px 0; 
              padding: 20px; 
              background: #f8fafc; 
              border-radius: 8px; 
              border: 1px solid #e2e8f0;
            }
            .highlight { 
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
              padding: 15px; 
              border-radius: 8px; 
              margin: 15px 0; 
              border: 1px solid #f59e0b;
            }
            pre { 
              background: #1e293b; 
              color: #e2e8f0; 
              padding: 20px; 
              border-radius: 8px; 
              overflow-x: auto; 
              font-size: 13px;
              border: 1px solid #475569;
            }
            .badge { 
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
              color: white; 
              padding: 6px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold;
              display: inline-block;
              margin: 5px 5px 5px 0;
            }
            .ai-badge {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            }
            .data-item {
              background: white;
              padding: 10px 15px;
              margin: 8px 0;
              border-radius: 6px;
              border-left: 4px solid #06b6d4;
            }
            .report-content {
              background: white;
              border: 2px solid #e5e7eb;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .print-btn {
              background: #059669;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              margin: 10px 5px;
            }
            .print-btn:hover {
              background: #047857;
            }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1> ${reportOptions.find(r => r.id === reportId)?.title}</h1>
            
            <div class="header-info">
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap; align-items: center;">
                <div>
                  <strong> Generado por IA:</strong> ${new Date(data.generatedAt).toLocaleString('es-ES')}<br>
                  <strong> Tipo de Reporte:</strong> ${data.reportType}
                </div>
                <div>
                  <span class="badge">Powered by Google Gemini AI</span>
                  <span class="badge ai-badge">IA Avanzada</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2> Datos Analizados</h2>
              ${Object.entries(data.dataAnalyzed || {}).map(([key, value]) => 
                `<div class="data-item"><strong>${key}:</strong> ${value}</div>`
              ).join('')}
            </div>

            <div class="report-content">
              <h2> Reporte Completo Generado por IA</h2>
              <pre>${JSON.stringify(data.report, null, 2)}</pre>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <button class="print-btn" onclick="window.print()"> Imprimir Reporte</button>
              <button class="print-btn" onclick="window.close()"> Cerrar Ventana</button>
            </div>
          </div>
        </body>
      </html>
    `);
  };

  // Obtener color del badge según el estado
  const getStatusBadge = (reportId) => {
    if (generatingReports[reportId]) {
      return <Badge className="bg-blue-500"> Generando...</Badge>;
    }
    if (completedReports[reportId]) {
      return <Badge className="bg-green-500"> Completado</Badge>;
    }
    return <Badge variant="outline"> Listo para generar</Badge>;
  };

  // Mostrar loading si no hay usuario autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando autenticación...</span>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">
          
          Reportes Inteligentes con IA
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Genera reportes avanzados utilizando inteligencia artificial de Google Gemini para obtener 
          insights profundos sobre el uso, mantenimiento y optimización de herramientas.
        </p>
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2">
           Powered by Google Gemini AI
        </Badge>
      </div>
      
      
      {/* Grid de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportOptions.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0,0,0,0.15)" }}
            className="transform transition-all duration-300"
          >
            <Card className={`bg-card shadow-lg h-full flex flex-col border-2 ${
              completedReports[report.id] ? 'border-green-500/50' : 
              generatingReports[report.id] ? 'border-blue-500/50' : 'border-transparent'
            }`}>
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {report.icon}
                    <div>
                      <CardTitle className="text-lg text-foreground leading-tight">
                        {report.title}
                      </CardTitle>
                    </div>
                  </div>
                  {getStatusBadge(report.id)}
                </div>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {report.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow space-y-4">
                {/* Características de IA */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-1 text-blue-500" />
                    Análisis con IA:
                  </h4>
                  <ul className="space-y-1">
                    {report.aiFeatures.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              
              {/* Botones de acción */}
              <div className="p-6 pt-0 space-y-2">
                <Button 
                  onClick={() => handleGenerateAIReport(report)} 
                  disabled={generatingReports[report.id]}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {generatingReports[report.id] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizando con IA...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generar con IA
                    </>
                  )}
                </Button>
                
                {/* Botones adicionales para reportes completados */}
                {completedReports[report.id] && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReport(report.id, reportData[report.id])}
                      className="flex-1"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Descargar
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => viewReportDetails(report.id)}
                      className="flex-1"
                    >
                      <BarChart2 className="mr-1 h-3 w-3" />
                      Ver Detalles
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Información sobre IA */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-gradient-gold-teal flex items-center">
            
            ¿Cómo funciona la IA en los reportes?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground"> Análisis Inteligente</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  Analiza patrones complejos en tus datos
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  Identifica tendencias que podrías pasar por alto
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  Genera recomendaciones basadas en mejores prácticas
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground"> Beneficios Clave</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                  Ahorra tiempo en análisis manual
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                  Detecta problemas antes de que ocurran
                </li>
                <li className="flex items-start">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" />
                  Optimiza la eficiencia operativa
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de reportes generados */}
      {Object.keys(completedReports).length > 0 && (
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gradient-gold-teal flex items-center">
              <BarChart2 className="mr-2 h-6 w-6" />
              Reportes Generados en esta Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(completedReports).length}
                </div>
                <div className="text-sm text-green-700">Reportes Completados</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(generatingReports).filter(key => generatingReports[key]).length}
                </div>
                <div className="text-sm text-blue-700">En Proceso</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {reportOptions.length - Object.keys(completedReports).length}
                </div>
                <div className="text-sm text-purple-700">Disponibles</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {new Date().toLocaleDateString('es-ES')}
                </div>
                <div className="text-sm text-orange-700">Fecha de Generación</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ReportsPage;









