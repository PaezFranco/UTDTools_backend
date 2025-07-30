import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, BookOpen, BarChart3, Edit, AlertCircle, CheckCircle, UserX, UserCheck, CalendarPlus, FileText, Fingerprint as FingerprintIcon, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const StudentProfilePage = () => {
  const { studentId: routeStudentId } = useParams(); 
  const [student, setStudent] = useState(null);
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Usar el contexto de autenticación
  const { apiRequest, user } = useAuth();

  // Función para mapear datos del backend al formato del frontend
  const mapBackendToFrontend = (backendStudent) => {
    return {
      id: backendStudent._id,
      studentId: backendStudent.student_id,
      name: backendStudent.full_name || '',
      email: backendStudent.email,
      status: backendStudent.blocked ? 'Bloqueado' : 'Activo',
      loans: 0, // Este campo será actualizado con los préstamos reales
      career: backendStudent.career || '',
      cuatrimestre: backendStudent.semester || 1,
      phone: backendStudent.phone || '',
      registrationDate: backendStudent.registration_date ? new Date(backendStudent.registration_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      blockReason: backendStudent.block_reason || '',
      fingerprintId: backendStudent.registered_fingerprint ? 'Registrada' : `FP-SIM-${backendStudent.student_id?.slice(-3) || '000'}`,
      group: backendStudent.group || ''
    };
  };

  // Función para mapear préstamos del backend al formato del frontend
  const mapLoanToFrontend = (loan) => {
    console.log('Mapping loan:', loan);
    
    const loanDate = new Date(loan.loan_date);
    const estimatedReturnDate = new Date(loan.estimated_return_date);
    const actualReturnDate = loan.actual_return_date ? new Date(loan.actual_return_date) : null;

    // Determinar el estado del préstamo
    let status = 'Activo';
    let statusClass = 'bg-blue-500/20 text-blue-400';

    if (loan.status === 'returned') {
      if (actualReturnDate && actualReturnDate > estimatedReturnDate) {
        status = 'Retraso';
        statusClass = 'bg-yellow-500/20 text-yellow-400';
      } else {
        status = 'OK';
        statusClass = 'bg-green-500/20 text-green-400';
      }
    } else if (loan.status === 'delayed' || (new Date() > estimatedReturnDate && loan.status === 'active')) {
      status = 'Vencido';
      statusClass = 'bg-red-500/20 text-red-400';
    }

    // Crear el nombre de las herramientas con mejor manejo de errores
    let toolNames = 'Herramientas no disponibles';
    
    try {
      if (loan.tools_borrowed && Array.isArray(loan.tools_borrowed)) {
        toolNames = loan.tools_borrowed.map(toolBorrowed => {
          const tool = toolBorrowed.tool_id;
          console.log('Processing tool in loan:', tool);
          
          if (tool && typeof tool === 'object') {
            // Intentar obtener el nombre usando los nuevos campos del modelo
            const toolName = tool.specificName || 
                            tool.name || 
                            tool.generalName || 
                            tool.general_name ||
                            tool.tool_name ||
                            'Herramienta sin nombre';
            
            // Intentar obtener el código usando los nuevos campos del modelo
            const toolCode = tool.toolId ||
                            tool.uniqueId || 
                            tool.barcode ||
                            tool.code || 
                            tool.tool_code ||
                            tool._id || 
                            'Sin código';
            
            const quantity = toolBorrowed.quantity || 1;
            
            return `${toolName} (${toolCode}) - Cant: ${quantity}`;
          } else {
            // Si tool_id no está populado, mostrar el ID
            const toolId = tool || toolBorrowed.tool_id;
            const quantity = toolBorrowed.quantity || 1;
            return `Herramienta ID: ${toolId} - Cant: ${quantity}`;
          }
        }).join(', ');
      }
    } catch (error) {
      console.error('Error processing tools for loan:', loan._id, error);
      toolNames = 'Error al cargar herramientas';
    }

    return {
      id: loan._id,
      toolName: toolNames,
      loanTime: loanDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      loanDate: loanDate.toLocaleDateString('es-ES'),
      dueDate: estimatedReturnDate.toISOString(),
      returnDate: actualReturnDate ? actualReturnDate.toISOString() : null,
      type: loan.status === 'returned' ? 'Préstamo/Devolución' : (status === 'Vencido' ? 'Préstamo Vencido' : 'Préstamo'),
      status: status,
      statusClass: statusClass,
      configuredTime: loan.configured_time || 0
    };
  };

  // Función para cargar préstamos del estudiante con mejor manejo de errores
  const loadStudentLoans = async (studentCode) => {
    try {
      setLoadingLoans(true);
      console.log(`Loading loans for student code: ${studentCode}`);
      
      // Intentar múltiples endpoints para obtener préstamos
      let loans = [];
      
      try {
        // Intentar endpoint específico por código de estudiante
        const response = await apiRequest(`/loans/student-code/${studentCode}`);
        
        if (response.ok) {
          loans = await response.json();
          console.log('Loans loaded from /loans/student-code:', loans);
        } else if (response.status === 404) {
          console.log('No loans found for student code, trying alternative endpoint');
          loans = [];
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.log('Primary endpoint failed, trying alternative approach:', error);
        
        try {
          // Fallback: obtener todos los préstamos y filtrar
          const allLoansResponse = await apiRequest('/loans');
          if (allLoansResponse.ok) {
            const allLoans = await allLoansResponse.json();
            console.log('All loans loaded, filtering for student:', studentCode);
            
            loans = allLoans.filter(loan => {
              const loanStudentId = loan.student_id?.student_id || loan.student_id?.id;
              return loanStudentId === studentCode;
            });
            
            console.log('Filtered loans for student:', loans);
          }
        } catch (fallbackError) {
          console.error('Fallback endpoint also failed:', fallbackError);
          loans = [];
        }
      }
      
      if (!Array.isArray(loans)) {
        console.error('Expected array of loans, received:', typeof loans);
        setLoanHistory([]);
        return;
      }

      const mappedLoans = loans.map(mapLoanToFrontend);
      console.log('Mapped loans:', mappedLoans);
      
      // Ordenar préstamos por fecha (más recientes primero)
      mappedLoans.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      
      setLoanHistory(mappedLoans);

      // Actualizar el número de préstamos activos/vencidos
      const activeLoans = mappedLoans.filter(loan => 
        loan.status === 'Activo' || loan.status === 'Vencido'
      ).length;

      setStudent(prev => ({ ...prev, loans: activeLoans }));

    } catch (error) {
      console.error('Error loading student loans:', error);
      toast({
        title: "Advertencia",
        description: `No se pudieron cargar los préstamos del estudiante: ${error.message}`,
        variant: "destructive"
      });
      setLoanHistory([]);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    const loadStudent = async () => {
      // Verificar que el usuario esté autenticado
      if (!user) {
        console.log('User not authenticated, waiting...');
        return;
      }

      try {
        setLoading(true);
        console.log(`Loading student with ID: ${routeStudentId}`);
        
        const response = await apiRequest('/students');
        if (!response.ok) {
          throw new Error('Error al cargar estudiantes');
        }
        
        const backendStudents = await response.json();
        console.log('All students loaded, searching for ID:', routeStudentId);
        
        const foundStudent = backendStudents.find(s => s._id === routeStudentId);
        console.log('Found student:', foundStudent);
        
        if (foundStudent) {
          const mappedStudent = mapBackendToFrontend(foundStudent);
          setStudent(mappedStudent);
          
          // Cargar historial de préstamos real usando el student_id (matrícula)
          await loadStudentLoans(foundStudent.student_id);
        } else {
          console.error(`Student not found with ID: ${routeStudentId}`);
          setStudent(null);
        }
      } catch (error) {
        console.error('Error loading student:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del estudiante",
          variant: "destructive"
        });
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    if (routeStudentId && user) {
      loadStudent();
    }
  }, [routeStudentId, user, toast, apiRequest]);

  // Auto-refresh cada 30 segundos cuando hay préstamos activos
  useEffect(() => {
    if (student && student.loans > 0) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing loans for active student');
        loadStudentLoans(student.studentId);
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [student]);

  const handleEditProfile = () => {
    if (student) {
      navigate('/students', { 
        state: { 
          action: 'editStudentFromProfile', 
          studentData: student
        } 
      });
    } else {
      toast({
        title: "Error",
        description: "No se pueden cargar los datos del estudiante para editar.",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleStatus = async () => {
    if (!student) return;

    const newStatus = student.status === 'Activo' ? 'Bloqueado' : 'Activo';
    const newBlockReason = newStatus === 'Bloqueado' ? prompt("Por favor, ingrese el motivo del bloqueo:", student.blockReason || "Incumplimiento de normas.") : '';
    
    if (newStatus === 'Bloqueado' && newBlockReason === null) return;

    try {
      const response = await apiRequest(`/students/block/${student.studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          blocked: newStatus === 'Bloqueado',
          block_reason: newBlockReason || ''
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado del estudiante');
      }

      const updatedStudent = {...student, status: newStatus, blockReason: newBlockReason || ''};
      setStudent(updatedStudent);

      toast({
        title: "Estado Actualizado",
        description: `El estado de ${student.name} ha cambiado a ${newStatus}. ${newStatus === 'Bloqueado' && newBlockReason ? `Motivo: ${newBlockReason}` : ''}`,
      });
    } catch (error) {
      console.error('Error toggling student status:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del estudiante",
        variant: "destructive"
      });
    }
  };

  const refreshLoans = async () => {
    if (student && student.studentId) {
      console.log('Manual refresh of loans requested');
      await loadStudentLoans(student.studentId);
      toast({
        title: "Préstamos Actualizados",
        description: "Se ha actualizado el historial de préstamos del estudiante",
      });
    }
  };

  // Componente para mostrar préstamos en móvil como tarjetas
  const LoanCard = ({ loan }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border p-4 shadow-sm ${
        loan.status === 'Activo' || loan.status === 'Vencido' ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm leading-tight">{loan.toolName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{loan.loanDate}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{loan.loanTime}</span>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${loan.statusClass} flex-shrink-0`}>
          {loan.status}
        </span>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Fecha límite:</span>
          <span className="font-medium text-gray-900">
            {new Date(loan.dueDate).toLocaleDateString('es-ES')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Hora límite:</span>
          <span className="font-medium text-gray-900">
            {new Date(loan.dueDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {loan.returnDate && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Devuelto:</span>
            <span className="font-medium text-green-600">
              {new Date(loan.returnDate).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Mostrar loading si no hay usuario autenticado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Cargando perfil del estudiante...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Estudiante no encontrado</h2>
          <p className="text-gray-600 mb-4">No se pudo encontrar información para el ID: {routeStudentId}</p>
          <Button asChild variant="outline">
            <Link to="/students">
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Volver a Estudiantes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-teal-700">Perfil del Estudiante</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header desktop */}
        <div className="hidden sm:flex items-center justify-between mb-6">
          <Button asChild variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white">
            <Link to="/students">
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Volver a Estudiantes
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">Perfil del Estudiante</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarjeta de perfil del estudiante */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto">
                  <img  
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-teal-600 shadow-md object-cover mx-auto" 
                    alt={`Avatar de ${student.name}`} 
                    src={student.avatar || "https://images.unsplash.com/photo-1698431048673-53ed1765ea07"} 
                  />
                  <span className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 block h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-white ${
                    student.status === 'Activo' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-lg sm:text-xl text-gray-900">{student.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    Matrícula: {student.studentId}
                  </CardDescription>
                  <CardDescription className="text-xs text-gray-500 mt-1">
                    ID: {student.id}
                  </CardDescription>
                  <span className={`inline-block mt-3 px-3 py-1 text-sm font-semibold rounded-full ${
                    student.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-3 text-teal-600 flex-shrink-0" /> 
                  <span className="text-gray-900 break-all">{student.email}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-3 text-teal-600 flex-shrink-0" /> 
                  <span className="text-gray-900">{student.phone}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-4 h-4 mr-3 text-teal-600 flex-shrink-0" /> 
                  <span className="text-gray-900">{student.career}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <BarChart3 className="w-4 h-4 mr-3 text-teal-600 flex-shrink-0" /> 
                  <span className="text-gray-900">Cuatrimestre: {student.cuatrimestre}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <CalendarPlus className="w-4 h-4 mr-3 text-teal-600 flex-shrink-0" /> 
                  <span className="text-gray-900">
                    Registrado: {new Date(student.registrationDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <AlertCircle className={`w-4 h-4 mr-3 flex-shrink-0 ${
                    student.loans > 0 ? 'text-orange-500' : 'text-teal-600'
                  }`} /> 
                  <span className={`text-gray-900 ${student.loans > 0 ? 'font-semibold text-orange-600' : ''}`}>
                    Préstamos Activos: {student.loans}
                  </span>
                </div>

                {student.status === 'Bloqueado' && student.blockReason && (
                  <div className="flex items-start text-gray-600 pt-4 border-t border-gray-200">
                    <FileText className="w-4 h-4 mr-3 text-red-500 mt-1 flex-shrink-0" /> 
                    <div className="flex-1">
                      <span className="font-semibold text-red-600 block">Motivo de Bloqueo:</span>
                      <p className="text-gray-900 text-xs mt-1">{student.blockReason}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              
              {/* Iconos de acción */}
              <div className="p-6 pt-0 flex justify-center gap-6">
                <button
                  onClick={handleEditProfile}
                  className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-orange-50 transition-colors group"
                  title="Editar perfil"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Edit className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-orange-600 transition-colors">
                    Editar
                  </span>
                </button>
                
                <button
                  onClick={handleToggleStatus}
                  className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors group ${
                    student.status === 'Activo' 
                      ? 'hover:bg-red-50' 
                      : 'hover:bg-green-50'
                  }`}
                  title={student.status === 'Activo' ? 'Bloquear estudiante' : 'Activar estudiante'}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    student.status === 'Activo'
                      ? 'bg-red-100 group-hover:bg-red-200'
                      : 'bg-green-100 group-hover:bg-green-200'
                  }`}>
                    {student.status === 'Activo' ? (
                      <UserX className="h-5 w-5 text-red-600" />
                    ) : (
                      <UserCheck className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <span className={`text-xs transition-colors ${
                    student.status === 'Activo'
                      ? 'text-gray-600 group-hover:text-red-600'
                      : 'text-gray-600 group-hover:text-green-600'
                  }`}>
                    {student.status === 'Activo' ? 'Bloquear' : 'Activar'}
                  </span>
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Sección de historial de préstamos */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-lg h-full">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl text-teal-700 flex items-center">
                      Historial de Préstamos
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Registro de herramientas solicitadas por {student.name}.
                      {student.loans > 0 && (
                        <span className="text-orange-600 font-medium"> 
                          ({student.loans} préstamo(s) activo(s))
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={refreshLoans} 
                    variant="outline" 
                    size="sm" 
                    disabled={loadingLoans}
                    className="self-start sm:self-center"
                  >
                    {loadingLoans ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="ml-2">Actualizar</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {loadingLoans ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    <span className="ml-2 text-gray-600">Actualizando préstamos...</span>
                  </div>
                ) : loanHistory.length > 0 ? (
                  <>
                    {/* Vista móvil - Tarjetas */}
                    <div className="block lg:hidden space-y-4">
                      {loanHistory.map((loan) => (
                        <LoanCard key={loan.id} loan={loan} />
                      ))}
                    </div>

                    {/* Vista desktop - Tabla */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-orange-600">Herramienta(s)</TableHead>
                            <TableHead className="text-orange-600">Fecha</TableHead>
                            <TableHead className="text-orange-600">Hora</TableHead>
                            <TableHead className="text-orange-600">Fecha Límite</TableHead>
                            <TableHead className="text-orange-600">Fecha Devolución</TableHead>
                            <TableHead className="text-orange-600 text-right">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loanHistory.map((loan) => (
                            <TableRow 
                              key={loan.id} 
                              className={loan.status === 'Activo' || loan.status === 'Vencido' ? 'bg-orange-50' : ''}
                            >
                              <TableCell className="font-medium text-gray-900 max-w-xs">
                                <div className="truncate" title={loan.toolName}>{loan.toolName}</div>
                              </TableCell>
                              <TableCell className="text-gray-600">{loan.loanDate}</TableCell>
                              <TableCell className="text-gray-600">{loan.loanTime}</TableCell>
                              <TableCell className="text-gray-600">
                                {new Date(loan.dueDate).toLocaleString('es-ES')}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {loan.returnDate ? new Date(loan.returnDate).toLocaleString('es-ES') : 'Pendiente'}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${loan.statusClass}`}>
                                  {loan.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-base sm:text-lg mb-2">
                      Este estudiante no tiene historial de préstamos.
                    </p>
                    <p className="text-gray-500 text-sm">
                      Los préstamos aparecerán aquí una vez que el estudiante solicite herramientas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;