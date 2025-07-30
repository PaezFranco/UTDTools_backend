import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Package, PackageCheck, PackageX, Wrench as ToolIcon, ChevronDown, ChevronUp, Tag, Wifi, WifiOff, RefreshCw, Loader2, X, User, Wrench, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ToolForm from '@/components/ToolForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTools } from '@/hooks/UseTools';

const predefinedCategories = ['Eléctrica', 'Manual', 'Medición', 'Consumible', 'Seguridad', 'Otra'];

const ToolsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Hook personalizado para manejo de herramientas
  const {
    tools,
    loading,
    error,
    isConnected,
    loadTools,
    createTool,
    updateTool,
    deleteTool,
    checkUniqueId,
    refreshTools
  } = useTools();

  // Estados de la UI
  const [entityFilter, setEntityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(predefinedCategories.reduce((acc, category) => {
    acc[category] = true; 
    return acc;
  }, { 'Sin Categoría': true }));
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Verificar filtros de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');
    if (filter === 'maintenance') {
      setActiveFilter('maintenance');
      setEntityFilter(''); 
    } else {
      setActiveFilter(null);
    }
  }, [location.search]);

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTools();
      toast({
        title: "Datos actualizados",
        description: isConnected ? "Las herramientas se han sincronizado con el servidor." : "Verificando conexión...",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearSearch = () => {
    setEntityFilter('');
    setActiveFilter(null);
  };

  const filteredTools = useMemo(() => {
    let tempTools = tools || [];
    if (activeFilter === 'maintenance') {
      tempTools = tempTools.filter(tool => tool?.status === 'Mantenimiento');
    }
    if (entityFilter) {
      tempTools = tempTools.filter(tool => {
        const specificName = tool?.specificName || '';
        const category = tool?.category || '';
        const uniqueId = tool?.uniqueId || '';
        const generalName = tool?.generalName || '';
        
        return (
          specificName.toLowerCase().includes(entityFilter.toLowerCase()) ||
          category.toLowerCase().includes(entityFilter.toLowerCase()) ||
          uniqueId.toLowerCase().includes(entityFilter.toLowerCase()) ||
          generalName.toLowerCase().includes(entityFilter.toLowerCase())
        );
      });
    }
    return tempTools;
  }, [tools, entityFilter, activeFilter]);

  const toolsByCategory = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      const category = tool.category || 'Sin Categoría';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tool);
      return acc;
    }, {});
  }, [filteredTools]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const openModal = (tool = null) => {
    const isEditingMode = !!tool?.uniqueId;
    setCurrentTool(tool ? { ...tool, isEditing: isEditingMode } : { 
      uniqueId: '', 
      specificName: '', 
      category: predefinedCategories[0], 
      generalName: '', 
      status: 'Disponible', 
      maintenance_status: 'OK', 
      last_maintenance: new Date().toISOString().split('T')[0], 
      next_maintenance: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0], 
      isEditing: false 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTool(null);
    setIsScanningBarcode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTool(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (value) => {
    if (value === 'crear_nueva_categoria_placeholder') {
      toast({
        title: "Función no implementada",
        description: "La creación de nuevas categorías directamente desde aquí aún no está disponible. Puedes añadirla manualmente o solicitar esta función.",
      });
      return;
    }
    setCurrentTool(prev => ({ 
      ...prev, 
      category: value, 
      maintenance_status: value === 'Consumible' ? 'N/A' : (prev.maintenance_status === 'N/A' ? 'OK' : prev.maintenance_status) 
    }));
  };

  const handleSimulateScan = () => {
    setIsScanningBarcode(true);
    toast({ title: "Escaneando...", description: "Simulando escaneo de código de barras." });
    setTimeout(() => {
      const randomId = `SCN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setCurrentTool(prev => ({ ...prev, uniqueId: randomId }));
      setIsScanningBarcode(false);
      toast({ title: "¡Escaneo Completo!", description: `ID de herramienta simulado: ${randomId}` });
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!currentTool.specificName || !currentTool.category || !currentTool.generalName) {
      toast({ 
        title: "Error", 
        description: "Nombre específico, categoría y nombre general son obligatorios.", 
        variant: "destructive" 
      });
      return;
    }

    // Validar uniqueId
    if (!currentTool.uniqueId || currentTool.uniqueId.trim() === '') {
      toast({ 
        title: "Error", 
        description: "El ID Único / Código de Barras es obligatorio. Puedes ingresarlo manualmente o escanearlo.", 
        variant: "destructive" 
      });
      return;
    }

    // Verificar conexión antes de proceder
    if (!isConnected) {
      toast({ 
        title: "Sin conexión", 
        description: "No se puede guardar la herramienta sin conexión al servidor.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      if (currentTool.isEditing) { 
        // Actualizar herramienta existente
        await updateTool(currentTool._id, currentTool);
        toast({ 
          title: "Herramienta Actualizada", 
          description: `${currentTool.specificName} ha sido actualizada correctamente.`
        });
      } else { 
        // Verificar ID duplicado antes de crear
        if (typeof checkUniqueId === 'function') {
          const idExists = await checkUniqueId(currentTool.uniqueId.trim());
          if (idExists) {
            toast({ 
              title: "Error: ID Duplicado", 
              description: `El ID de herramienta ${currentTool.uniqueId} ya existe. Ingrese un ID único.`, 
              variant: "destructive" 
            });
            return;
          }
        } else {
          // Verificación manual si checkUniqueId no está disponible
          const existingTool = tools.find(tool => tool.uniqueId === currentTool.uniqueId.trim());
          if (existingTool) {
            toast({ 
              title: "Error: ID Duplicado", 
              description: `El ID de herramienta ${currentTool.uniqueId} ya existe. Ingrese un ID único.`, 
              variant: "destructive" 
            });
            return;
          }
        }
        
        // Crear nueva herramienta
        await createTool(currentTool);
        toast({ 
          title: "Herramienta Agregada", 
          description: `${currentTool.specificName} ha sido agregada correctamente con ID ${currentTool.uniqueId}.`
        });
      }
      closeModal();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo guardar la herramienta", 
        variant: "destructive" 
      });
    }
  };
  
  const openDeleteConfirm = (tool) => {
    setToolToDelete(tool);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setToolToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteTool = async () => {
    if (!toolToDelete) return;

    // Verificar conexión antes de proceder
    if (!isConnected) {
      toast({ 
        title: "Sin conexión", 
        description: "No se puede eliminar la herramienta sin conexión al servidor.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      await deleteTool(toolToDelete._id);
      toast({ 
        title: "Herramienta Eliminada", 
        description: `${toolToDelete.specificName} ha sido eliminada correctamente.`
      });
      closeDeleteConfirm();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo eliminar la herramienta", 
        variant: "destructive" 
      });
    }
  };
  
  const getStatusIcon = (status) => {
    if (status === 'Disponible') return <PackageCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
    if (status === 'En Préstamo') return <PackageX className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
    if (status === 'Mantenimiento') return <ToolIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
    return <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />;
  };

  const getMaintenanceStatusColor = (status) => {
    if (status === 'Urgente') return 'text-red-400 bg-red-500/20';
    if (status === 'Sugerido') return 'text-yellow-400 bg-yellow-500/20';
    if (status === 'N/A') return 'text-gray-400 bg-gray-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  // Componente para vista de tarjetas en móvil optimizada
  const MobileToolCard = ({ tool }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg p-3 sm:p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header de la tarjeta */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight mb-1 break-words">
            {tool.specificName}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {tool.uniqueId}
            </span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
              {tool.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {getStatusIcon(tool.status)}
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getMaintenanceStatusColor(tool.maintenance_status)}`}>
            {tool.maintenance_status}
          </span>
        </div>
      </div>
      
      {/* Información general */}
      <div className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Nombre General:</p>
          <p className="text-sm text-foreground break-words">{tool.generalName}</p>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">Estado:</p>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon(tool.status)}
              <span className="text-xs sm:text-sm font-medium">{tool.status}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Acciones con iconos más grandes */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => openModal(tool)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 h-9 w-9 p-0"
        >
          <Edit className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => openDeleteConfirm(tool)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-9 w-9 p-0"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );

  // Mostrar indicador de carga mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Cargando herramientas...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay conexión y no se pueden cargar los datos
  if (error && !isConnected && tools.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <WifiOff className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4 text-sm">Sin conexión al servidor</p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Reintentar
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
          <h1 className="text-lg font-semibold text-teal-700">Herramientas</h1>
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                placeholder="Buscar herramienta o categoría..."
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
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header desktop */}
          <div className="hidden sm:flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">Gestión de Herramientas</h1>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => openModal()} 
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Agregar Herramienta
              </Button>
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                size="sm"
                className="border-custom-gold/30 hover:bg-custom-gold/10"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Filtro por entidad - Desktop */}
          <div className="relative mb-4 hidden sm:block">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Wrench className="absolute left-9 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filtrar por Herramienta o Categoría (ID/Nombre)..."
              className="pl-16 w-full bg-input border-custom-gold/30 focus:border-custom-gold"
              onChange={(e) => setEntityFilter(e.target.value)}
              value={entityFilter}
            />
          </div>

          {/* Filtro activo */}
          {activeFilter === 'maintenance' && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive-foreground">
              <p className="text-xs sm:text-sm font-medium">
                Mostrando solo herramientas en mantenimiento. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-destructive hover:underline ml-1 text-xs sm:text-sm" 
                  onClick={() => {setActiveFilter(null); navigate('/tools')}}
                >
                  Ver todas las herramientas.
                </Button>
              </p>
            </div>
          )}

          {/* Resultados de búsqueda */}
          {entityFilter && (
            <div className="text-xs sm:text-sm text-gray-600">
              {filteredTools.length > 0 ? (
                `Se encontraron ${filteredTools.length} herramientas que coinciden con "${entityFilter}"`
              ) : (
                `No se encontraron herramientas que coincidan con "${entityFilter}"`
              )}
            </div>
          )}

          {/* Contenido principal por categorías */}
          {Object.keys(toolsByCategory).sort().map(category => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-white shadow-lg">
                <CardHeader 
                  className="flex flex-row items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-teal-700 flex items-center min-w-0">
                    <Tag className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> 
                    <span className="truncate">{category}</span>
                    <span className="ml-2 text-sm sm:text-base flex-shrink-0 bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                      {toolsByCategory[category].length}
                    </span>
                  </h2>
                  {expandedCategories[category] ? 
                    <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-teal-700 flex-shrink-0" /> : 
                    <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-teal-700 flex-shrink-0" />
                  }
                </CardHeader>
                
                <AnimatePresence>
                  {expandedCategories[category] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="p-0">
                        {/* Vista de tabla para desktop */}
                        <div className="hidden lg:block overflow-x-auto">
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow className="hover:bg-gray-50">
                                <TableHead className="text-teal-600 px-4 py-3 whitespace-nowrap">
                                  ID Único
                                </TableHead>
                                <TableHead className="text-teal-600 px-4 py-3 whitespace-nowrap">
                                  Nombre Específico
                                </TableHead>
                                <TableHead className="text-teal-600 px-4 py-3 whitespace-nowrap">
                                  Nombre General
                                </TableHead>
                                <TableHead className="text-teal-600 px-4 py-3 text-center whitespace-nowrap">
                                  Estado
                                </TableHead>
                                <TableHead className="text-teal-600 px-4 py-3 text-center whitespace-nowrap">
                                  Mantenimiento
                                </TableHead>
                                <TableHead className="text-teal-600 px-4 py-3 text-right whitespace-nowrap">
                                  Acciones
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {toolsByCategory[category].map((tool, index) => (
                                <TableRow key={tool.uniqueId || `${category}-${index}`} className="hover:bg-gray-50 transition-colors">
                                  <TableCell className="font-medium text-gray-900 px-4 py-3">
                                    {tool.uniqueId}
                                  </TableCell>
                                  <TableCell className="text-gray-900 px-4 py-3 max-w-[200px] truncate" title={tool.specificName}>
                                    {tool.specificName}
                                  </TableCell>
                                  <TableCell className="text-gray-600 px-4 py-3 max-w-[200px] truncate" title={tool.generalName}>
                                    {tool.generalName}
                                  </TableCell>
                                  <TableCell className="text-center px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                      {getStatusIcon(tool.status)}
                                      <span className="text-sm">{tool.status}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMaintenanceStatusColor(tool.maintenance_status)}`}>
                                      {tool.maintenance_status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right px-4 py-3 space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => openModal(tool)} className="text-blue-500 hover:text-blue-400 h-9 w-9 p-0">
                                      <Edit className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(tool)} className="text-destructive hover:text-destructive/80 h-9 w-9 p-0">
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Vista de tabla compacta para tablet */}
                        <div className="hidden md:block lg:hidden overflow-x-auto">
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow className="hover:bg-gray-50">
                                <TableHead className="text-teal-600 px-3 py-2 text-sm">
                                  ID / Herramienta
                                </TableHead>
                                <TableHead className="text-teal-600 px-3 py-2 text-sm text-center">
                                  Estado
                                </TableHead>
                                <TableHead className="text-teal-600 px-3 py-2 text-sm text-center">
                                  Mantenimiento
                                </TableHead>
                                <TableHead className="text-teal-600 px-3 py-2 text-sm text-right">
                                  Acciones
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {toolsByCategory[category].map((tool, index) => (
                                <TableRow key={tool.uniqueId || `${category}-${index}`} className="hover:bg-gray-50 transition-colors">
                                  <TableCell className="px-3 py-2">
                                    <div className="flex flex-col">
                                      <span className="font-medium text-sm text-gray-900 truncate max-w-[180px]" title={tool.specificName}>
                                        {tool.specificName}
                                      </span>
                                      <span className="text-xs text-gray-600 font-mono">{tool.uniqueId}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center px-3 py-2">
                                    <div className="flex items-center justify-center">
                                      {getStatusIcon(tool.status)}
                                      <span className="hidden xl:inline text-xs ml-1">{tool.status}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center px-3 py-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMaintenanceStatusColor(tool.maintenance_status)}`}>
                                      {tool.maintenance_status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right px-3 py-2 space-x-1">
                                    <Button variant="ghost" size="sm" onClick={() => openModal(tool)} className="text-blue-500 hover:text-blue-400 h-9 w-9 p-0">
                                      <Edit className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(tool)} className="text-destructive hover:text-destructive/80 h-9 w-9 p-0">
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Vista de tarjetas para móvil */}
                        <div className="block md:hidden p-3 sm:p-4">
                          <div className="grid gap-3">
                            {toolsByCategory[category].map((tool, index) => (
                              <MobileToolCard key={tool.uniqueId || `${category}-${index}`} tool={tool} />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}

          {/* Estados vacíos */}
          {Object.keys(toolsByCategory).length === 0 && (entityFilter || activeFilter) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <Card className="bg-white shadow-lg max-w-md mx-auto">
                <CardContent className="p-6 sm:p-8">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeFilter === 'maintenance' ? 'No hay herramientas en mantenimiento' : 'No se encontraron herramientas'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {entityFilter ? `No hay resultados para "${entityFilter}"` : 'Todas las herramientas están funcionando correctamente.'}
                  </p>
                  {entityFilter && (
                    <Button variant="outline" onClick={clearSearch} className="mt-2">
                      Limpiar búsqueda
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {tools.length === 0 && !entityFilter && !activeFilter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <Card className="bg-white shadow-lg max-w-md mx-auto">
                <CardContent className="p-6 sm:p-8">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No hay herramientas registradas
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Comienza agregando la primera herramienta al inventario del laboratorio.
                  </p>
                  <Button onClick={() => openModal()} className="bg-teal-600 hover:bg-teal-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar primera herramienta
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Modal de herramienta */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] bg-white mx-auto overflow-y-auto">
              <DialogHeader className="space-y-2 px-1">
                <DialogTitle className="text-lg sm:text-xl text-teal-700 flex items-center">
                  {currentTool?.isEditing ? (
                    <>
                      <Edit className="mr-2 h-5 w-5" />
                      Editar Herramienta
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Agregar Herramienta
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm">
                  {currentTool?.isEditing 
                    ? 'Modifica los detalles de la herramienta seleccionada.' 
                    : 'Completa la información de la nueva herramienta. Todos los campos marcados son obligatorios.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 px-1">
                <ToolForm
                  currentTool={currentTool}
                  handleInputChange={handleInputChange}
                  handleCategoryChange={handleCategoryChange}
                  handleSimulateScan={handleSimulateScan}
                  isScanningBarcode={isScanningBarcode}
                  isEditing={currentTool?.isEditing}
                  onSubmit={handleSubmit}
                  predefinedCategories={predefinedCategories}
                />
              </div>
              
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 px-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeModal} 
                  className="w-full sm:w-auto text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  form="tool-form" 
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isScanningBarcode}
                >
                  {isScanningBarcode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Escaneando...
                    </>
                  ) : (
                    <>
                      {currentTool?.isEditing ? 'Actualizar' : 'Guardar'} Herramienta
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de confirmación de eliminación */}
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="w-[95vw] max-w-md bg-white mx-auto">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-lg sm:text-xl text-red-600 flex items-center">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm">
                  <div className="space-y-2">
                    <p>¿Estás seguro de que quieres eliminar esta herramienta?</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-900 text-sm">{toolToDelete?.specificName}</p>
                      <p className="text-xs text-gray-600">ID: {toolToDelete?.uniqueId}</p>
                      <p className="text-xs text-gray-600">Categoría: {toolToDelete?.category}</p>
                    </div>
                    <p className="text-xs text-red-600 font-medium">Esta acción no se puede deshacer.</p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeDeleteConfirm} 
                  className="w-full sm:w-auto text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteTool}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Herramienta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
};

export default ToolsPage;