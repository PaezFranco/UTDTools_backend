import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fingerprint, ScanLine, CalendarClock, UserCircle, PlusCircle, Trash2, AlertCircle, UserCog, CreditCard, Users, GraduationCap, Loader2, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const NewLoanPage = () => {
  // Usar el contexto de autenticación
  const { apiRequest, user } = useAuth();
  
  // Estados existentes
  const [scannedStudentId, setScannedStudentId] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [isScanningStudent, setIsScanningStudent] = useState(false);
  const [searchType, setSearchType] = useState('fingerprint');
  
  const [scannedToolId, setScannedToolId] = useState('');
  const [isScanningTool, setIsScanningTool] = useState(false);
  const [loanItems, setLoanItems] = useState([]);
  
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [loanTime, setLoanTime] = useState('');

  // Estados ESP32 agregados
  const [espConnected, setEspConnected] = useState(false);
  const [fingerprintMode, setFingerprintMode] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);

  const ESP32_IP = '192.168.100.30'; // Cambiar por tu IP real
  
  // Estados para conectar con backend
  const [allStudents, setAllStudents] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [configuredTimeHours, setConfiguredTimeHours] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { toast } = useToast();

  // Lista predefinida de maestros
  const predefinedTeachers = [
    { _id: 'teacher1', full_name: 'Ing. Carlos Mendoza', email: 'carlos.mendoza@instituto.edu', subject: 'Mecatrónica' },
    { _id: 'teacher2', full_name: 'Lic. Ana García', email: 'ana.garcia@instituto.edu', subject: 'Administración' },
    { _id: 'teacher3', full_name: 'Dr. Luis Rodríguez', email: 'luis.rodriguez@instituto.edu', subject: 'Energías Renovables' },
    { _id: 'teacher4', full_name: 'Ing. María López', email: 'maria.lopez@instituto.edu', subject: 'Tecnologías de la Información' },
    { _id: 'teacher5', full_name: 'Mtro. Roberto Silva', email: 'roberto.silva@instituto.edu', subject: 'Nanotecnología' },
    { _id: 'teacher6', full_name: 'Dra. Carmen Hernández', email: 'carmen.hernandez@instituto.edu', subject: 'Desarrollo de Software' },
    { _id: 'teacher7', full_name: 'Ing. Fernando Castro', email: 'fernando.castro@instituto.edu', subject: 'Logística Internacional' }
  ];

  // TODOS los useEffect juntos al inicio
  useEffect(() => {
    if (user) {
      loadInitialData();
      initializeTimes();
      // Establecer supervisor por defecto (usuario actual)
      setSelectedSupervisor(user._id || user.id);
      console.log('Usuario logueado:', user);
      console.log('Supervisor seleccionado automáticamente:', user._id || user.id);
      
      // Agregar funcionalidad ESP32
      checkESP32Connection();
      const connectionCheck = setInterval(checkESP32Connection, 15000);
      
      return () => {
        clearInterval(connectionCheck);
        stopPolling();
      };
    }
  }, [user]);

  useEffect(() => {
    if (configuredTimeHours) {
      const now = new Date();
      const newDueDateTime = new Date(now.getTime() + configuredTimeHours * 60 * 60 * 1000);
      setDueDate(newDueDateTime.toISOString().split('T')[0]);
      setDueTime(newDueDateTime.toTimeString().split(' ')[0].substring(0,5));
    }
  }, [configuredTimeHours]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [pollInterval]);

  const initializeTimes = () => {
    const now = new Date();
    setLoanTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const defaultDueDateTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    setDueDate(defaultDueDateTime.toISOString().split('T')[0]);
    setDueTime(defaultDueDateTime.toTimeString().split(' ')[0].substring(0,5));
  };

  // Funciones ESP32 agregadas
  const checkESP32Connection = async () => {
    try {
      const response = await fetch(`${ESP32_IP}/status`, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEspConnected(data.connected);
        console.log('ESP32 conectado:', data);
        return data.connected;
      } else {
        setEspConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Error conectando con ESP32:', error);
      setEspConnected(false);
      return false;
    }
  };

  const startFingerprintMode = async () => {
    try {
      const response = await fetch(`${ESP32_IP}/start-auto`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setFingerprintMode(true);
        startPolling();
        
        toast({
          title: "Sensor Activado",
          description: "Coloque su dedo en el sensor AS608",
          variant: "default"
        });
        
        console.log('Modo automático activado en ESP32');
      } else {
        throw new Error('Error activando sensor');
      }
    } catch (error) {
      console.error('Error activando sensor:', error);
      toast({
        title: "Error",
        description: "No se pudo activar el sensor de huellas",
        variant: "destructive"
      });
    }
  };

  const stopFingerprintMode = async () => {
    try {
      await fetch(`${ESP32_IP}/stop-auto`, {
        method: 'POST',
        mode: 'cors'
      });
      
      setFingerprintMode(false);
      stopPolling();
      
      toast({
        title: "Sensor Desactivado",
        description: "Modo automático desactivado",
        variant: "default"
      });
      
      console.log('Modo automático desactivado');
    } catch (error) {
      console.error('Error desactivando sensor:', error);
    }
  };

  const checkForResults = async () => {
    try {
      const response = await fetch(`${ESP32_IP}/get-result`, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.type === 'fingerprint_result') {
          console.log('Resultado recibido del ESP32:', data);
          await handleFingerprintResult(data);
          stopFingerprintMode(); // Desactivar después de recibir resultado
        }
      }
    } catch (error) {
      console.error('Error obteniendo resultados del ESP32:', error);
    }
  };

  const startPolling = () => {
    if (pollInterval) clearInterval(pollInterval);
    
    console.log('Iniciando polling para resultados...');
    const interval = setInterval(checkForResults, 1000); // Revisar cada segundo
    setPollInterval(interval);
  };

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
      console.log('Polling detenido');
    }
  };

  const handleFingerprintResult = async (data) => {
    if (data.success) {
      setIsScanningStudent(true);
      
      toast({
        title: "Huella Detectada",
        description: `Confianza: ${data.confidence}% - Verificando identidad...`,
        variant: "default"
      });
      
      try {
        // Buscar estudiante por ID de huella
        const foundStudent = await searchStudentByFingerprint(data.fingerprintId);
        
        setTimeout(() => {
          if (foundStudent && foundStudent.status !== 'Bloqueado') {
            setStudentInfo(foundStudent);
            
            toast({
              title: "Acceso Autorizado",
              description: `Bienvenido ${foundStudent.name} - ID Huella: ${data.fingerprintId}`,
              variant: "default",
              duration: 5000
            });
            
            console.log('Estudiante identificado por huella:', foundStudent);
          } else {
            toast({
              title: "Acceso Denegado",
              description: foundStudent ? "Estudiante bloqueado" : "Estudiante no encontrado en base de datos",
              variant: "destructive",
              duration: 4000
            });
          }
          setIsScanningStudent(false);
        }, 1500);
        
      } catch (error) {
        console.error('Error verificando huella:', error);
        setIsScanningStudent(false);
        
        toast({
          title: "Error",
          description: "Error al verificar la huella en el sistema",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Huella No Reconocida",
        description: "La huella no está registrada en el sensor",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const searchStudentByFingerprint = async (fingerprintId) => {
    try {
      console.log('Buscando estudiante por huella ID:', fingerprintId);
      
      const response = await apiRequest(`/fingerprint/student/${fingerprintId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.student) {
          return mapBackendStudentToFrontend(data.student);
        } else {
          console.log('No se encontró estudiante para la huella:', fingerprintId);
          return null;
        }
      } else {
        console.error('Error en respuesta del servidor:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error buscando estudiante por huella:', error);
      return null;
    }
  };

  // Cargar datos iniciales usando apiRequest
  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      
      // Cargar estudiantes
      try {
        const studentsResponse = await apiRequest('/students');
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          console.log('Estudiantes cargados:', studentsData.length);
          setAllStudents(studentsData);
        } else {
          console.error('Error al cargar estudiantes:', studentsResponse.status);
          toast({
            title: "Error",
            description: "No se pudieron cargar los estudiantes",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error en petición de estudiantes:', error);
        toast({
          title: "Error",
          description: "Error de conexión al cargar estudiantes",
          variant: "destructive"
        });
      }

      // Cargar herramientas
      try {
        const toolsResponse = await apiRequest('/tools');
        if (toolsResponse.ok) {
          const toolsData = await toolsResponse.json();
          console.log('→ Herramientas cargadas:', toolsData.length);

          const mappedTools = toolsData.map(mapBackendToolToFrontend);
          setAllTools(mappedTools);
        } else {
          console.error('Error al cargar herramientas:', toolsResponse.status);
          toast({
            title: "Error",
            description: "No se pudieron cargar las herramientas",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error en petición de herramientas:', error);
        toast({
          title: "Error",
          description: "Error de conexión al cargar herramientas",
          variant: "destructive"
        });
      }

      // Cargar supervisores
      try {
        const supervisorsResponse = await apiRequest('/supervisors');
        if (supervisorsResponse.ok) {
          const supervisorsData = await supervisorsResponse.json();
          console.log('Supervisores cargados:', supervisorsData.length);
          
          // Asegurar que el usuario actual esté en la lista de supervisores
          const currentUserSupervisor = {
            _id: user._id || user.id,
            full_name: user.name || user.email,
            email: user.email,
            role: user.role
          };
          
          // Verificar si el usuario actual ya está en la lista
          const userInList = supervisorsData.find(s => s._id === (user._id || user.id));
          
          if (userInList) {
            setSupervisors(supervisorsData);
          } else {
            // Agregar el usuario actual al principio de la lista
            setSupervisors([currentUserSupervisor, ...supervisorsData]);
          }
        } else {
          console.error('Error al cargar supervisores:', supervisorsResponse.status);
          // Si no hay endpoint específico, usar el usuario actual
          if (user) {
            setSupervisors([{
              _id: user._id || user.id,
              full_name: user.name || user.email,
              email: user.email,
              role: user.role
            }]);
          }
        }
      } catch (error) {
        console.error('Error en petición de supervisores:', error);
        // Fallback: usar usuario actual
        if (user) {
          setSupervisors([{
            _id: user._id || user.id,
            full_name: user.name || user.email,
            email: user.email,
            role: user.role
          }]);
        }
      }

      // Usar maestros predefinidos
      setTeachers(predefinedTeachers);

    } catch (error) {
      console.error('Error general loading initial data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar todos los datos iniciales",
        variant: "destructive"
      });
    } finally {
      setInitialLoading(false);
    }
  };
  
  // Mapear datos del backend al formato del frontend
  const mapBackendStudentToFrontend = (backendStudent) => {
    return {
      id: backendStudent._id,
      studentId: backendStudent.student_id,
      name: backendStudent.full_name || '',
      email: backendStudent.email,
      status: backendStudent.blocked ? 'Bloqueado' : 'Activo',
      career: backendStudent.career || '',
      cuatrimestre: backendStudent.semester || 1,
      avatar: backendStudent.avatar || 'https://images.unsplash.com/photo-1698431048673-53ed1765ea07',
      phone: backendStudent.phone || '',
      group: backendStudent.group || '',
      fingerprintId: backendStudent.registered_fingerprint ? 'Registrada' : 'No registrada',
      blockReason: backendStudent.block_reason || ''
    };
  };

// PARA NewLoanPage.jsx - Función mejorada para mapear herramientas
const mapBackendToolToFrontend = (backendTool) => {
  console.log('Mapeando herramienta del backend:', backendTool);
  
  // Intentar obtener el nombre de la herramienta de diferentes campos posibles
  const toolName = backendTool.specificName || 
                   backendTool.name || 
                   backendTool.generalName || 
                   backendTool.general_name ||
                   backendTool.tool_name ||
                   'Herramienta sin nombre';
  
  // Intentar obtener el código/ID de diferentes campos posibles
  const toolCode = backendTool.barcode || 
                   backendTool.code || 
                   backendTool.tool_code ||
                   backendTool.uniqueId ||
                   backendTool._id ||
                   'Sin código';
  
  const mappedTool = {
    uniqueId: backendTool._id,
    specificName: toolName,
    status: backendTool.status || 'Disponible',
    availableQuantity: backendTool.available_quantity || backendTool.total_quantity || 1,
    totalQuantity: backendTool.total_quantity || backendTool.quantity || 1,
    category: backendTool.category || 'Sin categoría',
    barcode: toolCode,
    generalName: backendTool.generalName || backendTool.general_name || toolName,
    description: backendTool.description || '',
    brand: backendTool.brand || '',
    model: backendTool.model || ''
  };
  
  console.log('Herramienta mapeada:', mappedTool);
  return mappedTool;
};

  const handleStudentSearch = async () => {
    if (!scannedStudentId.trim() && searchType !== 'fingerprint_physical') {
      toast({
        title: "Entrada Vacía",
        description: "Por favor ingrese un ID o active el sensor físico",
        variant: "destructive"
      });
      return;
    }

    // Si es modo físico, activar el sensor automático
    if (searchType === 'fingerprint_physical') {
      if (!espConnected) {
        toast({
          title: "ESP32 No Conectado",
          description: "Verifique la conexión con el sensor de huellas",
          variant: "destructive"
        });
        return;
      }
      
      await startFingerprintMode();
      return;
    }

    setIsScanningStudent(true);
    const searchValue = scannedStudentId.trim();
    
    toast({ 
      title: searchType === 'fingerprint' ? "Verificando Huella..." : "Buscando Estudiante...", 
      description: searchType === 'fingerprint' ? "Consultando sistema de huellas" : `Buscando matrícula: ${searchValue}` 
    });

    try {
      let foundStudent = null;
      
      if (searchType === 'fingerprint') {
        // Buscar por huella usando API
        foundStudent = await searchStudentByFingerprint(searchValue);
        
        if (!foundStudent) {
          // Si no se encuentra por huella, buscar en la base local como fallback
          console.log('No encontrado por huella, buscando en base local...');
          foundStudent = allStudents.find(s => {
            const matchByStudentId = s.student_id?.toString().toLowerCase() === searchValue.toLowerCase();
            const matchById = s._id === searchValue;
            return matchByStudentId || matchById;
          });
          
          if (foundStudent) {
            foundStudent = mapBackendStudentToFrontend(foundStudent);
          }
        }
      } else {
        // Búsqueda específica por matrícula (student_id)
        foundStudent = allStudents.find(s => {
          const match = s.student_id?.toString().toLowerCase() === searchValue.toLowerCase();
          console.log(`Comparando matrícula ${s.student_id} con ${searchValue}:`, match);
          return match;
        });
        
        if (foundStudent) {
          foundStudent = mapBackendStudentToFrontend(foundStudent);
        }
      }

      setTimeout(() => {
        if (foundStudent) {
          if (foundStudent.status === 'Bloqueado') {
            toast({ 
              title: "Estudiante Bloqueado", 
              description: `${foundStudent.name} está bloqueado y no puede solicitar préstamos.${foundStudent.blockReason ? ' Motivo: ' + foundStudent.blockReason : ''}`, 
              variant: "destructive" 
            });
            setStudentInfo(null);
          } else {
            setStudentInfo(foundStudent);
            toast({ 
              title: searchType === 'fingerprint' ? "¡Huella Verificada!" : "¡Estudiante Encontrado!", 
              description: `Estudiante: ${foundStudent.name} (${foundStudent.studentId})` 
            });
          }
        } else {
          console.log('No se encontró estudiante. Primeros 3 estudiantes para referencia:');
          allStudents.slice(0, 3).forEach(s => {
            console.log(`- ${s.full_name} (ID: ${s.student_id})`);
          });
          
          toast({ 
            title: "Estudiante No Encontrado", 
            description: `No se encontró estudiante con ${searchType === 'fingerprint' ? 'huella/ID' : 'matrícula'}: '${searchValue}'`, 
            variant: "destructive" 
          });
          setStudentInfo(null);
        }
        setIsScanningStudent(false);
        setScannedStudentId('');
      }, searchType === 'fingerprint' ? 2000 : 1500);

    } catch (error) {
      console.error('Error searching student:', error);
      toast({
        title: "Error",
        description: "Error al buscar el estudiante",
        variant: "destructive"
      });
      setIsScanningStudent(false);
    }
  };

  const handleSimulateToolScan = async () => {
    if (!scannedToolId.trim()) {
      toast({ 
        title: "Entrada Vacía", 
        description: "Por favor ingrese un ID de herramienta para escanear.", 
        variant: "destructive"
      });
      return;
    }

    setIsScanningTool(true);
    const searchValue = scannedToolId.trim().toLowerCase();

    toast({ 
      title: "Escaneando Herramienta...", 
      description: `Buscando: ${searchValue}` 
    });

    try {
      console.log('Buscando herramienta con valor:', searchValue);
      console.log('Total de herramientas disponibles:', allTools.length);

      const foundTool = allTools.find(t => {
        const matchById = t.uniqueId?.toLowerCase() === searchValue;
        const matchByName = t.specificName?.toLowerCase() === searchValue;
        const matchByBarcode = t.barcode?.toLowerCase() === searchValue;
        const matchByGeneralName = t.generalName?.toLowerCase() === searchValue;
        
        // Solo coincidencias exactas para evitar falsos positivos
        const matchByNamePartial = t.specificName?.toLowerCase().includes(searchValue) && searchValue.length >= 3;
        const matchByUniqueIdPartial = t.uniqueId?.toLowerCase().includes(searchValue) && searchValue.length >= 3;

        console.log(`Comparando herramienta ${t.specificName}:`, {
          uniqueId: t.uniqueId,
          searchValue,
          matchById,
          matchByName,
          matchByBarcode,
          matchByGeneralName,
          matchByNamePartial,
          matchByUniqueIdPartial
        });

        return matchById || matchByName || matchByBarcode || matchByGeneralName || 
               (searchValue.length >= 3 && (matchByNamePartial || matchByUniqueIdPartial));
      });

      setTimeout(() => {
        if (foundTool) {
          const existingItem = loanItems.find(item => item.uniqueId === foundTool.uniqueId);

          if (existingItem) {
            // Si ya existe, incrementar cantidad si hay stock disponible
            const newQuantity = existingItem.quantity + 1;
            if (newQuantity <= foundTool.availableQuantity) {
              setLoanItems(prev => prev.map(item => 
                item.uniqueId === foundTool.uniqueId 
                  ? { ...item, quantity: newQuantity }
                  : item
              ));
              toast({ 
                title: "¡Cantidad Incrementada!", 
                description: `${foundTool.specificName} - Cantidad: ${newQuantity}`,
                variant: "default"
              });
            } else {
              toast({ 
                title: "Stock Insuficiente", 
                description: `Solo hay ${foundTool.availableQuantity} unidades disponibles de ${foundTool.specificName}`, 
                variant: "destructive" 
              });
            }
          } else if (foundTool.availableQuantity > 0) {
            // Si no existe, agregar nueva herramienta
            const newItem = { ...foundTool, quantity: 1 };
            setLoanItems(prev => [...prev, newItem]);

            toast({ 
              title: "¡Herramienta Agregada!", 
              description: `${foundTool.specificName} añadida al préstamo.`,
              variant: "default"
            });
          } else {
            toast({ 
              title: "Herramienta no Disponible", 
              description: `${foundTool.specificName} no tiene stock disponible.`, 
              variant: "destructive" 
            });
          }
        } else {
          console.log('No se encontró herramienta. Primeras 3 herramientas para referencia:');
          allTools.slice(0, 3).forEach(tool => {
            console.log(`- ${tool.specificName || tool.uniqueId} (ID: ${tool.uniqueId})`);
          });

          toast({ 
            title: "Herramienta No Encontrada", 
            description: `No se encontró herramienta con: '${searchValue}'. Verifique el ID o nombre.`,
            variant: "destructive"
          });
        }

        setIsScanningTool(false);
        setScannedToolId('');
      }, 1000);

    } catch (error) {
      console.error('Error searching tool:', error);
      toast({
        title: "Error",
        description: "Error al buscar la herramienta",
        variant: "destructive"
      });
      setIsScanningTool(false);
      setScannedToolId('');
    }
  };

  const removeLoanItem = (toolId) => {
    setLoanItems(prev => prev.filter(item => item.uniqueId !== toolId));
    toast({ title: "Herramienta Eliminada", description: "Se quitó la herramienta de la lista." });
  };

  const updateItemQuantity = (toolId, newQuantity) => {
    if (newQuantity <= 0) {
      removeLoanItem(toolId);
      return;
    }

    const tool = allTools.find(t => t.uniqueId === toolId);
    if (tool && newQuantity > tool.availableQuantity) {
      toast({
        title: "Stock Insuficiente",
        description: `Solo hay ${tool.availableQuantity} unidades disponibles`,
        variant: "destructive"
      });
      return;
    }

    setLoanItems(prev => prev.map(item => 
      item.uniqueId === toolId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const incrementQuantity = (toolId) => {
    const currentItem = loanItems.find(item => item.uniqueId === toolId);
    if (currentItem) {
      updateItemQuantity(toolId, currentItem.quantity + 1);
    }
  };

  const decrementQuantity = (toolId) => {
    const currentItem = loanItems.find(item => item.uniqueId === toolId);
    if (currentItem) {
      updateItemQuantity(toolId, currentItem.quantity - 1);
    }
  };

  const handleConfirmLoan = async () => {
    if (!studentInfo) {
      toast({ title: "Error", description: "Debe seleccionar un estudiante.", variant: "destructive" });
      return;
    }
    if (loanItems.length === 0) {
      toast({ title: "Error", description: "Debe agregar al menos una herramienta.", variant: "destructive" });
      return;
    }
    if (!dueDate || !dueTime) {
      toast({ title: "Error", description: "Debe especificar la fecha y hora límite de devolución.", variant: "destructive" });
      return;
    }
    if (!selectedSupervisor) {
      toast({ title: "Error", description: "Debe seleccionar un supervisor a cargo.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos para el backend
      const loanData = {
        student_code: studentInfo.studentId,
        supervisor_id: selectedSupervisor,
        teacher_id: selectedTeacher && selectedTeacher !== 'none' ? selectedTeacher : null,
        tools: loanItems.map(item => ({
          tool_id: item.uniqueId,
          quantity: item.quantity || 1
        })),
        configured_time_hours: configuredTimeHours,
        estimated_return_date: new Date(`${dueDate}T${dueTime}:00`).toISOString(),
        loan_date: new Date().toISOString(),
        admin_id: user?._id || user?.id
      };

      console.log('Enviando datos del préstamo:', loanData);

      const response = await apiRequest('/loans/create-with-validation', {
        method: 'POST',
        body: JSON.stringify(loanData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Préstamo creado exitosamente:', result);
        
        const supervisorName = supervisors.find(s => s._id === selectedSupervisor)?.full_name || 'N/A';
        const teacherName = selectedTeacher && selectedTeacher !== 'none' ? 
          (teachers.find(t => t._id === selectedTeacher)?.full_name || 'N/A') : null;
        
        const totalItems = loanItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        toast({
          title: "¡Préstamo Confirmado!",
          description: `${totalItems} herramienta(s) prestada(s) a ${studentInfo.name}. Supervisor: ${supervisorName}${teacherName ? `, Maestro: ${teacherName}` : ''}.`,
          duration: 7000
        });

        // Reset form
        resetForm();
        
        // Recargar datos para actualizar stock
        await loadInitialData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el préstamo');
      }

    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo confirmar el préstamo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setScannedStudentId('');
    setStudentInfo(null);
    setScannedToolId('');
    setLoanItems([]);
    setSelectedSupervisor(user?._id || user?.id || ''); // Mantener supervisor por defecto
    setSelectedTeacher('none');
    initializeTimes();
  };

  // Componente de tarjeta móvil para herramientas en el préstamo
  const MobileToolCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg p-3 space-y-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm leading-tight mb-1 break-words">
            {item.specificName}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {item.uniqueId}
            </span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
              {item.category}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Stock disponible: <span className="font-medium">{item.availableQuantity}</span>
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => removeLoanItem(item.uniqueId)} 
          className="text-destructive hover:text-destructive/80 h-8 w-8 p-0 flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-center gap-3 pt-2 border-t border-border">
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => decrementQuantity(item.uniqueId)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium min-w-[2rem] text-center">
          Cantidad: {item.quantity}
        </span>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => incrementQuantity(item.uniqueId)}
          disabled={item.quantity >= item.availableQuantity}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );

  // Mostrar loading si no hay usuario autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando autenticación...</span>
      </div>
    );
  }

  // Mostrar loading inicial
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos iniciales...</span>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8 max-w-5xl mx-auto px-4 sm:px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
     <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-700">
            Nuevo Préstamo
          </h1>
        </div>
      </div>

      {/* Student Search Section */}
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-primary flex items-center">
            <UserCircle className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Información del Estudiante
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Busque al estudiante por huella dactilar o matrícula.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <Label className="text-custom-gold text-sm font-medium">Tipo de Búsqueda</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="bg-input border-custom-gold/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fingerprint">
                    <div className="flex items-center">
                      <Fingerprint className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Por ID de Huella</span>
                      <span className="sm:hidden">ID Huella</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fingerprint_physical">
                    <div className="flex items-center">
                      <Fingerprint className="mr-2 h-4 w-4" />
                      <span>Sensor Físico</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="studentId">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Por Matrícula</span>
                      <span className="sm:hidden">Matrícula</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="student-search-id" className="text-custom-gold text-sm font-medium">
                {searchType === 'fingerprint' ? 'ID de Huella Registrada' : 
                 searchType === 'fingerprint_physical' ? 'Sensor Físico AS608' : 
                 'Matrícula del Estudiante'}
              </Label>
              
              {searchType === 'fingerprint_physical' ? (
                <div className="space-y-4">
                  {/* Estado de conexión del ESP32 */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${espConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      <span className="text-sm font-medium">
                        {espConnected ? 'ESP32 Conectado' : 'ESP32 Desconectado'}
                      </span>
                      {espConnected && (
                        <span className="text-xs text-muted-foreground">
                          ({ESP32_IP})
                        </span>
                      )}
                    </div>
                    
                    {espConnected && (
                      <Button 
                        onClick={fingerprintMode ? stopFingerprintMode : startFingerprintMode}
                        variant={fingerprintMode ? "destructive" : "default"}
                        size="sm"
                        disabled={isScanningStudent}
                      >
                        <Fingerprint className={`mr-2 h-4 w-4 ${fingerprintMode ? 'animate-ping' : ''}`} />
                        {fingerprintMode ? 'Desactivar' : 'Activar Sensor'}
                      </Button>
                    )}
                  </div>
                  
                  {/* Estado activo esperando huella */}
                  {fingerprintMode && (
                    <div className="text-center p-6 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
                      <Fingerprint className="mx-auto h-12 w-12 text-primary animate-pulse mb-3" />
                      <p className="text-lg font-semibold text-primary">Coloque su dedo en el sensor AS608</p>
                      <p className="text-sm text-muted-foreground">
                        {isScanningStudent ? 'Procesando huella detectada...' : 'Esperando detección automática...'}
                      </p>
                    </div>
                  )}
                  
                  {/* Botón de reconexión si está desconectado */}
                  {!espConnected && (
                    <div className="text-center p-6">
                      <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No se puede conectar con el sensor de huellas
                      </p>
                      <Button onClick={checkESP32Connection} variant="outline" size="sm">
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Intentar Reconectar
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // Input normal para ID de huella o matrícula
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    id="student-search-id" 
                    placeholder={searchType === 'fingerprint' ? "Ingrese ID de huella (1, 2, 3...)" : "Ingrese matrícula del estudiante"} 
                    value={scannedStudentId}
                    onChange={(e) => setScannedStudentId(e.target.value)}
                    className="bg-input border-custom-gold/30 focus:border-custom-gold flex-1" 
                    onKeyPress={(e) => e.key === 'Enter' && handleStudentSearch()}
                  />
                  <Button 
                    onClick={handleStudentSearch} 
                    disabled={isScanningStudent || isLoading} 
                    className="w-full sm:w-auto sm:min-w-[120px]"
                  >
                    {searchType === 'fingerprint' ? (
                      <Fingerprint className={`mr-2 h-4 w-4 ${isScanningStudent ? 'animate-ping' : ''}`} />
                    ) : (
                      <CreditCard className={`mr-2 h-4 w-4 ${isScanningStudent ? 'animate-ping' : ''}`} />
                    )}
                    <span className="hidden sm:inline">
                      {isScanningStudent ? 'Buscando...' : (searchType === 'fingerprint' ? 'Verificar' : 'Buscar')}
                    </span>
                    <span className="sm:hidden">
                      {isScanningStudent ? 'Buscando...' : 'Buscar'}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {studentInfo && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              transition={{ duration: 0.3}}
              className="p-4 border border-primary/30 rounded-md bg-primary/5"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img  
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary object-cover mx-auto sm:mx-0" 
                  alt={`Avatar de ${studentInfo.name}`} 
                  src={studentInfo.avatar} 
                />
                <div className="flex-grow text-center sm:text-left">
                  <p className="font-semibold text-base sm:text-lg text-foreground">{studentInfo.name}</p>
                  <p className="text-sm text-muted-foreground">Matrícula: {studentInfo.studentId} | {studentInfo.career}</p>
                  <p className="text-sm text-muted-foreground">Cuatrimestre: {studentInfo.cuatrimestre} | Grupo: {studentInfo.group}</p>
                  <p className={`text-sm font-bold ${studentInfo.status === 'Activo' ? 'text-green-500' : 'text-red-500'}`}>
                    Estado: {studentInfo.status}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Tools Scan Section */}
      {studentInfo && studentInfo.status === 'Activo' && (
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-primary flex items-center">
              <ScanLine className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Escanear Herramientas
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Agregue herramientas al préstamo escaneando su código de barras o ingresando su ID.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow">
                <Label htmlFor="tool-scan-id" className="text-custom-gold text-sm font-medium">
                  ID o Código de Herramienta
                </Label>
                <Input 
                  id="tool-scan-id" 
                  placeholder="Ingrese ID o código de barras de herramienta" 
                  value={scannedToolId}
                  onChange={(e) => setScannedToolId(e.target.value)}
                  className="bg-input border-custom-gold/30 focus:border-custom-gold" 
                  onKeyPress={(e) => e.key === 'Enter' && handleSimulateToolScan()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSimulateToolScan} 
                  disabled={isScanningTool || isLoading} 
                  className="w-full sm:w-auto sm:min-w-[140px]"
                >
                  <PlusCircle className={`mr-2 h-4 w-4 ${isScanningTool ? 'animate-ping' : ''}`} />
                  <span className="hidden sm:inline">
                    {isScanningTool ? 'Agregando...' : 'Agregar Herramienta'}
                  </span>
                  <span className="sm:hidden">
                    {isScanningTool ? 'Agregando...' : 'Agregar'}
                  </span>
                </Button>
              </div>
            </div>
            
            {loanItems.length > 0 && (
              <div className="mt-4">
                {/* Vista de tabla para desktop */}
                <div className="hidden md:block rounded-lg border border-border shadow-sm bg-background overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-custom-gold">ID Herramienta</TableHead>
                        <TableHead className="text-custom-gold">Nombre</TableHead>
                        <TableHead className="text-custom-gold">Stock Disponible</TableHead>
                        <TableHead className="text-custom-gold text-center">Cantidad</TableHead>
                        <TableHead className="text-custom-gold text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanItems.map(item => (
                        <TableRow key={item.uniqueId}>
                          <TableCell className="font-medium text-foreground">{item.uniqueId}</TableCell>
                          <TableCell className="text-muted-foreground">
                            <div>
                              <div className="font-medium">{item.specificName}</div>
                              <div className="text-xs text-muted-foreground">{item.category}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.availableQuantity}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => decrementQuantity(item.uniqueId)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => incrementQuantity(item.uniqueId)}
                                disabled={item.quantity >= item.availableQuantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeLoanItem(item.uniqueId)} 
                              className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Vista de tarjetas para móvil */}
                <div className="block md:hidden space-y-3">
                  {loanItems.map(item => (
                    <MobileToolCard key={item.uniqueId} item={item} />
                  ))}
                </div>
              </div>
            )}
            
            {loanItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Ninguna herramienta agregada aún.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loan Details Section */}
      {studentInfo && studentInfo.status === 'Activo' && loanItems.length > 0 && (
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-primary flex items-center">
              <CalendarClock className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Detalles del Préstamo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-custom-gold text-sm font-medium">Hora de Préstamo</Label>
              <Input value={loanTime} readOnly className="bg-muted/50 border-custom-gold/30"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-in-charge" className="text-custom-gold text-sm font-medium">Admin a Cargo</Label>
              <div className="flex items-center p-2.5 rounded-md bg-muted/50 border border-custom-gold/30">
                <UserCog className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary flex-shrink-0" />
                <span className="text-foreground text-sm truncate">{user?.name || user?.email || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor-select" className="text-custom-gold text-sm font-medium">Supervisor a Cargo</Label>
              <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                <SelectTrigger className="bg-input border-custom-gold/30">
                  <SelectValue placeholder="Seleccione un supervisor">
                    {selectedSupervisor && (
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                        <div className="truncate">
                          <div className="truncate">{supervisors.find(s => s._id === selectedSupervisor)?.full_name || 'Supervisor'}</div>
                          {selectedSupervisor === (user?._id || user?.id) && (
                            <div className="text-xs text-green-600">• Usuario actual</div>
                          )}
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map(supervisor => (
                    <SelectItem key={supervisor._id} value={supervisor._id}>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{supervisor.full_name}</span>
                            {supervisor._id === (user?._id || user?.id) && (
                              <span className="text-xs bg-green-100 text-green-800 px-1 rounded flex-shrink-0">Tú</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{supervisor.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-select" className="text-custom-gold text-sm font-medium">Maestro a Cargo (Opcional)</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="bg-input border-custom-gold/30">
                  <SelectValue placeholder="Seleccione un maestro (opcional)">
                    {selectedTeacher && (
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {teachers.find(t => t._id === selectedTeacher)?.full_name || 'Maestro'}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center text-muted-foreground">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Sin maestro asignado
                    </div>
                  </SelectItem>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate">{teacher.full_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{teacher.subject}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="configured-time" className="text-custom-gold text-sm font-medium">Tiempo Configurado (Horas)</Label>
              <Input 
                id="configured-time" 
                type="number" 
                min="1" 
                max="24" 
                value={configuredTimeHours} 
                onChange={e => setConfiguredTimeHours(parseInt(e.target.value) || 6)} 
                className="bg-input border-custom-gold/30 focus:border-custom-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date" className="text-custom-gold text-sm font-medium">Fecha Límite Devolución</Label>
              <Input 
                id="due-date" 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                className="bg-input border-custom-gold/30 focus:border-custom-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-time" className="text-custom-gold text-sm font-medium">Hora Límite Devolución</Label>
              <Input 
                id="due-time" 
                type="time" 
                value={dueTime} 
                onChange={e => setDueTime(e.target.value)} 
                className="bg-input border-custom-gold/30 focus:border-custom-gold"
              />
            </div>
          </CardContent>
          <div className="p-4 sm:p-6 pt-2 flex justify-center sm:justify-end">
            <Button 
              onClick={handleConfirmLoan} 
              size="lg" 
              className="w-full sm:w-auto sm:min-w-[200px]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar Préstamo'
              )}
            </Button>
          </div>
        </Card>
      )}

      {!studentInfo && (
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">
            Por favor, busque un estudiante para iniciar un préstamo.
          </p>
        </div>
      )}
      
      {studentInfo && studentInfo.status === 'Bloqueado' && (
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-500 mb-4" />
          <p className="text-red-500 font-semibold text-sm sm:text-base">
            El estudiante {studentInfo.name} está bloqueado.
          </p>
          <p className="text-muted-foreground text-sm sm:text-base">
            No puede solicitar préstamos hasta que se resuelva su situación.
          </p>
          {studentInfo.blockReason && (
            <p className="text-sm text-muted-foreground mt-2">
              Motivo: {studentInfo.blockReason}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default NewLoanPage;

