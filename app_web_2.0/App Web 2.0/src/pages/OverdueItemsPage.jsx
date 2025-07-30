import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  User, 
  Wrench, 
  Clock, 
  Mail, 
  Phone, 
  UserX, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  AlertCircle,
  Filter,
  X,
  Send,
  MailCheck,
  MailX,
  Info,
  Calendar,
  Tag,
  Eye,
  CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const OverdueItemsPage = () => {
  // Estados para datos
  const [overdueItems, setOverdueItems] = useState([]);
  const [allOverdueItems, setAllOverdueItems] = useState([]);
  const [stats, setStats] = useState({
    totalOverdueItems: 0,
    criticalItems: 0,
    urgentItems: 0,
    recentOverdue: 0,
    blockedStudents: 0,
    uniqueStudents: 0
  });
  
  // Estados para UI
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('daysOverdue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isNotifying, setIsNotifying] = useState({});
  const [isBlocking, setIsBlocking] = useState({});
  const [emailServiceStatus, setEmailServiceStatus] = useState('unknown');
  const [lastEmailSent, setLastEmailSent] = useState({});
  
  const { toast } = useToast();
  const { apiRequest, user } = useAuth();
  const navigate = useNavigate();

  const checkEmailService = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/debug/email-verify');
      
      if (response.ok) {
        const data = await response.json();
        const isActive = data.connection === 'OK';
        setEmailServiceStatus(isActive ? 'active' : 'inactive');
        console.log('Email service status:', data);
      } else {
        setEmailServiceStatus('inactive');
      }
    } catch (error) {
      console.warn('Could not check email service status:', error);
      setEmailServiceStatus('inactive');
    }
  };

  // Cargar datos de préstamos vencidos
  const loadOverdueItems = async () => {
    try {
      setLoading(true);
      
      const response = await apiRequest(`/overdue/loans?sortBy=${sortBy}&order=${sortOrder}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Overdue data loaded:', data);
        
        setAllOverdueItems(data.overdueItems || []);
        setStats(data.stats || {});
        
        // Aplicar filtros
        applyFilters(data.overdueItems || []);
        
        if (data.overdueItems?.length === 0) {
          toast({
            title: "Sin Materiales Vencidos",
            description: "¡Excelente! No hay herramientas vencidas por el momento.",
            variant: "default"
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar préstamos vencidos');
      }
    } catch (error) {
      console.error('Error loading overdue items:', error);
      toast({
        title: "Error de Conexión",
        description: "No se pudieron cargar los préstamos vencidos. Verifique su conexión.",
        variant: "destructive"
      });
      setOverdueItems([]);
      setAllOverdueItems([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  // Aplicar todos los filtros
  const applyFilters = (items) => {
    let filteredItems = [...items];
    
    // Filtro por entidad (estudiante, herramienta, matrícula)
    if (entityFilter) {
      filteredItems = filteredItems.filter(item => 
        item.studentName?.toLowerCase().includes(entityFilter.toLowerCase()) ||
        item.studentId?.toLowerCase().includes(entityFilter.toLowerCase()) ||
        item.toolName?.toLowerCase().includes(entityFilter.toLowerCase()) ||
        item.toolId?.toLowerCase().includes(entityFilter.toLowerCase()) ||
        item.studentCareer?.toLowerCase().includes(entityFilter.toLowerCase())
      );
    }
    
    // Filtro por fecha
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filteredItems = filteredItems.filter(item => {
        const loanDate = new Date(item.loanDate);
        const dueDate = new Date(item.dueDate);
        return loanDate.toDateString() === filterDate.toDateString() || 
               dueDate.toDateString() === filterDate.toDateString();
      });
    }
    
    // Filtro por estado
    switch (activeFilter) {
      case 'critical':
        filteredItems = filteredItems.filter(item => item.daysOverdue > 7);
        break;
      case 'urgent':
        filteredItems = filteredItems.filter(item => item.daysOverdue > 3 && item.daysOverdue <= 7);
        break;
      case 'recent':
        filteredItems = filteredItems.filter(item => item.daysOverdue <= 3);
        break;
      case 'blocked':
        filteredItems = filteredItems.filter(item => item.studentBlocked);
        break;
      case 'all':
      default:
        break;
    }
    
    setOverdueItems(filteredItems);
  };

  // Cambiar filtro activo
  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
    
    const filterNames = {
      all: 'Todos los préstamos vencidos',
      critical: 'Préstamos críticos (7+ días)',
      urgent: 'Préstamos urgentes (3-7 días)',
      recent: 'Préstamos recientes (1-3 días)',
      blocked: 'Estudiantes bloqueados'
    };
    
    toast({
      title: "Filtro Aplicado",
      description: `Mostrando: ${filterNames[filterType]}`,
      duration: 2000
    });
  };

  // Limpiar filtros
  const clearFilters = () => {
    setEntityFilter('');
    setDateFilter('');
    setActiveFilter('all');
    applyFilters(allOverdueItems);
  };

  // Efectos
  useEffect(() => {
    if (user) {
      loadOverdueItems();
      checkEmailService();
    }
  }, [user, sortBy, sortOrder]);

  useEffect(() => {
    applyFilters(allOverdueItems);
  }, [entityFilter, dateFilter, activeFilter, allOverdueItems]);

  const navigateToStudentSimple = (item) => {
    console.log('Navegando con datos:', {
      studentId: item.studentId,
      studentCode: item.studentCode,
      studentName: item.studentName
    });
    
    const targetId = item.studentId || item.studentCode;
    
    if (!targetId) {
      toast({
        title: "Error",
        description: "No se pudo identificar al estudiante",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Navegando a: /students/${targetId}`);
    navigate(`/students/${targetId}`);
  };

  // Verificar si se puede enviar email
  const canSendEmail = (item) => {
    if (item.studentBlocked) return { canSend: false, reason: "Estudiante bloqueado" };
    if (!item.studentEmail || item.studentEmail === 'Email no disponible') {
      return { canSend: false, reason: "Email no disponible" };
    }
    if (emailServiceStatus === 'inactive') {
      return { canSend: false, reason: "Servicio de email inactivo" };
    }
    
    const lastSent = lastEmailSent[item.studentId];
    if (lastSent && (Date.now() - lastSent) < 5 * 60 * 1000) {
      return { canSend: false, reason: "Email enviado recientemente" };
    }
    
    return { canSend: true, reason: null };
  };

  // Notificar estudiante
  const handleNotifyStudent = async (studentId, studentName, toolName, loanId) => {
    if (isNotifying[studentId]) return;
    
    const emailCheck = canSendEmail(overdueItems.find(item => item.studentId === studentId));
    if (!emailCheck.canSend) {
      toast({
        title: "No se puede enviar email",
        description: emailCheck.reason,
        variant: "destructive"
      });
      return;
    }
    
    setIsNotifying(prev => ({ ...prev, [studentId]: true }));
    
    try {
      console.log('Sending email notification to:', studentId, 'for loan:', loanId);
      
      const response = await apiRequest('/overdue/notify', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          loanId,
          message: `Recordatorio automático: Favor de devolver ${toolName} a la brevedad posible.`
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Email notification sent successfully:', result);
        
        setLastEmailSent(prev => ({
          ...prev,
          [studentId]: Date.now()
        }));
        
        toast({
          title: "Email Enviado",
          description: `Se ha enviado un correo electrónico a ${studentName} recordándole la devolución de ${toolName}.`,
          duration: 6000,
        });

        if (result.daysOverdue && result.sentTo) {
          setTimeout(() => {
            toast({
              title: "Detalles del Envío",
              description: `Enviado a: ${result.sentTo} • ${result.daysOverdue} día${result.daysOverdue !== 1 ? 's' : ''} vencido${result.daysOverdue !== 1 ? 's' : ''}`,
              duration: 4000,
            });
          }, 1500);
        }

        setTimeout(() => {
          toast({
            title: "Información",
            description: "Podrás enviar otro email a este estudiante en 5 minutos.",
            duration: 3000,
          });
        }, 3000);
        
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        
        let errorMessage = "No se pudo enviar el correo electrónico. ";
        
        if (errorData.message?.includes('email not found')) {
          errorMessage += "El estudiante no tiene email registrado.";
        } else if (errorData.message?.includes('Email service')) {
          errorMessage += "Problema con el servicio de correo.";
          setEmailServiceStatus('inactive');
        } else if (errorData.message?.includes('authentication')) {
          errorMessage += "Error de autenticación del servicio de correo.";
          setEmailServiceStatus('inactive');
        } else {
          errorMessage += errorData.message || "Intente nuevamente.";
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      
      toast({
        title: "Error al Enviar Email",
        description: error.message,
        variant: "destructive",
        duration: 6000
      });
    } finally {
      setIsNotifying(prev => ({ ...prev, [studentId]: false }));
    }
  };

  // Bloquear estudiante
  const handleBlockStudent = async (studentId, studentName) => {
    if (isBlocking[studentId]) return;
    
    const confirmed = window.confirm(
      `¿Está seguro que desea bloquear al estudiante ${studentName} (${studentId}) por préstamos vencidos?\n\nEsta acción impedirá que el estudiante solicite nuevos préstamos.`
    );
    
    if (!confirmed) return;
    
    setIsBlocking(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const response = await apiRequest('/overdue/block-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          reason: 'Préstamos vencidos sin devolver - Acción tomada desde panel de administración'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Student blocked:', result);
        
        toast({
          title: "Estudiante Bloqueado",
          description: `${studentName} ha sido bloqueado por préstamos vencidos.`,
          variant: "destructive",
          duration: 5000,
        });
        
        const updateLocalData = (items) => items.map(item => 
          item.studentId === studentId 
            ? { ...item, studentBlocked: true, studentBlockReason: 'Préstamos vencidos sin devolver' }
            : item
        );
        
        setAllOverdueItems(updateLocalData);
        setOverdueItems(prev => updateLocalData(prev));
        
        setStats(prev => ({
          ...prev,
          blockedStudents: prev.blockedStudents + 1
        }));
        
        setTimeout(() => loadOverdueItems(), 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al bloquear estudiante');
      }
    } catch (error) {
      console.error('Error blocking student:', error);
      toast({
        title: "Error",
        description: "No se pudo bloquear al estudiante. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsBlocking(prev => ({ ...prev, [studentId]: false }));
    }
  };

  // Obtener badge de estado según días vencidos
  const getStatusBadge = (daysOverdue, isBlocked) => {
    if (isBlocked) {
      return <Badge variant="destructive" className="bg-gray-500 text-xs">Bloqueado</Badge>;
    }
    
    if (daysOverdue > 7) {
      return <Badge variant="destructive" className="text-xs">Crítico ({daysOverdue}d)</Badge>;
    } else if (daysOverdue > 3) {
      return <Badge variant="destructive" className="bg-orange-500 text-xs">Urgente ({daysOverdue}d)</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Vencido ({daysOverdue}d)</Badge>;
    }
  };

  // Obtener icono de estado de email
  const getEmailIcon = (item) => {
    const emailCheck = canSendEmail(item);
    const isNotifyingThis = isNotifying[item.studentId];
    
    if (isNotifyingThis) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (!emailCheck.canSend) {
      return <MailX className="h-4 w-4" />;
    }
    
    const lastSent = lastEmailSent[item.studentId];
    if (lastSent && (Date.now() - lastSent) < 5 * 60 * 1000) {
      return <MailCheck className="h-4 w-4" />;
    }
    
    return <Send className="h-4 w-4" />;
  };

  // Obtener título para el botón de email
  const getEmailButtonTitle = (item) => {
    const emailCheck = canSendEmail(item);
    const lastSent = lastEmailSent[item.studentId];
    
    if (!emailCheck.canSend) {
      return emailCheck.reason;
    }
    
    if (lastSent && (Date.now() - lastSent) < 5 * 60 * 1000) {
      const minutesLeft = Math.ceil((5 * 60 * 1000 - (Date.now() - lastSent)) / 60000);
      return `Email enviado recientemente. Espera ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}`;
    }
    
    return "Enviar recordatorio por email";
  };

  // Componente para tarjetas móviles
  const OverdueItemCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-red-200 p-4 shadow-sm ${
        item.studentBlocked ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <button 
            onClick={() => navigateToStudentSimple(item)}
            className="text-left w-full hover:bg-gray-50 p-2 rounded transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-teal-600" />
              <h3 className="font-semibold text-gray-900 text-sm">{item.studentName}</h3>
            </div>
            <p className="text-xs text-gray-500">#{item.studentId}</p>
            <p className="text-xs text-gray-500">{item.studentCareer}</p>
          </button>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(item.daysOverdue, item.studentBlocked)}
        </div>
      </div>

      <div className="space-y-2 text-xs mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Wrench className="h-3 w-3 text-teal-600" />
          <div className="flex-1">
            <span className="font-medium text-gray-900 block">{item.toolName}</span>
            <span className="text-gray-500">{item.toolId} • Cant: {item.quantity}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-3 w-3 text-orange-600" />
          <div className="flex-1">
            <span className="font-medium text-gray-900 block">Vence: {item.dueDateFormatted}</span>
            <span className="text-gray-500">Prestado: {new Date(item.loanDate).toLocaleDateString('es-ES')}</span>
          </div>
        </div>

        {item.studentBlocked && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
            <UserX className="h-3 w-3" />
            <span className="text-xs">Bloqueado: {item.studentBlockReason}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateToStudentSimple(item)}
          className="text-xs h-8 flex items-center gap-1"
        >
          <Eye className="h-3 w-3" />
          Ver Perfil
        </Button>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleNotifyStudent(
              item.studentId, 
              item.studentName, 
              item.toolName, 
              item.loanId
            )}
            disabled={isNotifying[item.studentId] || !canSendEmail(item).canSend}
            className={`h-8 w-8 p-0 ${canSendEmail(item).canSend ? 
              'text-green-600 hover:text-green-700 hover:bg-green-50' : 
              'text-gray-400'
            }`}
            title={getEmailButtonTitle(item)}
          >
            {getEmailIcon(item)}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleBlockStudent(item.studentId, item.studentName)}
            disabled={isBlocking[item.studentId] || item.studentBlocked}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50" 
            title={item.studentBlocked ? "Ya está bloqueado" : "Bloquear Estudiante"}
          >
            {isBlocking[item.studentId] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserX className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-red-600">Materiales Vencidos</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <div className={`w-2 h-2 rounded-full ${
              emailServiceStatus === 'active' ? 'bg-green-500' : 
              emailServiceStatus === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                loadOverdueItems();
                checkEmailService();
              }} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
                placeholder="Buscar estudiante, herramienta..."
                className="pl-10"
                onChange={(e) => setEntityFilter(e.target.value)}
                value={entityFilter}
              />
            </div>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                className="pl-10"
                onChange={(e) => setDateFilter(e.target.value)}
                value={dateFilter}
              />
            </div>
            {(entityFilter || dateFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header desktop */}
          <div className="hidden sm:flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Materiales Vencidos</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  emailServiceStatus === 'active' ? 'bg-green-500' : 
                  emailServiceStatus === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className="text-gray-600">
                  Email: {
                    emailServiceStatus === 'active' ? 'Activo' : 
                    emailServiceStatus === 'inactive' ? 'Inactivo' : 'Verificando...'
                  }
                </span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  loadOverdueItems();
                  checkEmailService();
                }} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            </div>
          </div>
          
          {/* Filtro por entidad - Desktop */}
          <div className="relative mb-4 hidden sm:block">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Wrench className="absolute left-9 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filtrar por Estudiante o Herramienta (ID/Nombre)..."
              className="pl-16 w-full bg-input border-custom-gold/30 focus:border-custom-gold"
              onChange={(e) => setEntityFilter(e.target.value)}
              value={entityFilter}
            />
          </div>

          {/* Filtro por fecha - Desktop */}
          <div className="relative mb-4 hidden sm:block">
            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="date"
              placeholder="Filtrar por fecha de préstamo o vencimiento..."
              className="pl-10 w-full bg-input border-custom-gold/30 focus:border-custom-gold"
              onChange={(e) => setDateFilter(e.target.value)}
              value={dateFilter}
            />
          </div>

          {/* Limpiar filtros */}
          {(entityFilter || dateFilter) && (
            <div className="hidden sm:block mb-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Información de resultados */}
          {(entityFilter || dateFilter) && (
            <div className="text-xs sm:text-sm text-gray-600 mb-4">
              {overdueItems.length > 0 ? (
                `Se encontraron ${overdueItems.length} resultados de ${allOverdueItems.length} préstamos vencidos`
              ) : (
                `No se encontraron resultados para los filtros aplicados`
              )}
            </div>
          )}

          {/* Alerta sobre el servicio de email */}
          {emailServiceStatus === 'inactive' && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">
                    El servicio de email no está disponible. Las notificaciones por correo electrónico no funcionarán.
                    Contacte al administrador del sistema.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtros por estado */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('all')}
            >
              Todos ({allOverdueItems.length})
            </Button>
            <Button
              variant={activeFilter === 'critical' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('critical')}
            >
              Críticos ({allOverdueItems.filter(item => item.daysOverdue > 7).length})
            </Button>
            <Button
              variant={activeFilter === 'urgent' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('urgent')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Urgentes ({allOverdueItems.filter(item => item.daysOverdue > 3 && item.daysOverdue <= 7).length})
            </Button>
            <Button
              variant={activeFilter === 'recent' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('recent')}
            >
              Recientes ({allOverdueItems.filter(item => item.daysOverdue <= 3).length})
            </Button>
            <Button
              variant={activeFilter === 'blocked' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('blocked')}
            >
              Bloqueados ({allOverdueItems.filter(item => item.studentBlocked).length})
            </Button>
          </div>

          {/* Controles adicionales */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Orden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descendente</SelectItem>
                    <SelectItem value="asc">Ascendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contenido principal */}
          {loading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  <span className="ml-2 text-gray-600">Cargando préstamos vencidos...</span>
                </div>
              </CardContent>
            </Card>
          ) : overdueItems.length > 0 ? (
            <>
              {/* Vista móvil - Tarjetas */}
              <div className="block lg:hidden space-y-4 mb-6">
                {overdueItems.map((item) => (
                  <OverdueItemCard key={`${item.loanId}-${item.toolId}`} item={item} />
                ))}
              </div>

              {/* Vista desktop - Tabla */}
              <motion.div 
                className="hidden lg:block rounded-lg border border-red-300 shadow-sm bg-white overflow-hidden mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-red-50 border-b-red-300">
                      <TableHead className="text-red-600">Estudiante</TableHead>
                      <TableHead className="text-red-600">Herramienta</TableHead>
                      <TableHead className="text-red-600 hidden md:table-cell">Fecha Límite</TableHead>
                      <TableHead className="text-red-600 text-center">Estado</TableHead>
                      <TableHead className="text-red-600 hidden lg:table-cell">Admin Préstamo</TableHead>
                      <TableHead className="text-red-600 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueItems.map((item) => (
                      <TableRow 
                        key={`${item.loanId}-${item.toolId}`} 
                        className={`hover:bg-red-50 transition-colors ${item.studentBlocked ? 'opacity-60' : ''}`}
                      >
                        <TableCell className="font-medium text-gray-900">
                          <button 
                            onClick={() => {
                              console.log('Datos completos del estudiante:', item);
                              navigateToStudentSimple(item);
                            }}
                            className="hover:underline flex items-center text-left w-full"
                          >
                            <User className="inline h-4 w-4 mr-2 text-teal-600"/> 
                            <div>
                              <div className="font-medium">{item.studentName}</div>
                              <div className="text-sm text-gray-600">
                                {item.studentId} • {item.studentCareer}
                              </div>
                              {item.studentBlocked && (
                                <div className="text-xs text-red-500 flex items-center mt-1">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Bloqueado: {item.studentBlockReason}
                                </div>
                              )}
                            </div>
                          </button>
                        </TableCell>
                        
                        <TableCell className="text-gray-900">
                          <div className="flex items-center">
                            <Wrench className="inline h-4 w-4 mr-2 text-teal-600"/> 
                            <div>
                              <div className="font-medium">{item.toolName}</div>
                              <div className="text-sm text-gray-600">
                                {item.toolId} • Cant: {item.quantity}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.toolCategory}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-gray-600 hidden md:table-cell">
                          <div className="flex items-center">
                            <Clock className="inline h-4 w-4 mr-2 text-gray-500"/> 
                            <div>
                              <div className="font-medium">{item.dueDateFormatted}</div>
                              <div className="text-xs text-gray-500">
                                Prestado: {new Date(item.loanDate).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          {getStatusBadge(item.daysOverdue, item.studentBlocked)}
                        </TableCell>
                        
                        <TableCell className="text-gray-600 hidden lg:table-cell">
                          <div>
                            <div className="font-medium">{item.adminLoan}</div>
                            {item.adminEmail && (
                              <div className="text-xs text-gray-500">{item.adminEmail}</div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleNotifyStudent(
                                item.studentId, 
                                item.studentName, 
                                item.toolName, 
                                item.loanId
                              )}
                              disabled={isNotifying[item.studentId] || !canSendEmail(item).canSend}
                              className={`
                                disabled:opacity-50 transition-colors
                                ${canSendEmail(item).canSend ? 
                                  'text-green-600 hover:text-green-700 hover:bg-green-50' : 
                                  'text-gray-400'
                                }
                              `}
                              title={getEmailButtonTitle(item)}
                            >
                              {getEmailIcon(item)}
                            </Button>
                           
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleBlockStudent(item.studentId, item.studentName)}
                              disabled={isBlocking[item.studentId] || item.studentBlocked}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50" 
                              title={item.studentBlocked ? "Ya está bloqueado" : "Bloquear Estudiante"}
                            >
                              {isBlocking[item.studentId] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserX className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            </>
          ) : (
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-green-600 mb-2">
                    {(entityFilter || dateFilter) ? 'No se encontraron resultados' : '¡Excelente! No hay materiales vencidos'}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    {(entityFilter || dateFilter) ? 
                      'Intenta modificar los filtros de búsqueda.' : 
                      'Todos los préstamos están al día o han sido devueltos a tiempo.'
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {(entityFilter || dateFilter) && (
                      <Button onClick={clearFilters} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Limpiar Filtros
                      </Button>
                    )}
                    <Button onClick={loadOverdueItems} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verificar Nuevamente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información adicional */}
          {overdueItems.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Acciones Recomendadas</CardTitle>
                <CardDescription className="text-sm">
                  {emailServiceStatus === 'active' ? 
                    "Sistema de email activo. Puedes enviar recordatorios automáticos." :
                    "⚠️ Sistema de email inactivo. Usa métodos alternativos de contacto."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Préstamos Críticos (7+ días)</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Contactar inmediatamente al estudiante</li>
                      <li>• {emailServiceStatus === 'active' ? 'Enviar email de recordatorio urgente' : 'Llamar por teléfono'}</li>
                      <li>• Considerar bloqueo temporal</li>
                      <li>• Evaluar aplicación de sanciones</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-600">Préstamos Urgentes (3-7 días)</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• {emailServiceStatus === 'active' ? 'Enviar recordatorio por email' : 'Contactar por teléfono'}</li>
                      <li>• Programar llamada de seguimiento</li>
                      <li>• Notificar al supervisor del área</li>
                      <li>• Documentar el seguimiento</li>
                    </ul>
                  </div>
                </div>
                
                {emailServiceStatus === 'active' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <MailCheck className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium text-sm">Sistema de Email Activo</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Los correos se envían automáticamente con un diseño profesional que incluye:
                      nivel de urgencia, detalles del préstamo, consecuencias por retraso y datos de contacto.
                    </p>
                  </div>
                )}
                
                {emailServiceStatus === 'inactive' && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <MailX className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium text-sm">Sistema de Email Inactivo</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Contacta al administrador para revisar la configuración del servicio de correo.
                      Mientras tanto, usa llamadas telefónicas y contacto directo.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Panel de información sobre limitaciones de email */}
          {emailServiceStatus === 'active' && overdueItems.length > 0 && (
            <Card className="hidden sm:block">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Información sobre Notificaciones por Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600">Limitaciones de Envío</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Máximo 1 email cada 5 minutos por estudiante</li>
                      <li>• Estudiantes bloqueados no reciben emails</li>
                      <li>• Se requiere email válido registrado</li>
                      <li>• Límite de 5 emails por minuto general</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Contenido del Email</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Diseño profesional responsivo</li>
                      <li>• Nivel de urgencia visual</li>
                      <li>• Detalles completos del préstamo</li>
                      <li>• Consecuencias por no devolver</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverdueItemsPage;