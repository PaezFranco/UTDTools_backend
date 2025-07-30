import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Loader2, User, Mail, Phone, GraduationCap, Calendar, MoreVertical, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Wrench, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StudentForm from '@/components/StudentForm';

export const predefinedCareers = [
  'Ing. en Mecatrónica',
  'Ing. en Tecnologías de la Información',
  'Ing. en Energías Renovables',
  'Ing. en Logística Internacional',
  'Ing. en Desarrollo y Gestión de Software',
  'Ing. en Nanotecnología',
  'Lic. en Administración y Gestión Empresarial',
  'TSU. en Procesos Industriales',
  'Otra',
];

// Componente de tarjeta de estudiante para móviles
const StudentCard = ({ student, onViewProfile, onToggleStatus, onEdit }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header de la tarjeta */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">{student.name}</h3>
          </div>
          <p className="text-xs text-gray-500 font-mono">#{student.studentId}</p>
        </div>
        
        {/* Estado */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            student.status === 'Activo' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {student.status}
          </span>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Información del estudiante */}
      <div className="space-y-2 text-xs">
        {student.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-3 w-3" />
            <span className="truncate">{student.email}</span>
          </div>
        )}
        
        {student.career && (
          <div className="flex items-center gap-2 text-gray-600">
            <GraduationCap className="h-3 w-3" />
            <span className="truncate">{student.career}</span>
          </div>
        )}
        
        {student.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-3 w-3" />
            <span>{student.phone}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>Cuatrimestre {student.cuatrimestre}</span>
        </div>
      </div>

      {/* Acciones desplegables */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-gray-200"
        >
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(student.id)}
              className="text-xs h-8"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(student)}
              className="text-xs h-8"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(student.id)}
              className="text-xs h-8 col-span-2"
            >
              {student.status === 'Activo' ? <ToggleLeft className="h-3 w-3 mr-1" /> : <ToggleRight className="h-3 w-3 mr-1" />}
              {student.status === 'Activo' ? 'Bloquear' : 'Activar'}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Componente de tabla para desktop
const StudentsTable = ({ students, onViewProfile, onToggleStatus, onEdit }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Matrícula</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Nombre</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Email</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Carrera</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Estado</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 text-sm font-mono text-gray-900">{student.studentId}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{student.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{student.career}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.status === 'Activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewProfile(student.id)}
                    className="h-8 w-8 p-0"
                    title="Ver perfil"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(student)}
                    className="h-8 w-8 p-0"
                    title="Editar estudiante"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(student.id)}
                    className="h-8 w-8 p-0"
                    title={student.status === 'Activo' ? 'Bloquear estudiante' : 'Activar estudiante'}
                  >
                    {student.status === 'Activo' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [entityFilter, setEntityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
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
      loans: 0,
      career: backendStudent.career || '',
      cuatrimestre: backendStudent.semester || 1,
      phone: backendStudent.phone || '',
      registrationDate: backendStudent.registration_date ? new Date(backendStudent.registration_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      blockReason: backendStudent.block_reason || '',
      fingerprintId: backendStudent.registered_fingerprint ? 'Registrada' : '',
      group: backendStudent.group || ''
    };
  };

  // Función para mapear datos del frontend al formato del backend
  const mapFrontendToBackend = (frontendStudent) => {
    return {
      student_id: frontendStudent.studentId,
      full_name: frontendStudent.name,
      email: frontendStudent.email,
      career: frontendStudent.career,
      semester: frontendStudent.cuatrimestre,
      phone: frontendStudent.phone,
      group: frontendStudent.group || '',
      blocked: frontendStudent.status === 'Bloqueado',
      block_reason: frontendStudent.blockReason || '',
      is_profile_complete: true
    };
  };

  // Cargar estudiantes desde la API usando apiRequest
  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/students');
      
      if (!response.ok) {
        throw new Error('Error al cargar estudiantes');
      }
      
      const backendStudents = await response.json();
      const mappedStudents = backendStudents.map(mapBackendToFrontend);
      setStudents(mappedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes. Verifica tu conexión.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  const openModal = useCallback((student = null) => {
    if (student && (student.isCompletingRegistration || student.isEditingFromProfile)) {
      setCurrentStudent(student);
    } else {
      setCurrentStudent(student ? { ...student } : { 
        id: '', 
        studentId: '', 
        name: '', 
        email: '', 
        status: 'Activo', 
        loans: 0, 
        career: '', 
        cuatrimestre: 1, 
        phone: '', 
        registrationDate: new Date().toISOString().split('T')[0], 
        blockReason: '', 
        fingerprintId: '',
        group: ''
      });
    }
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    const processLocationState = () => {
      if (location.state?.action === 'completeRegistration' && location.state?.pendingStudentData) {
        const { pendingStudentData } = location.state;
        openModal({
          studentId: pendingStudentData.studentId, 
          name: pendingStudentData.name,
          email: '', 
          status: 'Activo', 
          loans: 0, 
          career: '', 
          cuatrimestre: 1, 
          phone: '', 
          registrationDate: new Date().toISOString().split('T')[0], 
          blockReason: '',
          fingerprintId: '',
          group: '',
          isCompletingRegistration: true 
        });
        navigate(location.pathname, { replace: true, state: {} });
      } else if (location.state?.action === 'editStudentFromProfile' && location.state?.studentData) {
        const { studentData } = location.state;
        openModal({ ...studentData, isEditingFromProfile: true });
        navigate(location.pathname, { replace: true, state: {} });
      }
    };
    processLocationState();
  }, [location.state, navigate, openModal]);

  // Filtrar solo estudiantes activos para mostrar en la lista
  const filteredStudents = students.filter(student => {
    // Solo mostrar estudiantes activos
    if (student.status === 'Bloqueado') return false;
    
    const matchesEntityFilter = !entityFilter || 
      student.name.toLowerCase().includes(entityFilter.toLowerCase()) ||
      student.career?.toLowerCase().includes(entityFilter.toLowerCase()) ||
      String(student.studentId).toLowerCase().includes(entityFilter.toLowerCase()) ||
      student.email.toLowerCase().includes(entityFilter.toLowerCase());
    
    return matchesEntityFilter;
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStudent(null);
    setSubmitting(false);
  };
  
  const handleSubmit = async (submittedStudent) => {
    if (!submittedStudent.name || !submittedStudent.email || !submittedStudent.career || !submittedStudent.studentId) {
      toast({ 
        title: "Error", 
        description: "Matrícula, Nombre, email y carrera son obligatorios.", 
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);

    try {
      const backendData = mapFrontendToBackend(submittedStudent);
      const isEditing = submittedStudent.id && submittedStudent.id !== '';

      if (isEditing) {
        const response = await apiRequest(`/students/${submittedStudent.id}`, {
          method: 'PUT',
          body: JSON.stringify(backendData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar estudiante');
        }

        toast({ 
          title: "Estudiante Actualizado", 
          description: `${submittedStudent.name} ha sido actualizado exitosamente.`
        });
      } else {
        const response = await apiRequest('/students', {
          method: 'POST',
          body: JSON.stringify(backendData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear estudiante');
        }

        toast({ 
          title: "Estudiante Agregado", 
          description: `${submittedStudent.name} ha sido agregado con matrícula ${submittedStudent.studentId}.`
        });
      }

      await loadStudents();
      closeModal();

    } catch (error) {
      console.error('Error submitting student:', error);
      toast({
        title: "Error",
        description: error.message || "Error al procesar la solicitud",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const openBlockConfirm = (student) => {
    setStudentToBlock(student);
    setIsBlockConfirmOpen(true);
  };

  const closeBlockConfirm = () => {
    setStudentToBlock(null);
    setIsBlockConfirmOpen(false);
  };

  const openDeleteConfirm = (student) => {
    setStudentToDelete(student);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setStudentToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const response = await apiRequest(`/students/block/${studentToDelete.studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          blocked: true,
          block_reason: 'Estudiante eliminado del sistema'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar estudiante');
      }

      toast({ 
        title: "Estudiante Eliminado", 
        description: `${studentToDelete.name} ha sido eliminado del sistema.`
      });

      await loadStudents();
      closeDeleteConfirm();

    } catch (error) {
      console.error('Error blocking student:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el estudiante",
        variant: "destructive"
      });
    }
  };

  const toggleStudentStatus = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Si el estudiante está activo, mostrar confirmación para "eliminar"
    if (student.status === 'Activo') {
      openDeleteConfirm(student);
      return;
    }

    // Si está bloqueado, reactivar directamente
    try {
      const response = await apiRequest(`/students/block/${student.studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          blocked: false,
          block_reason: ''
        }),
      });

      if (!response.ok) {
        throw new Error('Error al reactivar estudiante');
      }

      toast({ 
        title: "Estudiante Reactivado", 
        description: `${student.name} ha sido reactivado exitosamente.`
      });

      await loadStudents();

    } catch (error) {
      console.error('Error reactivating student:', error);
      toast({
        title: "Error",
        description: "No se pudo reactivar el estudiante",
        variant: "destructive"
      });
    }
  };

  const handleBlockStudent = async () => {
    if (!studentToBlock) return;

    try {
      const response = await apiRequest(`/students/block/${studentToBlock.studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          blocked: true,
          block_reason: 'Estudiante eliminado del sistema'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar estudiante');
      }

      toast({ 
        title: "Estudiante Eliminado", 
        description: `${studentToBlock.name} ha sido eliminado del sistema.`
      });

      await loadStudents();
      closeBlockConfirm();

    } catch (error) {
      console.error('Error blocking student:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el estudiante",
        variant: "destructive"
      });
    }
  };

  const viewStudentProfile = (studentInternalId) => {
    navigate(`/students/${studentInternalId}`);
  };

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
          <p className="text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-teal-700">Estudiantes</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => openModal()} 
              variant="ghost" 
              size="sm"
              className="text-teal-600"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Filtros móviles */}
        {showFilters && (
          <div className="mt-4 space-y-3 pb-4 border-t border-gray-200 pt-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar estudiante o carrera..."
                className="pl-10"
                onChange={(e) => setEntityFilter(e.target.value)}
                value={entityFilter}
              />
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header desktop */}
          <div className="hidden sm:flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">Gestión de Estudiantes</h1>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => openModal()} 
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Agregar Estudiante
              </Button>
              <Button 
                onClick={() => loadStudents()} 
                variant="outline"
                size="sm"
                className="border-custom-gold/30 hover:bg-custom-gold/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filtro por entidad - Desktop */}
          <div className="relative mb-4 hidden sm:block">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Wrench className="absolute left-9 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filtrar por Estudiante o Carrera (ID/Nombre)..."
              className="pl-16 w-full bg-input border-custom-gold/30 focus:border-custom-gold"
              onChange={(e) => setEntityFilter(e.target.value)}
              value={entityFilter}
            />
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
                <p className="text-gray-600">Cargando estudiantes...</p>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {entityFilter ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  {entityFilter
                    ? 'Intenta modificar los términos de búsqueda o verifica la información.' 
                    : 'Comienza agregando tu primer estudiante al sistema para gestionar la información académica.'
                  }
                </p>
                {!entityFilter && (
                  <Button 
                    onClick={() => openModal()} 
                    className="bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Primer Estudiante
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Información del total de resultados */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {entityFilter ? (
                    <>Mostrando {filteredStudents.length} de {students.filter(s => s.status === 'Activo').length} estudiantes</>
                  ) : (
                    <>Total: {students.filter(s => s.status === 'Activo').length} estudiantes activos</>
                  )}
                </p>
              </div>

              {/* Vista móvil - Tarjetas */}
              <div className="block lg:hidden">
                <div className="grid gap-4 pb-6">
                  {filteredStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onViewProfile={viewStudentProfile}
                      onToggleStatus={toggleStudentStatus}
                      onEdit={openModal}
                    />
                  ))}
                </div>
              </div>

              {/* Vista desktop - Tabla */}
              <div className="hidden lg:block pb-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <StudentsTable
                    students={filteredStudents}
                    onViewProfile={viewStudentProfile}
                    onToggleStatus={toggleStudentStatus}
                    onEdit={openModal}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modales */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-teal-700">
              {currentStudent?.isCompletingRegistration ? 'Completar Registro de Estudiante' : 
               (currentStudent?.id ? 'Editar Estudiante' : 'Agregar Nuevo Estudiante')}
            </DialogTitle>
            <DialogDescription>
              {currentStudent?.isCompletingRegistration ? 
               `Completando datos para ${currentStudent.name} (${currentStudent.studentId}).` : 
               'Completa o modifica los detalles del estudiante.'}
            </DialogDescription>
          </DialogHeader>
          {currentStudent && (
            <StudentForm
              studentData={currentStudent}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              predefinedCareers={predefinedCareers}
              isEditing={!!currentStudent.id}
              isCompletingRegistration={currentStudent?.isCompletingRegistration}
              isSubmitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Bloqueo
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3">
                <p>¿Estás seguro de que quieres bloquear al estudiante?</p>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">
                      {studentToDelete?.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Matrícula: {studentToDelete?.studentId}</p>
                  <p className="text-sm text-gray-600">Carrera: {studentToDelete?.career}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-red-800 mb-1">Esta acción:</p>
                      <ul className="text-red-700 space-y-1">
                    
                        <li>• Bloqueará su acceso al sistema</li>
                        <li>• Impedirá nuevos préstamos</li>
                        <li>• Se puede revertir desde la base de datos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={closeDeleteConfirm}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteStudent}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Confirmar Bloqueo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsPage;

