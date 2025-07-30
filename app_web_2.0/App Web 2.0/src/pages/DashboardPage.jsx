import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Users, Wrench, AlertTriangle, Clock, CheckSquare, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { apiRequest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [showAllPending, setShowAllPending] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    activeTools: 0,
    ongoingLoans: 0,
    maintenanceTools: 0,
    totalStudents: 0,
    mostRequested: [
        { name: "Taladro Percutor Bosch", requests: 15 },
        { name: "Sierra Circular Skil", requests: 10 },
        { name: "Kit Destornilladores", requests: 8 },
    ],
  });

  // Cargar registros pendientes desde la API
  const loadPendingRegistrations = async () => {
    try {
      const response = await apiRequest('/students/mobile/pending');
      if (response.ok) {
        const pendingStudents = await response.json();
        console.log('Registros pendientes cargados:', pendingStudents);
        
        // Formatear los datos para el dashboard
        const formattedPending = pendingStudents.map(student => ({
          id: student._id,
          name: student.full_name,
          email: student.email,
          studentId: student.student_id || 'Pendiente',
          registrationDate: student.createdAt ? new Date(student.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        
        setPendingRegistrations(formattedPending);
      } else {
        console.log('No se pudieron cargar los registros pendientes');
        // Si no hay endpoint o hay error, usar datos vacíos
        setPendingRegistrations([]);
      }
    } catch (error) {
      console.error('Error loading pending registrations:', error);
      setPendingRegistrations([]);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Cargar herramientas
      const toolsResponse = await apiRequest('/tools');
      if (toolsResponse.ok) {
        const tools = await toolsResponse.json();
        const activeTools = tools.filter(tool => tool.status === 'Disponible').length;
        const maintenanceTools = tools.filter(tool => tool.status === 'Mantenimiento').length;
        
        setDashboardStats(prevStats => ({
          ...prevStats,
          activeTools,
          maintenanceTools,
        }));
      }

      // Cargar estudiantes
      const studentsResponse = await apiRequest('/students');
      if (studentsResponse.ok) {
        const students = await studentsResponse.json();
        setDashboardStats(prevStats => ({
          ...prevStats,
          totalStudents: students.length,
        }));
      }

      // Cargar préstamos activos (si tienes el endpoint)
      try {
        const loansResponse = await apiRequest('/loans/active');
        if (loansResponse.ok) {
          const activeLoans = await loansResponse.json();
          setDashboardStats(prevStats => ({
            ...prevStats,
            ongoingLoans: Array.isArray(activeLoans) ? activeLoans.length : 0,
          }));
        }
      } catch (error) {
        console.log('Endpoint de préstamos activos no disponible, usando valor por defecto');
        setDashboardStats(prevStats => ({
          ...prevStats,
          ongoingLoans: 3, // Valor por defecto
        }));
      }

      // Cargar registros pendientes
      await loadPendingRegistrations();

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar algunas estadísticas del dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

const handleCompleteRegistration = (pendingStudent) => {
  console.log('Completando registro para:', pendingStudent); // Debug
  
  toast({
    title: "Redirigiendo para Completar Registro",
    description: `Preparando formulario para ${pendingStudent.name}.`,
  });
  
  navigate('/students', { 
    state: { 
      action: 'completeRegistration', 
      pendingStudentData: { 
        id: pendingStudent.id,
        name: pendingStudent.name,
        email: pendingStudent.email,
        studentId: pendingStudent.studentId || null, // Asegurar que sea null si no existe
        // Datos adicionales que puede necesitar el formulario
        registrationDate: pendingStudent.registrationDate,
        deviceInfo: pendingStudent.deviceInfo,
        appVersion: pendingStudent.appVersion
      } 
    } 
  });
};
  const displayedPendingRegistrations = showAllPending ? pendingRegistrations : pendingRegistrations.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
     <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-700">
           Dashboard
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Herramientas Disponibles', 
            value: dashboardStats.activeTools, 
            icon: <Wrench className="h-6 w-6 text-primary" />, 
            color: 'text-primary', 
            path: '/tools',
            description: 'Herramientas listas para préstamo'
          },
          { 
            title: 'Préstamos Activos', 
            value: dashboardStats.ongoingLoans, 
            icon: <Clock className="h-6 w-6 text-custom-orange" />, 
            color: 'text-custom-orange', 
            path: '/loans',
            description: 'Préstamos en curso'
          },
          { 
            title: 'En Mantenimiento', 
            value: dashboardStats.maintenanceTools, 
            icon: <AlertTriangle className="h-6 w-6 text-destructive" />, 
            color: 'text-destructive', 
            path: '/tools?filter=maintenance',
            description: 'Herramientas en reparación'
          },
          { 
            title: 'Estudiantes Registrados', 
            value: dashboardStats.totalStudents, 
            icon: <Users className="h-6 w-6 text-secondary" />, 
            color: 'text-secondary', 
            path: '/students',
            description: 'Total de estudiantes activos'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link to={stat.path} className="block">
              <Card className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${stat.color}`}>{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        >
          <Card className="bg-card shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center">
                <BarChart className="mr-2 h-5 w-5" /> Herramientas Más Solicitadas
              </CardTitle>
              <CardDescription>Top herramientas por número de préstamos.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {dashboardStats.mostRequested.map(tool => (
                  <li key={tool.name} className="flex justify-between items-center text-sm">
                    <span className="text-foreground truncate pr-2">{tool.name}</span>
                    <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {tool.requests} sol.
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/tools')}
                  className="w-full"
                >
                  Ver Todas las Herramientas
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
        >
          <Card className="bg-card shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center">
                <UserPlus className="mr-2 h-5 w-5" /> Registros Pendientes de App Móvil
                {pendingRegistrations.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingRegistrations.length}
                  </span>
                )}
              </CardTitle>
              <CardDescription>Estudiantes registrados desde la app móvil que requieren completar datos.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRegistrations.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        
                        <TableHead className="text-custom-gold hidden sm:table-cell">Email</TableHead>
                        <TableHead className="text-custom-gold hidden md:table-cell">Fecha Registro</TableHead>
                        <TableHead className="text-custom-gold text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedPendingRegistrations.map((student) => (
                        <TableRow key={student.id}>
                          
                          <TableCell className="text-muted-foreground hidden sm:table-cell text-xs">
                            {student.email}
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden md:table-cell">
                            {new Date(student.registrationDate).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCompleteRegistration(student)} 
                              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                              <CheckSquare className="mr-1 h-4 w-4" /> Completar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {pendingRegistrations.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="link" 
                        onClick={() => setShowAllPending(!showAllPending)} 
                        className="text-primary"
                      >
                        {showAllPending ? 'Mostrar Menos' : `Mostrar Todos (${pendingRegistrations.length})`}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay registros pendientes por el momento.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Los estudiantes que se registren desde la app móvil aparecerán aquí.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sección de accesos rápidos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;

