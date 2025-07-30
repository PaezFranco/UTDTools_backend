// import React, { useState, useEffect } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { 
//   Search, 
//   CalendarDays, 
//   ArrowRightLeft, 
//   User, 
//   Wrench, 
//   Clock, 
//   UserCog, 
//   Edit2,
//   Loader2,
//   RefreshCw,
//   ChevronLeft,
//   ChevronRight,
//   BarChart3,
//   TrendingUp,
//   AlertTriangle,
//   CheckCircle,
//   ExternalLink
// } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { Link, useNavigate } from 'react-router-dom';
// import { useToast } from '@/components/ui/use-toast';
// import { useAuth } from '@/contexts/AuthContext';

// const HistoryPage = () => {
//   // Estados para datos
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState({
//     totalEntries: 0,
//     totalLoans: 0,
//     totalReturns: 0,
//     activeLoans: 0,
//     overdueLoans: 0,
//     uniqueStudents: 0,
//     uniqueTools: 0
//   });
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 0,
//     totalEntries: 0,
//     hasNext: false,
//     hasPrev: false,
//     limit: 20
//   });

//   // Estados para filtros y UI
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('todos');
//   const [entityFilter, setEntityFilter] = useState('');
//   const [sortBy, setSortBy] = useState('date');
//   const [sortOrder, setSortOrder] = useState('desc');
  
//   // Estados para modal de edición
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editingEntry, setEditingEntry] = useState(null);
//   const [newDueDate, setNewDueDate] = useState('');
//   const [newDueTime, setNewDueTime] = useState('');
//   const [editReason, setEditReason] = useState('');
//   const [isUpdating, setIsUpdating] = useState(false);

//   const { toast } = useToast();
//   const { apiRequest, user } = useAuth();
//   const navigate = useNavigate();

//   // Cargar historial del backend
//   const loadHistory = async (page = 1) => {
//     try {
//       setLoading(true);
      
//       // Primero intentar cargar desde el endpoint de historial completo
//       try {
//         const params = new URLSearchParams({
//           page: page.toString(),
//           limit: pagination.limit.toString(),
//           search: searchTerm,
//           type: filterType === 'todos' ? 'all' : filterType,
//           entityFilter: entityFilter,
//           sortBy: sortBy,
//           sortOrder: sortOrder
//         });

//         const response = await apiRequest(`/history/complete?${params}`);
        
//         if (response.ok) {
//           const data = await response.json();
//           console.log('History data loaded from /history/complete:', data);
          
//           setHistory(data.data || []);
//           setStats(data.stats || {});
//           setPagination(data.pagination || {});
//           return; // Salir si fue exitoso
//         }
//       } catch (error) {
//         console.log('Endpoint /history/complete no disponible, intentando alternativa...');
//       }

//       // Si el endpoint de historial no existe, cargar desde otros endpoints
//       console.log('Cargando historial desde endpoints alternativos...');
      
//       // Cargar préstamos activos
//       const loansResponse = await apiRequest('/loans');
//       let loansData = [];
//       if (loansResponse.ok) {
//         loansData = await loansResponse.json();
//         console.log('Loans data loaded:', loansData);
//       }

//       // Cargar devoluciones
//       const returnsResponse = await apiRequest('/returns');
//       let returnsData = [];
//       if (returnsResponse.ok) {
//         returnsData = await returnsResponse.json();
//         console.log('Returns data loaded:', returnsData);
//       }

//       // Combinar y procesar los datos
//       const combinedHistory = [];

//       // Procesar préstamos activos
//       if (Array.isArray(loansData)) {
//         loansData.forEach(loan => {
//           if (loan.tools_borrowed && Array.isArray(loan.tools_borrowed)) {
//             loan.tools_borrowed.forEach(toolBorrowed => {
//               const tool = toolBorrowed.tool_id;
//               const student = loan.student_id;
              
//               if (tool && student) {
//                 const now = new Date();
//                 const dueDate = new Date(loan.estimated_return_date);
//                 const isOverdue = dueDate < now;
                
//                 combinedHistory.push({
//                   id: `loan-${loan._id}-${tool._id || tool.toolId}`,
//                   loanId: loan._id,
//                   type: 'Préstamo',
//                   status: loan.status === 'active' ? (isOverdue ? 'Préstamo Vencido' : 'Préstamo Activo') : 'Devuelto',
//                   studentId: student._id || student.student_id,
//                   studentCode: student.student_id,
//                   studentName: student.full_name || student.name,
//                   toolId: tool.toolId || tool._id,
//                   toolName: tool.specificName || tool.name,
//                   loanDateTime: loan.loan_date,
//                   dueDateTime: loan.estimated_return_date,
//                   actualReturnDateTime: loan.actual_return_date || null,
//                   admin: loan.supervisor_id?.full_name || loan.supervisor_id?.name || 'Admin',
//                   details: `Préstamo ${loan.status}`,
//                   createdAt: loan.loan_date
//                 });
//               }
//             });
//           }
//         });
//       }

//       // Procesar devoluciones
//       if (Array.isArray(returnsData)) {
//         returnsData.forEach(returnItem => {
//           if (returnItem.tools_returned && Array.isArray(returnItem.tools_returned)) {
//             returnItem.tools_returned.forEach(toolReturned => {
//               const tool = toolReturned.tool_id;
//               const student = returnItem.student_id;
              
//               if (tool && student) {
//                 combinedHistory.push({
//                   id: `return-${returnItem._id}-${tool._id || tool.toolId}`,
//                   type: 'Devolución',
//                   status: 'Devuelto',
//                   studentId: student._id || student.student_id,
//                   studentCode: student.student_id,
//                   studentName: student.full_name || student.name,
//                   toolId: tool.toolId || tool._id,
//                   toolName: tool.specificName || tool.name,
//                   loanDateTime: returnItem.loan_id?.loan_date,
//                   dueDateTime: returnItem.loan_id?.estimated_return_date,
//                   actualReturnDateTime: returnItem.return_date,
//                   admin: returnItem.supervisor_id?.full_name || returnItem.supervisor_id?.name || 'Admin',
//                   details: `Devolución ${returnItem.return_status}`,
//                   createdAt: returnItem.return_date
//                 });
//               }
//             });
//           }
//         });
//       }

//       // Ordenar por fecha de creación (más reciente primero)
//       combinedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//       // Aplicar filtros
//       let filteredHistory = combinedHistory;
      
//       if (searchTerm) {
//         filteredHistory = filteredHistory.filter(item =>
//           item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           item.toolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           item.toolId?.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//       }

//       if (filterType !== 'todos') {
//         if (filterType === 'préstamo') {
//           filteredHistory = filteredHistory.filter(item => item.type === 'Préstamo');
//         } else if (filterType === 'devolución') {
//           filteredHistory = filteredHistory.filter(item => item.type === 'Devolución');
//         } else if (filterType === 'activos') {
//           filteredHistory = filteredHistory.filter(item => item.status === 'Préstamo Activo');
//         } else if (filterType === 'vencidos') {
//           filteredHistory = filteredHistory.filter(item => item.status === 'Préstamo Vencido');
//         }
//       }

//       if (entityFilter) {
//         filteredHistory = filteredHistory.filter(item =>
//           item.studentName?.toLowerCase().includes(entityFilter.toLowerCase()) ||
//           item.toolName?.toLowerCase().includes(entityFilter.toLowerCase()) ||
//           item.toolId?.toLowerCase().includes(entityFilter.toLowerCase()) ||
//           item.studentCode?.toLowerCase().includes(entityFilter.toLowerCase())
//         );
//       }

//       // Calcular estadísticas
//       const totalLoans = combinedHistory.filter(item => item.type === 'Préstamo').length;
//       const totalReturns = combinedHistory.filter(item => item.type === 'Devolución').length;
//       const activeLoans = combinedHistory.filter(item => item.status === 'Préstamo Activo').length;
//       const overdueLoans = combinedHistory.filter(item => item.status === 'Préstamo Vencido').length;

//       setStats({
//         totalEntries: combinedHistory.length,
//         totalLoans,
//         totalReturns,
//         activeLoans,
//         overdueLoans,
//         uniqueStudents: new Set(combinedHistory.map(item => item.studentId)).size,
//         uniqueTools: new Set(combinedHistory.map(item => item.toolId)).size
//       });

//       // Paginación simple
//       const startIndex = (page - 1) * pagination.limit;
//       const endIndex = startIndex + pagination.limit;
//       const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

//       setHistory(paginatedHistory);
//       setPagination({
//         currentPage: page,
//         totalPages: Math.ceil(filteredHistory.length / pagination.limit),
//         totalEntries: filteredHistory.length,
//         hasNext: endIndex < filteredHistory.length,
//         hasPrev: page > 1,
//         limit: pagination.limit
//       });

//       if (filteredHistory.length === 0 && searchTerm) {
//         toast({
//           title: "Sin Resultados",
//           description: "No se encontraron registros que coincidan con los filtros aplicados.",
//           variant: "default"
//         });
//       }

//     } catch (error) {
//       console.error('Error loading history:', error);
//       toast({
//         title: "Error de Conexión",
//         description: "No se pudo cargar el historial. Verifique su conexión.",
//         variant: "destructive"
//       });
//       setHistory([]);
//       setStats({
//         totalEntries: 0,
//         totalLoans: 0,
//         totalReturns: 0,
//         activeLoans: 0,
//         overdueLoans: 0,
//         uniqueStudents: 0,
//         uniqueTools: 0
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cargar datos al montar el componente
//   useEffect(() => {
//     if (user) {
//       loadHistory(1);
//     }
//   }, [user]);

//   // Recargar cuando cambien los filtros
//   useEffect(() => {
//     if (user) {
//       const timeoutId = setTimeout(() => {
//         loadHistory(1);
//       }, 500);
      
//       return () => clearTimeout(timeoutId);
//     }
//   }, [searchTerm, filterType, entityFilter, sortBy, sortOrder]);

//   // Abrir modal de edición
//   const openEditModal = (entry) => {
//     if (entry.type !== 'Préstamo' || entry.status !== 'Préstamo Activo') {
//       toast({ 
//         title: "No Editable", 
//         description: "Solo los préstamos activos pueden tener su fecha límite modificada.", 
//         variant: "destructive"
//       });
//       return;
//     }

//     setEditingEntry(entry);
//     const dueDate = entry.dueDateTime ? new Date(entry.dueDateTime) : new Date();
//     setNewDueDate(dueDate.toISOString().split('T')[0]);
//     setNewDueTime(dueDate.toTimeString().split(' ')[0].substring(0,5));
//     setEditReason('');
//     setIsEditModalOpen(true);
//   };

//   // Guardar nueva fecha límite
//   const handleSaveDueDate = async () => {
//     if (!editingEntry || !newDueDate || !newDueTime) {
//       toast({ 
//         title: "Error", 
//         description: "Por favor, complete todos los campos.", 
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsUpdating(true);

//     try {
//       const newDueDateTime = new Date(`${newDueDate}T${newDueTime}:00`).toISOString();
      
//       const response = await apiRequest(`/history/loan/${editingEntry.loanId}/due-date`, {
//         method: 'PUT',
//         body: JSON.stringify({
//           newDueDate: newDueDateTime,
//           reason: editReason || 'Actualización administrativa'
//         })
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log('Due date updated:', result);
        
//         toast({
//           title: "Fecha Límite Actualizada",
//           description: `La fecha límite para ${editingEntry.toolName} ha sido cambiada exitosamente.`,
//           duration: 5000
//         });

//         setIsEditModalOpen(false);
//         setEditingEntry(null);
        
//         // Recargar historial para reflejar cambios
//         await loadHistory(pagination.currentPage);
//       } else {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Error al actualizar fecha límite');
//       }
//     } catch (error) {
//       console.error('Error updating due date:', error);
//       toast({
//         title: "Error",
//         description: error.message || "No se pudo actualizar la fecha límite",
//         variant: "destructive"
//       });
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Cambiar página
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.totalPages) {
//       loadHistory(newPage);
//     }
//   };

//   // Navegar al perfil del estudiante
//   const navigateToStudent = (studentId, studentCode) => {
//     if (studentId) {
//       // Navegar directamente al perfil usando el ID interno
//       navigate(`/students/${studentId}`);
//     } else if (studentCode) {
//       // Si no hay ID interno, usar el código de estudiante
//       navigate(`/students/by-code/${studentCode}`);
//     } else {
//       toast({
//         title: "Error",
//         description: "No se pudo identificar al estudiante",
//         variant: "destructive"
//       });
//     }
//   };

//   // Obtener atributos del tipo de entrada
//   const getTypeAttributes = (item) => {
//     switch (item.status) {
//       case 'Préstamo Vencido':
//         return { 
//           icon: <ArrowRightLeft className="h-4 w-4 text-red-500" />, 
//           color: 'text-red-500', 
//           label: 'Préstamo Vencido'
//         };
//       case 'Préstamo Activo':
//         return { 
//           icon: <ArrowRightLeft className="h-4 w-4 text-blue-500" />, 
//           color: 'text-blue-500',
//           label: 'Préstamo Activo'
//         };
//       case 'Devuelto':
//         return { 
//           icon: <ArrowRightLeft className="h-4 w-4 text-primary transform rotate-180" />, 
//           color: 'text-primary',
//           label: 'Devolución'
//         };
//       default:
//         return { 
//           icon: <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />, 
//           color: 'text-muted-foreground',
//           label: item.status || item.type
//         };
//     }
//   };

//   // Formatear fecha para mostrar
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
    
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('es-ES', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       return 'Fecha inválida';
//     }
//   };

//   // Mostrar loading si no hay usuario autenticado
//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   return (
//     <motion.div 
//       className="space-y-6"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//         <h1 className="text-3xl font-bold text-primary">Historial Completo</h1>
//         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//           {/* <div className="relative flex-grow">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Buscar en historial..."
//               className="pl-10 w-full bg-input border-custom-gold/30 focus:border-custom-gold"
//               onChange={(e) => setSearchTerm(e.target.value)}
//               value={searchTerm}
//             />
//           </div> */}
//           <Select value={filterType} onValueChange={setFilterType}>
//             <SelectTrigger className="w-full sm:w-[180px] bg-input border-custom-gold/30 focus:border-custom-gold text-foreground">
//               <SelectValue placeholder="Filtrar por tipo" />
//             </SelectTrigger>
//             <SelectContent className="bg-card border-custom-gold/50 text-foreground">
//               <SelectItem value="todos">Todos los Tipos</SelectItem>
//               <SelectItem value="préstamo">Préstamos</SelectItem>
              
//               <SelectItem value="activos">Préstamos Activos</SelectItem>
//               <SelectItem value="vencidos">Préstamos Vencidos</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button 
//             onClick={() => loadHistory(pagination.currentPage)} 
//             variant="outline"
//             size="sm"
//             className="border-custom-gold/30 hover:bg-custom-gold/10"
//           >
//             <RefreshCw className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
      
//       {/* Filtro por entidad */}
//       <div className="relative mb-4">
//         <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//         <Wrench className="absolute left-9 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//         <Input
//           type="search"
//           placeholder="Filtrar por Estudiante o Herramienta (ID/Nombre)..."
//           className="pl-16 w-full bg-input border-custom-gold/30 focus:border-custom-gold"
//           onChange={(e) => setEntityFilter(e.target.value)}
//           value={entityFilter}
//         />
//       </div>

//       {/* Estadísticas */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
//       >
//         <Card className="bg-card border-border">
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <BarChart3 className="h-5 w-5 text-custom-gold" />
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Registros</p>
//                 <p className="text-2xl font-bold text-gradient-gold-teal">{stats.totalEntries || 0}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-card border-border">
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <ArrowRightLeft className="h-5 w-5 text-blue-500" />
//               <div>
//                 <p className="text-sm text-muted-foreground">Préstamos</p>
//                 <p className="text-2xl font-bold text-gradient-gold-teal">{stats.totalLoans || 0}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* <Card className="bg-card border-border">
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <CheckCircle className="h-5 w-5 text-primary" />
//               <div>
//                 <p className="text-sm text-muted-foreground">Devoluciones</p>
//                 <p className="text-2xl font-bold text-gradient-gold-teal">{stats.totalReturns || 0}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card> */}

//         <Card className="bg-card border-border">
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <AlertTriangle className="h-5 w-5 text-red-500" />
//               <div>
//                 <p className="text-sm text-muted-foreground">Vencidos</p>
//                 <p className="text-2xl font-bold text-gradient-gold-teal">{stats.overdueLoans || 0}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Tabla de historial */}
//       <motion.div 
//         className="rounded-lg border border-border shadow-sm bg-card"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.1 }}
//       >
//         <div className="overflow-x-auto">
//           <Table className="w-full">
//             <TableHeader>
//               <TableRow className="hover:bg-muted/50">
//                 <TableHead className="text-custom-gold px-3 py-3 whitespace-nowrap min-w-[150px]">Tipo</TableHead>
//                 <TableHead className="text-custom-gold px-3 py-3 whitespace-nowrap min-w-[200px]">Entidad</TableHead>
//                 <TableHead className="text-custom-gold px-3 py-3 hidden md:table-cell whitespace-nowrap min-w-[130px]">Hora Préstamo</TableHead>
//                 <TableHead className="text-custom-gold px-3 py-3 whitespace-nowrap min-w-[170px]">Fecha Límite</TableHead>
//                 <TableHead className="text-custom-gold px-3 py-3 hidden lg:table-cell whitespace-nowrap min-w-[170px]">Devolución Real</TableHead>
//                 <TableHead className="text-custom-gold px-3 py-3 hidden xl:table-cell whitespace-nowrap min-w-[150px]">Admin</TableHead>
                
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-8">
//                     <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//                     <p className="text-muted-foreground">Cargando historial...</p>
//                   </TableCell>
//                 </TableRow>
//               ) : history.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-8">
//                     <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//                     <p className="text-muted-foreground">No hay registros disponibles</p>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 history.map((item, index) => {
//                   const { icon, color, label } = getTypeAttributes(item);
                  
//                   return (
//                     <TableRow key={item.id || index} className="hover:bg-muted/20 transition-colors">
//                       <TableCell className={`${color} font-semibold flex items-center px-3 py-3 whitespace-nowrap`}>
//                         {icon}
//                         <span className="ml-2">{label}</span>
//                       </TableCell>
//                       <TableCell className="text-foreground px-3 py-3 whitespace-nowrap max-w-[200px]">
//                         {item.studentName && (
//                           <button
//                             onClick={() => navigateToStudent(item.studentId, item.studentCode)}
//                             className="hover:underline flex items-center text-sm truncate text-blue-500 hover:text-blue-400 transition-colors"
//                             title={`Ver perfil de ${item.studentName}`}
//                           >
//                             <User className="inline h-3 w-3 mr-1 flex-shrink-0"/>
//                             {item.studentName}
//                             <ExternalLink className="inline h-3 w-3 ml-1 flex-shrink-0" />
//                           </button>
//                         )}
//                         <div className="text-xs text-muted-foreground flex items-center truncate" title={`${item.toolName} (${item.toolId})`}>
//                           <Wrench className="inline h-3 w-3 mr-1 text-primary flex-shrink-0"/>
//                           {item.toolName} ({item.toolId})
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-muted-foreground hidden md:table-cell px-3 py-3 whitespace-nowrap">
//                         <Clock className="inline h-4 w-4 mr-1"/>
//                         {item.loanDateTime ? new Date(item.loanDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
//                       </TableCell>
//                       <TableCell className="text-muted-foreground px-3 py-3 whitespace-nowrap">
//                         {item.dueDateTime ? (
//                           <>
//                             <CalendarDays className="inline h-4 w-4 mr-1"/>
//                             {new Date(item.dueDateTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
//                           </>
//                         ) : 'N/A'}
//                       </TableCell>
//                       <TableCell className="text-muted-foreground hidden lg:table-cell px-3 py-3 whitespace-nowrap">
//                         {item.actualReturnDateTime ? (
//                           <>
//                             <CalendarDays className="inline h-4 w-4 mr-1"/>
//                             {new Date(item.actualReturnDateTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
//                           </>
//                         ) : 'Pendiente'}
//                       </TableCell>
//                       <TableCell className="text-muted-foreground hidden xl:table-cell px-3 py-3 whitespace-nowrap">
//                         <UserCog className="inline h-4 w-4 mr-1"/>
//                         {item.admin || 'N/A'}
//                       </TableCell>
//                       <TableCell className="text-right px-3 py-3 whitespace-nowrap">
//                         {item.type === 'Préstamo' && item.status === 'Préstamo Activo' && (
//                           <Button 
//                             variant="ghost" 
//                             size="icon" 
//                             onClick={() => openEditModal(item)} 
//                             title="Editar Fecha Límite" 
//                             className="h-7 w-7"
//                           >
//                             <Edit2 className="h-4 w-4 text-blue-500"/>
//                           </Button>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Paginación */}
//         {!loading && history.length > 0 && (
//           <div className="flex items-center justify-between px-6 py-4 border-t border-border">
//             <div className="text-sm text-muted-foreground">
//               Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a{' '}
//               {Math.min(pagination.currentPage * pagination.limit, pagination.totalEntries)} de{' '}
//               {pagination.totalEntries} registros
//             </div>
            
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(pagination.currentPage - 1)}
//                 disabled={!pagination.hasPrev}
//                 className="border-custom-gold/30 hover:bg-custom-gold/10"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//                 Anterior
//               </Button>
              
//               <div className="flex items-center gap-1">
//                 <span className="text-sm text-gradient-gold-teal">
//                   Página {pagination.currentPage} de {pagination.totalPages}
//                 </span>
//               </div>
              
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(pagination.currentPage + 1)}
//                 disabled={!pagination.hasNext}
//                 className="border-custom-gold/30 hover:bg-custom-gold/10"
//               >
//                 Siguiente
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </motion.div>

//       {/* Mensaje cuando no hay resultados */}
//       {!loading && history.length === 0 && (searchTerm || filterType !== 'todos' || entityFilter) && (
//         <motion.p 
//           className="text-center text-muted-foreground py-8"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           No se encontraron registros en el historial que coincidan con los filtros.
//         </motion.p>
//       )}

//       {/* Modal de edición de fecha límite */}
//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//         <DialogContent className="sm:max-w-md bg-card border-custom-gold/50">
//           <DialogHeader>
//             <DialogTitle className="text-gradient-gold-teal">Editar Fecha Límite</DialogTitle>
//             <DialogDescription>
//               Ajusta la fecha y hora límite para el préstamo de: <span className="font-semibold">{editingEntry?.toolName}</span> para <span className="font-semibold">{editingEntry?.studentName}</span>.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="newDueDate" className="text-right text-custom-gold col-span-1">Nueva Fecha</Label>
//               <Input 
//                 id="newDueDate" 
//                 type="date" 
//                 value={newDueDate} 
//                 onChange={(e) => setNewDueDate(e.target.value)}
//                 className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold"
//                 min={new Date().toISOString().split('T')[0]}
//               />
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="newDueTime" className="text-right text-custom-gold col-span-1">Nueva Hora</Label>
//               <Input 
//                 id="newDueTime" 
//                 type="time" 
//                 value={newDueTime}
//                 onChange={(e) => setNewDueTime(e.target.value)}
//                 className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold"
//               />
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="editReason" className="text-right text-custom-gold col-span-1">Razón</Label>
//               <Input
//                 id="editReason"
//                 placeholder="Ej: Extensión por proyecto especial"
//                 value={editReason}
//                 onChange={(e) => setEditReason(e.target.value)}
//                 className="col-span-3 bg-input border-custom-gold/30 focus:border-custom-gold"
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button 
//               variant="outline" 
//               onClick={() => setIsEditModalOpen(false)} 
//               disabled={isUpdating}
//               className="border-custom-orange text-custom-orange hover:bg-custom-orange/10"
//             >
//               Cancelar
//             </Button>
//             <Button 
//               onClick={handleSaveDueDate}
//               disabled={isUpdating || !newDueDate || !newDueTime}
//               className="bg-primary hover:bg-primary/90 text-primary-foreground"
//             >
//               {isUpdating ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Actualizando...
//                 </>
//               ) : (
//                 'Guardar Cambios'
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </motion.div>
//   );
// };

// export default HistoryPage;

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  CalendarDays, 
  ArrowRightLeft, 
  User, 
  Wrench, 
  Clock, 
  UserCog, 
  Edit2,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Eye,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const HistoryPage = () => {
  // Estados para datos
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalLoans: 0,
    totalReturns: 0,
    activeLoans: 0,
    overdueLoans: 0,
    uniqueStudents: 0,
    uniqueTools: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalEntries: 0,
    hasNext: false,
    hasPrev: false,
    limit: 20
  });

  // Estados para filtros y UI
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [entityFilter, setEntityFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();
  const { apiRequest, user } = useAuth();
  const navigate = useNavigate();

  // Cargar historial del backend
  const loadHistory = async (page = 1) => {
    try {
      setLoading(true);
      
      // Primero intentar cargar desde el endpoint de historial completo
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          search: searchTerm,
          type: filterType === 'todos' ? 'all' : filterType,
          entityFilter: entityFilter,
          sortBy: sortBy,
          sortOrder: sortOrder
        });

        const response = await apiRequest(`/history/complete?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('History data loaded from /history/complete:', data);
          
          setHistory(data.data || []);
          setStats(data.stats || {});
          setPagination(data.pagination || {});
          return; // Salir si fue exitoso
        }
      } catch (error) {
        console.log('Endpoint /history/complete no disponible, intentando alternativa...');
      }

      // Si el endpoint de historial no existe, cargar desde otros endpoints
      console.log('Cargando historial desde endpoints alternativos...');
      
      // Cargar préstamos activos
      const loansResponse = await apiRequest('/loans');
      let loansData = [];
      if (loansResponse.ok) {
        loansData = await loansResponse.json();
        console.log('Loans data loaded:', loansData);
      }

      // Cargar devoluciones
      const returnsResponse = await apiRequest('/returns');
      let returnsData = [];
      if (returnsResponse.ok) {
        returnsData = await returnsResponse.json();
        console.log('Returns data loaded:', returnsData);
      }

      // Combinar y procesar los datos
      const combinedHistory = [];

      // Procesar préstamos activos
      if (Array.isArray(loansData)) {
        loansData.forEach(loan => {
          if (loan.tools_borrowed && Array.isArray(loan.tools_borrowed)) {
            loan.tools_borrowed.forEach(toolBorrowed => {
              const tool = toolBorrowed.tool_id;
              const student = loan.student_id;
              
              if (tool && student) {
                const now = new Date();
                const dueDate = new Date(loan.estimated_return_date);
                const isOverdue = dueDate < now;
                
                combinedHistory.push({
                  id: `loan-${loan._id}-${tool._id || tool.toolId}`,
                  loanId: loan._id,
                  type: 'Préstamo',
                  status: loan.status === 'active' ? (isOverdue ? 'Préstamo Vencido' : 'Préstamo Activo') : 'Devuelto',
                  studentId: student._id || student.student_id,
                  studentCode: student.student_id,
                  studentName: student.full_name || student.name,
                  toolId: tool.toolId || tool._id,
                  toolName: tool.specificName || tool.name,
                  loanDateTime: loan.loan_date,
                  dueDateTime: loan.estimated_return_date,
                  actualReturnDateTime: loan.actual_return_date || null,
                  admin: loan.supervisor_id?.full_name || loan.supervisor_id?.name || 'Admin',
                  details: `Préstamo ${loan.status}`,
                  createdAt: loan.loan_date
                });
              }
            });
          }
        });
      }

      // Procesar devoluciones
      if (Array.isArray(returnsData)) {
        returnsData.forEach(returnItem => {
          if (returnItem.tools_returned && Array.isArray(returnItem.tools_returned)) {
            returnItem.tools_returned.forEach(toolReturned => {
              const tool = toolReturned.tool_id;
              const student = returnItem.student_id;
              
              if (tool && student) {
                combinedHistory.push({
                  id: `return-${returnItem._id}-${tool._id || tool.toolId}`,
                  type: 'Devolución',
                  status: 'Devuelto',
                  studentId: student._id || student.student_id,
                  studentCode: student.student_id,
                  studentName: student.full_name || student.name,
                  toolId: tool.toolId || tool._id,
                  toolName: tool.specificName || tool.name,
                  loanDateTime: returnItem.loan_id?.loan_date,
                  dueDateTime: returnItem.loan_id?.estimated_return_date,
                  actualReturnDateTime: returnItem.return_date,
                  admin: returnItem.supervisor_id?.full_name || returnItem.supervisor_id?.name || 'Admin',
                  details: `Devolución ${returnItem.return_status}`,
                  createdAt: returnItem.return_date
                });
              }
            });
          }
        });
      }

      // Ordenar por fecha de creación (más reciente primero)
      combinedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Aplicar filtros
      let filteredHistory = combinedHistory;
      
      if (searchTerm) {
        filteredHistory = filteredHistory.filter(item =>
          item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.toolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.toolId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filterType !== 'todos') {
        if (filterType === 'préstamo') {
          filteredHistory = filteredHistory.filter(item => item.type === 'Préstamo');
        } else if (filterType === 'devolución') {
          filteredHistory = filteredHistory.filter(item => item.type === 'Devolución');
        } else if (filterType === 'activos') {
          filteredHistory = filteredHistory.filter(item => item.status === 'Préstamo Activo');
        } else if (filterType === 'vencidos') {
          filteredHistory = filteredHistory.filter(item => item.status === 'Préstamo Vencido');
        }
      }

      if (entityFilter) {
        filteredHistory = filteredHistory.filter(item =>
          item.studentName?.toLowerCase().includes(entityFilter.toLowerCase()) ||
          item.toolName?.toLowerCase().includes(entityFilter.toLowerCase()) ||
          item.toolId?.toLowerCase().includes(entityFilter.toLowerCase()) ||
          item.studentCode?.toLowerCase().includes(entityFilter.toLowerCase())
        );
      }

      // Calcular estadísticas
      const totalLoans = combinedHistory.filter(item => item.type === 'Préstamo').length;
      const totalReturns = combinedHistory.filter(item => item.type === 'Devolución').length;
      const activeLoans = combinedHistory.filter(item => item.status === 'Préstamo Activo').length;
      const overdueLoans = combinedHistory.filter(item => item.status === 'Préstamo Vencido').length;

      setStats({
        totalEntries: combinedHistory.length,
        totalLoans,
        totalReturns,
        activeLoans,
        overdueLoans,
        uniqueStudents: new Set(combinedHistory.map(item => item.studentId)).size,
        uniqueTools: new Set(combinedHistory.map(item => item.toolId)).size
      });

      // Paginación simple
      const startIndex = (page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

      setHistory(paginatedHistory);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(filteredHistory.length / pagination.limit),
        totalEntries: filteredHistory.length,
        hasNext: endIndex < filteredHistory.length,
        hasPrev: page > 1,
        limit: pagination.limit
      });

      if (filteredHistory.length === 0 && searchTerm) {
        toast({
          title: "Sin Resultados",
          description: "No se encontraron registros que coincidan con los filtros aplicados.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Error de Conexión",
        description: "No se pudo cargar el historial. Verifique su conexión.",
        variant: "destructive"
      });
      setHistory([]);
      setStats({
        totalEntries: 0,
        totalLoans: 0,
        totalReturns: 0,
        activeLoans: 0,
        overdueLoans: 0,
        uniqueStudents: 0,
        uniqueTools: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user) {
      loadHistory(1);
    }
  }, [user]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        loadHistory(1);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, filterType, entityFilter, sortBy, sortOrder]);

  // Abrir modal de edición
  const openEditModal = (entry) => {
    if (entry.type !== 'Préstamo' || entry.status !== 'Préstamo Activo') {
      toast({ 
        title: "No Editable", 
        description: "Solo los préstamos activos pueden tener su fecha límite modificada.", 
        variant: "destructive"
      });
      return;
    }

    setEditingEntry(entry);
    const dueDate = entry.dueDateTime ? new Date(entry.dueDateTime) : new Date();
    setNewDueDate(dueDate.toISOString().split('T')[0]);
    setNewDueTime(dueDate.toTimeString().split(' ')[0].substring(0,5));
    setEditReason('');
    setIsEditModalOpen(true);
  };

  // Guardar nueva fecha límite
  const handleSaveDueDate = async () => {
    if (!editingEntry || !newDueDate || !newDueTime) {
      toast({ 
        title: "Error", 
        description: "Por favor, complete todos los campos.", 
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      const newDueDateTime = new Date(`${newDueDate}T${newDueTime}:00`).toISOString();
      
      const response = await apiRequest(`/history/loan/${editingEntry.loanId}/due-date`, {
        method: 'PUT',
        body: JSON.stringify({
          newDueDate: newDueDateTime,
          reason: editReason || 'Actualización administrativa'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Due date updated:', result);
        
        toast({
          title: "Fecha Límite Actualizada",
          description: `La fecha límite para ${editingEntry.toolName} ha sido cambiada exitosamente.`,
          duration: 5000
        });

        setIsEditModalOpen(false);
        setEditingEntry(null);
        
        // Recargar historial para reflejar cambios
        await loadHistory(pagination.currentPage);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar fecha límite');
      }
    } catch (error) {
      console.error('Error updating due date:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la fecha límite",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Cambiar página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadHistory(newPage);
    }
  };

  // Navegar al perfil del estudiante
  const navigateToStudent = (studentId, studentCode) => {
    if (studentId) {
      // Navegar directamente al perfil usando el ID interno
      navigate(`/students/${studentId}`);
    } else if (studentCode) {
      // Si no hay ID interno, usar el código de estudiante
      navigate(`/students/by-code/${studentCode}`);
    } else {
      toast({
        title: "Error",
        description: "No se pudo identificar al estudiante",
        variant: "destructive"
      });
    }
  };

  // Obtener atributos del tipo de entrada
  const getTypeAttributes = (item) => {
    switch (item.status) {
      case 'Préstamo Vencido':
        return { 
          icon: <ArrowRightLeft className="h-4 w-4 text-red-500" />, 
          color: 'text-red-500', 
          label: 'Vencido',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'Préstamo Activo':
        return { 
          icon: <ArrowRightLeft className="h-4 w-4 text-blue-500" />, 
          color: 'text-blue-500',
          label: 'Activo',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'Devuelto':
        return { 
          icon: <CheckCircle className="h-4 w-4 text-green-500" />, 
          color: 'text-green-500',
          label: 'Devuelto',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      default:
        return { 
          icon: <ArrowRightLeft className="h-4 w-4 text-gray-500" />, 
          color: 'text-gray-500',
          label: item.status || item.type,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Componente para tarjetas móviles
  const HistoryCard = ({ item }) => {
    const { icon, color, label, bgColor, borderColor } = getTypeAttributes(item);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${bgColor} ${borderColor} rounded-lg border p-4 shadow-sm`}
      >
        {/* Header de la tarjeta */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <Badge variant="outline" className={`${color} text-xs`}>
              {label}
            </Badge>
          </div>
          
          {item.type === 'Préstamo' && item.status === 'Préstamo Activo' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => openEditModal(item)} 
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4 text-blue-500"/>
            </Button>
          )}
        </div>

        {/* Información del estudiante y herramienta */}
        <div className="space-y-2 text-sm mb-3">
          <button
            onClick={() => navigateToStudent(item.studentId, item.studentCode)}
            className="flex items-center gap-2 text-left w-full p-2 rounded hover:bg-white/60 transition-colors"
          >
            <User className="h-4 w-4 text-teal-600" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{item.studentName}</div>
              <div className="text-xs text-gray-500">#{item.studentCode}</div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </button>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Wrench className="h-4 w-4 text-teal-600" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{item.toolName}</div>
              <div className="text-xs text-gray-500">ID: {item.toolId}</div>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-2 text-xs">
          {item.loanDateTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Préstamo: {formatDate(item.loanDateTime)}</span>
            </div>
          )}
          
          {item.dueDateTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>Límite: {formatDate(item.dueDateTime)}</span>
            </div>
          )}
          
          {item.actualReturnDateTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-3 w-3" />
              <span>Devuelto: {formatDate(item.actualReturnDateTime)}</span>
            </div>
          )}
          
          {item.admin && (
            <div className="flex items-center gap-2 text-gray-600">
              <UserCog className="h-3 w-3" />
              <span>Admin: {item.admin}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-teal-700">Historial</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => loadHistory(pagination.currentPage)} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Filtros móviles */}
        {showFilters && (
          <div className="mt-4 space-y-3 pb-4 border-t border-gray-200 pt-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Tipos</SelectItem>
                <SelectItem value="préstamo">Préstamos</SelectItem>
                <SelectItem value="activos">Préstamos Activos</SelectItem>
                <SelectItem value="vencidos">Préstamos Vencidos</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar estudiante o herramienta..."
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
        {/* Header desktop */}
        <div className="hidden sm:flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
             <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-700">
           Historial Completo
          </h1>
        </div>
      </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Tipos</SelectItem>
                <SelectItem value="préstamo">Préstamos</SelectItem>
                <SelectItem value="activos">Préstamos Activos</SelectItem>
                <SelectItem value="vencidos">Préstamos Vencidos</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => loadHistory(pagination.currentPage)} 
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Filtro por entidad - Desktop */}
        <div className="hidden sm:block relative mb-6">
          <div className="flex items-center gap-2 absolute left-3 top-1/2 transform -translate-y-1/2">
            <User className="h-5 w-5 text-gray-400" />
            <Wrench className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Filtrar por Estudiante o Herramienta (ID/Nombre)..."
            className="pl-16 w-full"
            onChange={(e) => setEntityFilter(e.target.value)}
            value={entityFilter}
          />
        </div>

        {/* Estadísticas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.totalEntries || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Préstamos</p>
                  <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.totalLoans || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.activeLoans || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Vencidos</p>
                  <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.overdueLoans || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contenido principal */}
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-600">Cargando historial...</span>
              </div>
            </CardContent>
          </Card>
        ) : history.length > 0 ? (
          <>
            {/* Vista móvil - Tarjetas */}
            <div className="block lg:hidden space-y-4 mb-6">
              {history.map((item, index) => (
                <HistoryCard key={item.id || index} item={item} />
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <motion.div 
              className="hidden lg:block rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="hover:bg-gray-50">
                      <TableHead className="text-teal-600 px-3 py-3 whitespace-nowrap min-w-[150px]">Tipo</TableHead>
                      <TableHead className="text-teal-600 px-3 py-3 whitespace-nowrap min-w-[200px]">Entidad</TableHead>
                      <TableHead className="text-teal-600 px-3 py-3 hidden md:table-cell whitespace-nowrap min-w-[130px]">Hora Préstamo</TableHead>
                      <TableHead className="text-teal-600 px-3 py-3 whitespace-nowrap min-w-[170px]">Fecha Límite</TableHead>
                      <TableHead className="text-teal-600 px-3 py-3 hidden lg:table-cell whitespace-nowrap min-w-[170px]">Devolución Real</TableHead>
                      <TableHead className="text-teal-600 px-3 py-3 hidden xl:table-cell whitespace-nowrap min-w-[150px]">Admin</TableHead>
                      <TableHead className="text-teal-600 px-3 py-3 text-right whitespace-nowrap">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item, index) => {
                      const { icon, color, label } = getTypeAttributes(item);
                      
                      return (
                        <TableRow key={item.id || index} className="hover:bg-gray-50 transition-colors">
                          <TableCell className={`${color} font-semibold flex items-center px-3 py-3 whitespace-nowrap`}>
                            {icon}
                            <span className="ml-2">{label}</span>
                          </TableCell>
                          <TableCell className="text-gray-900 px-3 py-3 whitespace-nowrap max-w-[200px]">
                            {item.studentName && (
                              <button
                                onClick={() => navigateToStudent(item.studentId, item.studentCode)}
                                className="hover:underline flex items-center text-sm truncate text-blue-500 hover:text-blue-400 transition-colors"
                                title={`Ver perfil de ${item.studentName}`}
                              >
                                <User className="inline h-3 w-3 mr-1 flex-shrink-0"/>
                                {item.studentName}
                                <ExternalLink className="inline h-3 w-3 ml-1 flex-shrink-0" />
                              </button>
                            )}
                            <div className="text-xs text-gray-600 flex items-center truncate" title={`${item.toolName} (${item.toolId})`}>
                              <Wrench className="inline h-3 w-3 mr-1 text-teal-600 flex-shrink-0"/>
                              {item.toolName} ({item.toolId})
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 hidden md:table-cell px-3 py-3 whitespace-nowrap">
                            <Clock className="inline h-4 w-4 mr-1"/>
                            {item.loanDateTime ? new Date(item.loanDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-600 px-3 py-3 whitespace-nowrap">
                            {item.dueDateTime ? (
                              <>
                                <CalendarDays className="inline h-4 w-4 mr-1"/>
                                {new Date(item.dueDateTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-600 hidden lg:table-cell px-3 py-3 whitespace-nowrap">
                            {item.actualReturnDateTime ? (
                              <>
                                <CalendarDays className="inline h-4 w-4 mr-1"/>
                                {new Date(item.actualReturnDateTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </>
                            ) : 'Pendiente'}
                          </TableCell>
                          <TableCell className="text-gray-600 hidden xl:table-cell px-3 py-3 whitespace-nowrap">
                            <UserCog className="inline h-4 w-4 mr-1"/>
                            {item.admin || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right px-3 py-3 whitespace-nowrap">
                            {item.type === 'Préstamo' && item.status === 'Préstamo Activo' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => openEditModal(item)} 
                                title="Editar Fecha Límite" 
                                className="h-7 w-7"
                              >
                                <Edit2 className="h-4 w-4 text-blue-500"/>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </motion.div>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalEntries)} de{' '}
                {pagination.totalEntries} registros
              </div>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                
                <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-900">
                    {pagination.currentPage} de {pagination.totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No hay registros disponibles
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  {(searchTerm || filterType !== 'todos' || entityFilter) 
                    ? 'No se encontraron registros que coincidan con los filtros aplicados.' 
                    : 'Aún no hay historial de préstamos y devoluciones.'}
                </p>
                <Button onClick={() => loadHistory(pagination.currentPage)} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de edición de fecha límite */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="w-[95vw] max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-teal-700">Editar Fecha Límite</DialogTitle>
              <DialogDescription className="text-sm">
                Ajusta la fecha y hora límite para el préstamo de: <span className="font-semibold">{editingEntry?.toolName}</span> para <span className="font-semibold">{editingEntry?.studentName}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newDueDate" className="text-sm font-medium text-gray-700">Nueva Fecha</Label>
                <Input 
                  id="newDueDate" 
                  type="date" 
                  value={newDueDate} 
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newDueTime" className="text-sm font-medium text-gray-700">Nueva Hora</Label>
                <Input 
                  id="newDueTime" 
                  type="time" 
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editReason" className="text-sm font-medium text-gray-700">Razón (opcional)</Label>
                <Input
                  id="editReason"
                  placeholder="Ej: Extensión por proyecto especial"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)} 
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveDueDate}
                disabled={isUpdating || !newDueDate || !newDueTime}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HistoryPage;