// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Fingerprint, ScanLine, CheckCircle, AlertCircle, Clock, UserCircle, Package, Loader2, RefreshCw } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { useToast } from '@/components/ui/use-toast';
// import { useAuth } from '@/contexts/AuthContext';

// const ReturnProcessPage = () => {
//   // Estados para la búsqueda de estudiante
//   const [studentSearchId, setStudentSearchId] = useState('');
//   const [searchType, setSearchType] = useState('studentId'); // 'studentId' o 'fingerprint'
//   const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  
//   // Estados para el estudiante encontrado
//   const [studentInfo, setStudentInfo] = useState(null);
//   const [activeLoans, setActiveLoans] = useState([]);
  
//   // Estados para el escaneo de herramientas
//   const [scannedToolId, setScannedToolId] = useState('');
//   const [isScanningTool, setIsScanningTool] = useState(false);
//   const [verifiedTools, setVerifiedTools] = useState({}); // { toolId: { verified: true, loanId, quantity } }
  
//   // Estados generales
//   const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  
//   const { toast } = useToast();
//   const { apiRequest, user } = useAuth();

//   // Limpiar formulario
//   const clearForm = () => {
//     setStudentSearchId('');
//     setStudentInfo(null);
//     setActiveLoans([]);
//     setScannedToolId('');
//     setVerifiedTools({});
//   };

//   // Buscar estudiante (por matrícula o huella)
//   const handleStudentSearch = async () => {
//     if (!studentSearchId.trim()) {
//       toast({
//         title: "Entrada Vacía",
//         description: "Por favor ingrese un ID de estudiante o matrícula",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsSearchingStudent(true);
//     const searchValue = studentSearchId.trim();
    
//     try {
//       let endpoint = '';
//       let description = '';

//       if (searchType === 'fingerprint') {
//         endpoint = `/returns/student/fingerprint/${encodeURIComponent(searchValue)}`;
//         description = "Verificando huella dactilar...";
//       } else {
//         endpoint = `/returns/student/${encodeURIComponent(searchValue)}/active-loans`;
//         description = `Buscando matrícula: ${searchValue}`;
//       }

//       toast({ 
//         title: searchType === 'fingerprint' ? "Verificando Huella..." : "Buscando Estudiante...", 
//         description 
//       });

//       console.log(`Searching student with endpoint: ${endpoint}`);

//       const response = await apiRequest(endpoint);
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log('Student data received:', data);

//         if (data.studentInfo.status === 'Bloqueado') {
//           toast({
//             title: "Estudiante Bloqueado",
//             description: `${data.studentInfo.name} está bloqueado y no puede procesar devoluciones. ${data.studentInfo.blockReason ? 'Motivo: ' + data.studentInfo.blockReason : ''}`,
//             variant: "destructive"
//           });
//           setStudentInfo(null);
//           setActiveLoans([]);
//           return;
//         }

//         setStudentInfo(data.studentInfo);
//         setActiveLoans(data.activeLoans || []);
        
//         toast({
//           title: searchType === 'fingerprint' ? "¡Huella Verificada!" : "¡Estudiante Encontrado!",
//           description: `${data.studentInfo.name} tiene ${data.activeLoans?.length || 0} préstamo(s) activo(s)`
//         });

//         if ((data.activeLoans || []).length === 0) {
//           toast({
//             title: "Sin Préstamos Activos",
//             description: "Este estudiante no tiene herramientas pendientes de devolución",
//             variant: "default"
//           });
//         }
//       } else {
//         const errorData = await response.json();
//         console.error('Error response:', errorData);
        
//         toast({
//           title: "Estudiante No Encontrado",
//           description: errorData.message || `No se encontró estudiante con ${searchType === 'fingerprint' ? 'huella/ID' : 'matrícula'}: '${searchValue}'`,
//           variant: "destructive"
//         });
//         setStudentInfo(null);
//         setActiveLoans([]);
//       }

//     } catch (error) {
//       console.error('Error searching student:', error);
//       toast({
//         title: "Error de Conexión",
//         description: "No se pudo conectar con el servidor. Verifique su conexión.",
//         variant: "destructive"
//       });
//       setStudentInfo(null);
//       setActiveLoans([]);
//     } finally {
//       setIsSearchingStudent(false);
//       setStudentSearchId('');
//     }
//   };

//   // Verificar herramienta escaneada
//   const handleToolScan = async () => {
//     if (!scannedToolId.trim()) {
//       toast({
//         title: "Entrada Vacía",
//         description: "Por favor ingrese el ID de la herramienta a devolver",
//         variant: "destructive"
//       });
//       return;
//     }

//     if (!studentInfo || activeLoans.length === 0) {
//       toast({
//         title: "Error",
//         description: "Primero debe buscar un estudiante con préstamos activos",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsScanningTool(true);
//     const toolCode = scannedToolId.trim();

//     try {
//       toast({
//         title: "Verificando Herramienta...",
//         description: `Escaneando: ${toolCode}`
//       });

//       // Buscar en qué préstamo está la herramienta
//       let foundInLoan = null;
//       let toolInLoan = null;

//       console.log('Searching for tool:', toolCode, 'in active loans:', activeLoans);

//       for (const loan of activeLoans) {
//         console.log('Checking loan:', loan.id, 'with tools:', loan.tools);
        
//         toolInLoan = loan.tools.find(tool => {
//           console.log('Comparing with tool:', tool);
//           return tool.toolCode === toolCode || 
//                  tool.toolId === toolCode ||
//                  tool.toolName.toLowerCase().includes(toolCode.toLowerCase());
//         });
        
//         if (toolInLoan) {
//           foundInLoan = loan;
//           console.log('Found tool in loan:', foundInLoan.id, 'Tool:', toolInLoan);
//           break;
//         }
//       }

//       if (!foundInLoan || !toolInLoan) {
//         toast({
//           title: "Herramienta No Encontrada",
//           description: `La herramienta '${toolCode}' no está en los préstamos activos de ${studentInfo.name}`,
//           variant: "destructive"
//         });
//         setScannedToolId('');
//         return;
//       }

//       // Verificar si ya fue marcada como verificada
//       const toolKey = toolInLoan.toolId || toolInLoan.toolCode || `${foundInLoan.id}-${toolCode}`;
      
//       if (verifiedTools[toolKey]) {
//         toast({
//           title: "Ya Verificada",
//           description: `${toolInLoan.toolName} ya fue marcada para devolución`,
//           variant: "default"
//         });
//         setScannedToolId('');
//         return;
//       }

//       // Verificar con el backend
//       const verifyResponse = await apiRequest(
//         `/returns/verify-tool/${encodeURIComponent(toolCode)}/student/${encodeURIComponent(studentInfo.studentId)}/loan/${foundInLoan.id}`
//       );

//       if (verifyResponse.ok) {
//         const verifyData = await verifyResponse.json();
//         console.log('Tool verification result:', verifyData);

//         // Obtener el ID correcto de la herramienta
//         const correctToolId = toolInLoan.toolId || toolInLoan.toolCode || verifyData.tool?.id || foundInLoan.id;
        
//         console.log('Storing verified tool with key:', toolKey, 'Tool data:', toolInLoan);

//         // Marcar herramienta como verificada
//         setVerifiedTools(prev => ({
//           ...prev,
//           [toolKey]: {
//             verified: true,
//             loanId: foundInLoan.id,
//             quantity: toolInLoan.quantityBorrowed,
//             toolName: toolInLoan.toolName,
//             toolCode: toolInLoan.toolCode,
//             toolId: correctToolId, // Asegurar que tenemos el ID correcto
//             condition: 'Bueno' // Valor por defecto
//           }
//         }));

//         toast({
//           title: "¡Herramienta Verificada!",
//           description: `${toolInLoan.toolName} lista para devolución`,
//           variant: "default"
//         });
//       } else {
//         const errorData = await verifyResponse.json();
//         toast({
//           title: "Error de Verificación",
//           description: errorData.message || "No se pudo verificar la herramienta",
//           variant: "destructive"
//         });
//       }

//     } catch (error) {
//       console.error('Error verifying tool:', error);
//       toast({
//         title: "Error de Conexión",
//         description: "No se pudo verificar la herramienta. Intente nuevamente.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsScanningTool(false);
//       setScannedToolId('');
//     }
//   };

//   // Remover herramienta verificada
//   const removeVerifiedTool = (toolId) => {
//     setVerifiedTools(prev => {
//       const updated = { ...prev };
//       delete updated[toolId];
//       return updated;
//     });
    
//     const tool = Object.values(verifiedTools).find(t => t.toolId === toolId);
//     toast({
//       title: "Herramienta Removida",
//       description: `${tool?.toolName || 'Herramienta'} removida de la lista de devolución`
//     });
//   };

//   // Cambiar condición de herramienta
//   const updateToolCondition = (toolId, condition) => {
//     setVerifiedTools(prev => ({
//       ...prev,
//       [toolId]: {
//         ...prev[toolId],
//         condition
//       }
//     }));
//   };

//   // Procesar devolución completa
//   const processCompleteReturn = async () => {
//     if (!studentInfo) {
//       toast({
//         title: "Error",
//         description: "No hay estudiante seleccionado",
//         variant: "destructive"
//       });
//       return;
//     }

//     const verifiedToolsList = Object.values(verifiedTools);
//     if (verifiedToolsList.length === 0) {
//       toast({
//         title: "Sin Herramientas",
//         description: "No hay herramientas verificadas para devolver",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsProcessingReturn(true);

//     try {
//       // Agrupar herramientas por préstamo
//       const loanGroups = {};
//       verifiedToolsList.forEach(tool => {
//         if (!loanGroups[tool.loanId]) {
//           loanGroups[tool.loanId] = [];
//         }
        
//         // Asegurar que tenemos un toolId válido antes de agregarlo
//         const toolId = tool.toolId || tool.id || tool._id;
//         if (!toolId) {
//           console.error('Tool missing ID in verified tools:', tool);
//           toast({
//             title: "Error de Validación",
//             description: `Herramienta ${tool.toolName || 'desconocida'} no tiene ID válido`,
//             variant: "destructive"
//           });
//           return;
//         }
        
//         loanGroups[tool.loanId].push({
//           toolId: toolId,
//           quantity: tool.quantity || 1,
//           condition: tool.condition || 'Bueno'
//         });
//       });

//       let allProcessed = true;
//       let processedCount = 0;
//       const results = [];

//       // Procesar cada préstamo
//       for (const [loanId, toolsInLoan] of Object.entries(loanGroups)) {
//         try {
//           // Verificar que todos los toolsInLoan tienen IDs válidos
//           const validatedTools = toolsInLoan.map(tool => {
//             console.log('Processing tool for return:', tool);
            
//             // Asegurar que tenemos un toolId válido
//             const toolId = tool.toolId || tool.id || tool._id;
//             if (!toolId) {
//               console.error('Tool missing ID:', tool);
//               throw new Error(`Herramienta sin ID válido: ${JSON.stringify(tool)}`);
//             }
            
//             return {
//               toolId: toolId,
//               quantity: tool.quantity || 1,
//               condition: tool.condition || 'Bueno'
//             };
//           });

//           const returnData = {
//             studentCode: studentInfo.studentId,
//             loanId: loanId,
//             toolsToReturn: validatedTools,
//             notes: '', // Sin notas
//             supervisorId: user?._id || user?.id
//           };

//           console.log('Processing return for loan:', loanId, 'Return data:', returnData);

//           const response = await apiRequest('/returns/process', {
//             method: 'POST',
//             body: JSON.stringify(returnData)
//           });

//           if (response.ok) {
//             const result = await response.json();
//             results.push(result);
//             processedCount += validatedTools.length;
//             console.log('Return processed successfully:', result);
//           } else {
//             const errorData = await response.json();
//             console.error('Error processing return:', errorData);
//             allProcessed = false;
            
//             toast({
//               title: "Error en Devolución",
//               description: errorData.message || `Error procesando préstamo ${loanId}`,
//               variant: "destructive"
//             });
//           }
//         } catch (error) {
//           console.error('Error processing loan return:', error);
//           allProcessed = false;
          
//           toast({
//             title: "Error de Validación",
//             description: error.message || "Error validando herramientas para devolución",
//             variant: "destructive"
//           });
//         }
//       }

//       // Mostrar resultado final
//       if (allProcessed && results.length > 0) {
//         const totalToolsReturned = results.reduce((sum, result) => 
//           sum + (result.summary?.totalQuantity || 0), 0
//         );
        
//         const hasLateReturns = results.some(result => result.isLateReturn);
        
//         toast({
//           title: "¡Devolución Completada!",
//           description: `${totalToolsReturned} herramienta(s) devuelta(s) por ${studentInfo.name}. ${hasLateReturns ? 'Algunas devoluciones fueron tardías.' : 'Todas las devoluciones fueron a tiempo.'}`,
//           duration: 8000
//         });

//         // Actualizar la lista de préstamos activos después de la devolución
//         await refreshActiveLoans();
        
//         // Limpiar herramientas verificadas
//         setVerifiedTools({});
//       } else if (processedCount > 0) {
//         toast({
//           title: "Devolución Parcial",
//           description: `${processedCount} herramienta(s) procesada(s). Algunas tuvieron errores.`,
//           variant: "default",
//           duration: 7000
//         });
        
//         // Actualizar préstamos activos para reflejar cambios parciales
//         await refreshActiveLoans();
//       }

//     } catch (error) {
//       console.error('Error in return process:', error);
//       toast({
//         title: "Error General",
//         description: "Hubo un problema procesando la devolución. Intente nuevamente.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsProcessingReturn(false);
//     }
//   };

//   // Actualizar préstamos activos
//   const refreshActiveLoans = async () => {
//     if (!studentInfo) return;

//     try {
//       console.log('Refreshing active loans for student:', studentInfo.studentId);
      
//       const response = await apiRequest(`/returns/student/${studentInfo.studentId}/active-loans`);
//       if (response.ok) {
//         const data = await response.json();
//         console.log('Updated loans data:', data);
        
//         setActiveLoans(data.activeLoans || []);
        
//         // Limpiar herramientas verificadas que ya no están en préstamos activos
//         const remainingToolIds = new Set();
//         (data.activeLoans || []).forEach(loan => {
//           loan.tools.forEach(tool => {
//             remainingToolIds.add(tool.toolId);
//           });
//         });
        
//         setVerifiedTools(prev => {
//           const updated = {};
//           Object.keys(prev).forEach(toolId => {
//             if (remainingToolIds.has(toolId)) {
//               updated[toolId] = prev[toolId];
//             }
//           });
//           return updated;
//         });
        
//         toast({
//           title: "Préstamos Actualizados",
//           description: `${data.activeLoans?.length || 0} préstamo(s) activo(s) restante(s)`
//         });
//       }
//     } catch (error) {
//       console.error('Error refreshing loans:', error);
//       toast({
//         title: "Error",
//         description: "No se pudieron actualizar los préstamos activos",
//         variant: "destructive"
//       });
//     }
//   };

//   // Determinar si un préstamo está vencido
//   const isLoanOverdue = (estimatedReturnDate) => {
//     return new Date(estimatedReturnDate) < new Date();
//   };

//   // Mostrar loading si no hay usuario autenticado
//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin" />
//         <span className="ml-2">Verificando autenticación...</span>
//       </div>
//     );
//   }

//   return (
//     <motion.div 
//       className="space-y-6 max-w-6xl mx-auto"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       <div className="bg-white border-b border-gray-200 flex-shrink-0">
//         <div className="px-4 py-4 sm:px-6 lg:px-8">
//           <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-700">
//             Devolución de Herramientas
//           </h1>
//         </div>
//       </div>

//       {/* Sección de búsqueda de estudiante */}
//       <Card className="bg-card shadow-lg">
//         <CardHeader>
//           <CardTitle className="text-xl text-primary flex items-center">
//             <UserCircle className="mr-2 h-6 w-6" /> Buscar Estudiante
//           </CardTitle>
//           <CardDescription>Busque al estudiante por matrícula o huella dactilar para ver sus préstamos activos.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <Label className="text-custom-gold">Tipo de Búsqueda</Label>
//               <Select value={searchType} onValueChange={setSearchType}>
//                 <SelectTrigger className="bg-input border-custom-gold/30">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="studentId">
//                     <div className="flex items-center">
//                       <UserCircle className="mr-2 h-4 w-4" />
//                       Por Matrícula
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="fingerprint">
//                     <div className="flex items-center">
//                       <Fingerprint className="mr-2 h-4 w-4" />
//                       Por Huella Dactilar
//                     </div>
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="md:col-span-2">
//               <Label htmlFor="student-search" className="text-custom-gold">
//                 {searchType === 'fingerprint' ? 'ID para Simular Huella' : 'Matrícula del Estudiante'}
//               </Label>
//               <div className="flex items-end gap-2">
//                 <Input 
//                   id="student-search" 
//                   placeholder={searchType === 'fingerprint' ? "Ingrese ID para simular huella" : "Ingrese matrícula del estudiante"} 
//                   value={studentSearchId}
//                   onChange={(e) => setStudentSearchId(e.target.value)}
//                   className="bg-input border-custom-gold/30 focus:border-custom-gold" 
//                   onKeyPress={(e) => e.key === 'Enter' && handleStudentSearch()}
//                 />
//                 <Button onClick={handleStudentSearch} disabled={isSearchingStudent} className="min-w-[150px]">
//                   {searchType === 'fingerprint' ? (
//                     <Fingerprint className={`mr-2 h-5 w-5 ${isSearchingStudent ? 'animate-ping' : ''}`} />
//                   ) : (
//                     <UserCircle className={`mr-2 h-5 w-5 ${isSearchingStudent ? 'animate-ping' : ''}`} />
//                   )}
//                   {isSearchingStudent ? 'Buscando...' : (searchType === 'fingerprint' ? 'Verificar' : 'Buscar')}
//                 </Button>
//               </div>
//             </div>
//           </div>
          
//           {studentInfo && (
//             <motion.div 
//               initial={{ opacity: 0, height: 0 }} 
//               animate={{ opacity: 1, height: "auto" }} 
//               transition={{ duration: 0.3}}
//               className="p-4 border border-primary/30 rounded-md bg-primary/5"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="font-semibold text-lg text-foreground">{studentInfo.name}</p>
//                   <p className="text-sm text-muted-foreground">Matrícula: {studentInfo.studentId} | {studentInfo.career}</p>
//                   <p className="text-sm text-custom-teal">Préstamos Activos: {activeLoans.length}</p>
//                 </div>
//                 <Button variant="outline" size="sm" onClick={refreshActiveLoans}>
//                   <RefreshCw className="h-4 w-4 mr-2" />
//                   Actualizar
//                 </Button>
//               </div>
//             </motion.div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Sección de escaneo de herramientas */}
//       {studentInfo && activeLoans.length > 0 && (
//         <Card className="bg-card shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-xl text-primary flex items-center">
//               <ScanLine className="mr-2 h-6 w-6" /> Escanear Herramientas a Devolver
//             </CardTitle>
//             <CardDescription>Escanee o ingrese el ID de cada herramienta que está siendo devuelta.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-end gap-2">
//               <div className="flex-grow">
//                 <Label htmlFor="tool-scan" className="text-custom-gold">ID o Código de Herramienta</Label>
//                 <Input 
//                   id="tool-scan" 
//                   placeholder="Ingrese ID o código de la herramienta a devolver" 
//                   value={scannedToolId}
//                   onChange={(e) => setScannedToolId(e.target.value)}
//                   className="bg-input border-custom-gold/30 focus:border-custom-gold" 
//                   onKeyPress={(e) => e.key === 'Enter' && handleToolScan()}
//                 />
//               </div>
//               <Button onClick={handleToolScan} disabled={isScanningTool} className="min-w-[150px]">
//                 <ScanLine className={`mr-2 h-5 w-5 ${isScanningTool ? 'animate-ping' : ''}`} />
//                 {isScanningTool ? 'Verificando...' : 'Verificar'}
//               </Button>
//             </div>

//             {/* Lista de herramientas verificadas */}
//             {Object.keys(verifiedTools).length > 0 && (
//               <div className="mt-4 p-4 border border-green-500/30 rounded-lg bg-green-500/5">
//                 <h4 className="font-semibold text-green-700 mb-3 flex items-center">
//                   <CheckCircle className="mr-2 h-5 w-5" />
//                   Herramientas Verificadas para Devolución ({Object.keys(verifiedTools).length})
//                 </h4>
//                 <div className="space-y-2">
//                   {Object.entries(verifiedTools).map(([toolId, tool]) => (
//                     <div key={toolId} className="flex items-center justify-between p-2 bg-background rounded border">
//                       <div className="flex-grow">
//                         <span className="font-medium">{tool.toolName}</span>
//                         <span className="text-sm text-muted-foreground ml-2">({tool.toolCode})</span>
//                         <span className="text-sm text-muted-foreground ml-2">- Cant: {tool.quantity}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Select value={tool.condition} onValueChange={(value) => updateToolCondition(toolId, value)}>
//                           <SelectTrigger className="w-32">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Excelente">Excelente</SelectItem>
//                             <SelectItem value="Bueno">Bueno</SelectItem>
//                             <SelectItem value="Regular">Regular</SelectItem>
//                             <SelectItem value="Dañado">Dañado</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <Button 
//                           variant="ghost" 
//                           size="sm" 
//                           onClick={() => removeVerifiedTool(toolId)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           Remover
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {/* Tabla de préstamos activos */}
//       {studentInfo && (
//         <Card className="bg-card shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-xl text-primary flex items-center">
//               <Package className="mr-2 h-6 w-6" /> Préstamos Activos de {studentInfo.name}
//             </CardTitle>
//             <CardDescription>Herramientas pendientes de devolución.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {activeLoans.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="text-custom-gold">Herramienta</TableHead>
//                       <TableHead className="text-custom-gold">Código</TableHead>
//                       <TableHead className="text-custom-gold">Cantidad</TableHead>
//                       <TableHead className="text-custom-gold">Fecha Límite</TableHead>
//                       <TableHead className="text-custom-gold text-center">Estado</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {activeLoans.flatMap(loan => 
//                       loan.tools.map(tool => {
//                         const isOverdue = isLoanOverdue(loan.estimatedReturnDate);
//                         const isVerified = verifiedTools[tool.toolId];
                        
//                         return (
//                           <TableRow 
//                             key={`${loan.id}-${tool.toolId}`} 
//                             className={`${isVerified ? 'bg-green-500/10' : ''} ${isOverdue && !isVerified ? 'bg-red-500/10' : ''}`}
//                           >
//                             <TableCell className="font-medium text-foreground">{tool.toolName}</TableCell>
//                             <TableCell className="text-muted-foreground">{tool.toolCode}</TableCell>
//                             <TableCell className="text-muted-foreground">{tool.quantityBorrowed}</TableCell>
//                             <TableCell className={`text-muted-foreground ${isOverdue && !isVerified ? 'text-red-500 font-semibold' : ''}`}>
//                               <Clock className={`inline h-4 w-4 mr-1 ${isOverdue && !isVerified ? 'text-red-500' : 'text-muted-foreground'}`} />
//                               {new Date(loan.estimatedReturnDate).toLocaleString('es-ES')}
//                             </TableCell>
//                             <TableCell className="text-center">
//                               {isVerified ? (
//                                 <span className="flex items-center justify-center text-green-500">
//                                   <CheckCircle className="mr-1 h-5 w-5" /> Verificada
//                                 </span>
//                               ) : isOverdue ? (
//                                 <span className="flex items-center justify-center text-red-500">
//                                   <AlertCircle className="mr-1 h-5 w-5" /> Vencido
//                                 </span>
//                               ) : (
//                                 <span className="text-yellow-500">Pendiente</span>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         );
//                       })
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             ) : studentInfo ? (
//               <div className="text-center py-8">
//                 <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
//                 <p className="text-muted-foreground text-lg">Este estudiante no tiene préstamos activos</p>
//                 <p className="text-muted-foreground text-sm mt-2">No hay herramientas pendientes de devolución</p>
//               </div>
//             ) : null}
//           </CardContent>
//         </Card>
//       )}

//       {/* Botón de finalizar devolución */}
//       {studentInfo && Object.keys(verifiedTools).length > 0 && (
//         <Card className="bg-card shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-xl text-primary">Finalizar Devolución</CardTitle>
//             <CardDescription>Procesar la devolución de las herramientas verificadas.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex justify-end gap-4">
//               <Button variant="outline" onClick={clearForm}>
//                 Cancelar Todo
//               </Button>
//               <Button 
//                 onClick={processCompleteReturn} 
//                 disabled={isProcessingReturn}
//                 className="min-w-[200px]"
//               >
//                 {isProcessingReturn ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Procesando Devolución...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle className="mr-2 h-4 w-4" />
//                     Completar Devolución
//                   </>
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Estado inicial */}
//       {!studentInfo && (
//         <div className="text-center py-10">
//           <UserCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
//           <p className="text-muted-foreground text-lg">Busque un estudiante para iniciar el proceso de devolución</p>
//           <p className="text-muted-foreground text-sm mt-2">Use la matrícula o huella dactilar para encontrar sus préstamos activos</p>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default ReturnProcessPage;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fingerprint, ScanLine, CheckCircle, AlertCircle, Clock, UserCircle, Package, Loader2, RefreshCw, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ReturnProcessPage = () => {
  // Estados para la búsqueda de estudiante
  const [studentSearchId, setStudentSearchId] = useState('');
  const [searchType, setSearchType] = useState('studentId'); // 'studentId', 'fingerprint', 'fingerprint_physical'
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  
  // Estados para el estudiante encontrado
  const [studentInfo, setStudentInfo] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);
  
  // Estados para el escaneo de herramientas
  const [scannedToolId, setScannedToolId] = useState('');
  const [isScanningTool, setIsScanningTool] = useState(false);
  const [verifiedTools, setVerifiedTools] = useState({}); // { toolId: { verified: true, loanId, quantity } }
  
  // Estados generales
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

  // Estados ESP32 agregados
  const [espConnected, setEspConnected] = useState(false);
  const [fingerprintMode, setFingerprintMode] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);

  const ESP32_IP = 'http://192.168.100.30'; // Cambiar por tu IP real

  const { toast } = useToast();
  const { apiRequest, user } = useAuth();

  // useEffect para manejar ESP32 y limpieza
  useEffect(() => {
    if (user) {
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
    return () => {
      stopPolling();
    };
  }, [pollInterval]);

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
      setIsSearchingStudent(true);
      
      toast({
        title: "Huella Detectada",
        description: `Confianza: ${data.confidence}% - Verificando identidad...`,
        variant: "default"
      });
      
      try {
        // Buscar estudiante por ID de huella usando el endpoint de returns
        const foundStudent = await searchStudentByFingerprint(data.fingerprintId);
        
        setTimeout(() => {
          if (foundStudent && foundStudent.status !== 'Bloqueado') {
            setStudentInfo(foundStudent.studentInfo);
            setActiveLoans(foundStudent.activeLoans || []);
            
            toast({
              title: "Acceso Autorizado",
              description: `Bienvenido ${foundStudent.studentInfo.name} - ${foundStudent.activeLoans?.length || 0} préstamo(s) activo(s)`,
              variant: "default",
              duration: 5000
            });
            
            console.log('Estudiante identificado por huella:', foundStudent);
          } else if (foundStudent && foundStudent.studentInfo.status === 'Bloqueado') {
            toast({
              title: "Acceso Denegado",
              description: `Estudiante bloqueado: ${foundStudent.studentInfo.blockReason || 'Sin razón especificada'}`,
              variant: "destructive",
              duration: 4000
            });
            setStudentInfo(null);
            setActiveLoans([]);
          } else {
            toast({
              title: "Acceso Denegado",
              description: "Estudiante no encontrado en base de datos",
              variant: "destructive",
              duration: 4000
            });
            setStudentInfo(null);
            setActiveLoans([]);
          }
          setIsSearchingStudent(false);
        }, 1500);
        
      } catch (error) {
        console.error('Error verificando huella:', error);
        setIsSearchingStudent(false);
        
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

  // const searchStudentByFingerprint = async (fingerprintId) => {
  //   try {
  //     console.log('Buscando estudiante por huella ID:', fingerprintId);
      
  //     // Usar el endpoint de returns que devuelve tanto studentInfo como activeLoans
  //     const response = await apiRequest(`/returns/student/fingerprint/${fingerprintId}`);
      
  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.studentInfo) {
  //         return data; // Devolver todo el objeto que incluye studentInfo y activeLoans
  //       } else {
  //         console.log('No se encontró estudiante para la huella:', fingerprintId);
  //         return null;
  //       }
  //     } else {
  //       console.error('Error en respuesta del servidor:', response.status);
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('Error buscando estudiante por huella:', error);
  //     return null;
  //   }
  // };









  // Limpiar formulario
  // En ReturnProcessPage.jsx, actualiza la función searchStudentByFingerprint:

const searchStudentByFingerprint = async (fingerprintId) => {
  try {
    console.log('Buscando estudiante por huella ID:', fingerprintId);
    
    // USAR EL MISMO ENDPOINT QUE NEWLOANPAGE
    const response = await apiRequest(`/fingerprint/student/${fingerprintId}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.student) {
        // Mapear el estudiante al formato esperado
        const mappedStudent = {
          id: data.student._id,
          studentId: data.student.student_id,
          name: data.student.full_name,
          email: data.student.email,
          status: data.student.blocked ? 'Bloqueado' : 'Activo',
          career: data.student.career || '',
          cuatrimestre: data.student.semester || 1,
          group: data.student.group || '',
          phone: data.student.phone || '',
          avatar: data.student.avatar || 'https://images.unsplash.com/photo-1698431048673-53ed1765ea07',
          fingerprintId: data.student.fingerprint_id ? 'Registrada' : 'No registrada',
          blockReason: data.student.block_reason || ''
        };

        // Ahora buscar los préstamos activos usando el endpoint que ya funciona
        const loansResponse = await apiRequest(`/returns/student/${data.student.student_id}/active-loans`);
        
        if (loansResponse.ok) {
          const loansData = await loansResponse.json();
          return {
            studentInfo: mappedStudent,
            activeLoans: loansData.activeLoans || []
          };
        } else {
          // Si no se pueden obtener los préstamos, devolver solo info del estudiante
          return {
            studentInfo: mappedStudent,
            activeLoans: []
          };
        }
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
  
  const clearForm = () => {
    setStudentSearchId('');
    setStudentInfo(null);
    setActiveLoans([]);
    setScannedToolId('');
    setVerifiedTools({});
    // Detener modo de huella si está activo
    if (fingerprintMode) {
      stopFingerprintMode();
    }
  };

  // Buscar estudiante (por matrícula o huella)
  const handleStudentSearch = async () => {
    if (!studentSearchId.trim() && searchType !== 'fingerprint_physical') {
      toast({
        title: "Entrada Vacía",
        description: "Por favor ingrese un ID de estudiante o active el sensor físico",
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

    setIsSearchingStudent(true);
    const searchValue = studentSearchId.trim();
    
    try {
      let endpoint = '';
      let description = '';

      if (searchType === 'fingerprint') {
        // Buscar por ID de huella simulada
        try {
          const fingerprintResult = await searchStudentByFingerprint(searchValue);
          
          setTimeout(() => {
            if (fingerprintResult) {
              if (fingerprintResult.studentInfo.status === 'Bloqueado') {
                toast({
                  title: "Estudiante Bloqueado",
                  description: `${fingerprintResult.studentInfo.name} está bloqueado. ${fingerprintResult.studentInfo.blockReason ? 'Motivo: ' + fingerprintResult.studentInfo.blockReason : ''}`,
                  variant: "destructive"
                });
                setStudentInfo(null);
                setActiveLoans([]);
              } else {
                setStudentInfo(fingerprintResult.studentInfo);
                setActiveLoans(fingerprintResult.activeLoans || []);
                
                toast({
                  title: "¡Huella Verificada!",
                  description: `${fingerprintResult.studentInfo.name} tiene ${fingerprintResult.activeLoans?.length || 0} préstamo(s) activo(s)`
                });
              }
            } else {
              toast({
                title: "Huella No Encontrada",
                description: `No se encontró estudiante con ID de huella: '${searchValue}'`,
                variant: "destructive"
              });
              setStudentInfo(null);
              setActiveLoans([]);
            }
            setIsSearchingStudent(false);
            setStudentSearchId('');
          }, 2000);
          
          return;
        } catch (error) {
          console.error('Error en búsqueda por huella:', error);
          // Continuar con búsqueda normal si falla la huella
        }
      }

      // Búsqueda normal por matrícula
      endpoint = `/returns/student/${encodeURIComponent(searchValue)}/active-loans`;
      description = `Buscando matrícula: ${searchValue}`;

      toast({ 
        title: "Buscando Estudiante...", 
        description 
      });

      console.log(`Searching student with endpoint: ${endpoint}`);

      const response = await apiRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student data received:', data);

        if (data.studentInfo.status === 'Bloqueado') {
          toast({
            title: "Estudiante Bloqueado",
            description: `${data.studentInfo.name} está bloqueado y no puede procesar devoluciones. ${data.studentInfo.blockReason ? 'Motivo: ' + data.studentInfo.blockReason : ''}`,
            variant: "destructive"
          });
          setStudentInfo(null);
          setActiveLoans([]);
          return;
        }

        setStudentInfo(data.studentInfo);
        setActiveLoans(data.activeLoans || []);
        
        toast({
          title: "¡Estudiante Encontrado!",
          description: `${data.studentInfo.name} tiene ${data.activeLoans?.length || 0} préstamo(s) activo(s)`
        });

        if ((data.activeLoans || []).length === 0) {
          toast({
            title: "Sin Préstamos Activos",
            description: "Este estudiante no tiene herramientas pendientes de devolución",
            variant: "default"
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        
        toast({
          title: "Estudiante No Encontrado",
          description: errorData.message || `No se encontró estudiante con matrícula: '${searchValue}'`,
          variant: "destructive"
        });
        setStudentInfo(null);
        setActiveLoans([]);
      }

    } catch (error) {
      console.error('Error searching student:', error);
      toast({
        title: "Error de Conexión",
        description: "No se pudo conectar con el servidor. Verifique su conexión.",
        variant: "destructive"
      });
      setStudentInfo(null);
      setActiveLoans([]);
    } finally {
      setIsSearchingStudent(false);
      setStudentSearchId('');
    }
  };

  // Verificar herramienta escaneada
  const handleToolScan = async () => {
    if (!scannedToolId.trim()) {
      toast({
        title: "Entrada Vacía",
        description: "Por favor ingrese el ID de la herramienta a devolver",
        variant: "destructive"
      });
      return;
    }

    if (!studentInfo || activeLoans.length === 0) {
      toast({
        title: "Error",
        description: "Primero debe buscar un estudiante con préstamos activos",
        variant: "destructive"
      });
      return;
    }

    setIsScanningTool(true);
    const toolCode = scannedToolId.trim();

    try {
      toast({
        title: "Verificando Herramienta...",
        description: `Escaneando: ${toolCode}`
      });

      // Buscar en qué préstamo está la herramienta
      let foundInLoan = null;
      let toolInLoan = null;

      console.log('Searching for tool:', toolCode, 'in active loans:', activeLoans);

      for (const loan of activeLoans) {
        console.log('Checking loan:', loan.id, 'with tools:', loan.tools);
        
        toolInLoan = loan.tools.find(tool => {
          console.log('Comparing with tool:', tool);
          return tool.toolCode === toolCode || 
                 tool.toolId === toolCode ||
                 tool.toolName.toLowerCase().includes(toolCode.toLowerCase());
        });
        
        if (toolInLoan) {
          foundInLoan = loan;
          console.log('Found tool in loan:', foundInLoan.id, 'Tool:', toolInLoan);
          break;
        }
      }

      if (!foundInLoan || !toolInLoan) {
        toast({
          title: "Herramienta No Encontrada",
          description: `La herramienta '${toolCode}' no está en los préstamos activos de ${studentInfo.name}`,
          variant: "destructive"
        });
        setScannedToolId('');
        return;
      }

      // Verificar si ya fue marcada como verificada
      const toolKey = toolInLoan.toolId || toolInLoan.toolCode || `${foundInLoan.id}-${toolCode}`;
      
      if (verifiedTools[toolKey]) {
        toast({
          title: "Ya Verificada",
          description: `${toolInLoan.toolName} ya fue marcada para devolución`,
          variant: "default"
        });
        setScannedToolId('');
        return;
      }

      // Verificar con el backend
      const verifyResponse = await apiRequest(
        `/returns/verify-tool/${encodeURIComponent(toolCode)}/student/${encodeURIComponent(studentInfo.studentId)}/loan/${foundInLoan.id}`
      );

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('Tool verification result:', verifyData);

        // Obtener el ID correcto de la herramienta
        const correctToolId = toolInLoan.toolId || toolInLoan.toolCode || verifyData.tool?.id || foundInLoan.id;
        
        console.log('Storing verified tool with key:', toolKey, 'Tool data:', toolInLoan);

        // Marcar herramienta como verificada
        setVerifiedTools(prev => ({
          ...prev,
          [toolKey]: {
            verified: true,
            loanId: foundInLoan.id,
            quantity: toolInLoan.quantityBorrowed,
            toolName: toolInLoan.toolName,
            toolCode: toolInLoan.toolCode,
            toolId: correctToolId, // Asegurar que tenemos el ID correcto
            condition: 'Bueno' // Valor por defecto
          }
        }));

        toast({
          title: "¡Herramienta Verificada!",
          description: `${toolInLoan.toolName} lista para devolución`,
          variant: "default"
        });
      } else {
        const errorData = await verifyResponse.json();
        toast({
          title: "Error de Verificación",
          description: errorData.message || "No se pudo verificar la herramienta",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error verifying tool:', error);
      toast({
        title: "Error de Conexión",
        description: "No se pudo verificar la herramienta. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsScanningTool(false);
      setScannedToolId('');
    }
  };

  // Remover herramienta verificada
  const removeVerifiedTool = (toolId) => {
    setVerifiedTools(prev => {
      const updated = { ...prev };
      delete updated[toolId];
      return updated;
    });
    
    const tool = Object.values(verifiedTools).find(t => t.toolId === toolId);
    toast({
      title: "Herramienta Removida",
      description: `${tool?.toolName || 'Herramienta'} removida de la lista de devolución`
    });
  };

  // Cambiar condición de herramienta
  const updateToolCondition = (toolId, condition) => {
    setVerifiedTools(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        condition
      }
    }));
  };

  // Procesar devolución completa
  const processCompleteReturn = async () => {
    if (!studentInfo) {
      toast({
        title: "Error",
        description: "No hay estudiante seleccionado",
        variant: "destructive"
      });
      return;
    }

    const verifiedToolsList = Object.values(verifiedTools);
    if (verifiedToolsList.length === 0) {
      toast({
        title: "Sin Herramientas",
        description: "No hay herramientas verificadas para devolver",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingReturn(true);

    try {
      // Agrupar herramientas por préstamo
      const loanGroups = {};
      verifiedToolsList.forEach(tool => {
        if (!loanGroups[tool.loanId]) {
          loanGroups[tool.loanId] = [];
        }
        
        // Asegurar que tenemos un toolId válido antes de agregarlo
        const toolId = tool.toolId || tool.id || tool._id;
        if (!toolId) {
          console.error('Tool missing ID in verified tools:', tool);
          toast({
            title: "Error de Validación",
            description: `Herramienta ${tool.toolName || 'desconocida'} no tiene ID válido`,
            variant: "destructive"
          });
          return;
        }
        
        loanGroups[tool.loanId].push({
          toolId: toolId,
          quantity: tool.quantity || 1,
          condition: tool.condition || 'Bueno'
        });
      });

      let allProcessed = true;
      let processedCount = 0;
      const results = [];

      // Procesar cada préstamo
      for (const [loanId, toolsInLoan] of Object.entries(loanGroups)) {
        try {
          // Verificar que todos los toolsInLoan tienen IDs válidos
          const validatedTools = toolsInLoan.map(tool => {
            console.log('Processing tool for return:', tool);
            
            // Asegurar que tenemos un toolId válido
            const toolId = tool.toolId || tool.id || tool._id;
            if (!toolId) {
              console.error('Tool missing ID:', tool);
              throw new Error(`Herramienta sin ID válido: ${JSON.stringify(tool)}`);
            }
            
            return {
              toolId: toolId,
              quantity: tool.quantity || 1,
              condition: tool.condition || 'Bueno'
            };
          });

          const returnData = {
            studentCode: studentInfo.studentId,
            loanId: loanId,
            toolsToReturn: validatedTools,
            notes: '', // Sin notas
            supervisorId: user?._id || user?.id
          };

          console.log('Processing return for loan:', loanId, 'Return data:', returnData);

          const response = await apiRequest('/returns/process', {
            method: 'POST',
            body: JSON.stringify(returnData)
          });

          if (response.ok) {
            const result = await response.json();
            results.push(result);
            processedCount += validatedTools.length;
            console.log('Return processed successfully:', result);
          } else {
            const errorData = await response.json();
            console.error('Error processing return:', errorData);
            allProcessed = false;
            
            toast({
              title: "Error en Devolución",
              description: errorData.message || `Error procesando préstamo ${loanId}`,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error processing loan return:', error);
          allProcessed = false;
          
          toast({
            title: "Error de Validación",
            description: error.message || "Error validando herramientas para devolución",
            variant: "destructive"
          });
        }
      }

      // Mostrar resultado final
      if (allProcessed && results.length > 0) {
        const totalToolsReturned = results.reduce((sum, result) => 
          sum + (result.summary?.totalQuantity || 0), 0
        );
        
        const hasLateReturns = results.some(result => result.isLateReturn);
        
        toast({
          title: "¡Devolución Completada!",
          description: `${totalToolsReturned} herramienta(s) devuelta(s) por ${studentInfo.name}. ${hasLateReturns ? 'Algunas devoluciones fueron tardías.' : 'Todas las devoluciones fueron a tiempo.'}`,
          duration: 8000
        });

        // Actualizar la lista de préstamos activos después de la devolución
        await refreshActiveLoans();
        
        // Limpiar herramientas verificadas
        setVerifiedTools({});
      } else if (processedCount > 0) {
        toast({
          title: "Devolución Parcial",
          description: `${processedCount} herramienta(s) procesada(s). Algunas tuvieron errores.`,
          variant: "default",
          duration: 7000
        });
        
        // Actualizar préstamos activos para reflejar cambios parciales
        await refreshActiveLoans();
      }

    } catch (error) {
      console.error('Error in return process:', error);
      toast({
        title: "Error General",
        description: "Hubo un problema procesando la devolución. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingReturn(false);
    }
  };

  // Actualizar préstamos activos
  const refreshActiveLoans = async () => {
    if (!studentInfo) return;

    try {
      console.log('Refreshing active loans for student:', studentInfo.studentId);
      
      const response = await apiRequest(`/returns/student/${studentInfo.studentId}/active-loans`);
      if (response.ok) {
        const data = await response.json();
        console.log('Updated loans data:', data);
        
        setActiveLoans(data.activeLoans || []);
        
        // Limpiar herramientas verificadas que ya no están en préstamos activos
        const remainingToolIds = new Set();
        (data.activeLoans || []).forEach(loan => {
          loan.tools.forEach(tool => {
            remainingToolIds.add(tool.toolId);
          });
        });
        
        setVerifiedTools(prev => {
          const updated = {};
          Object.keys(prev).forEach(toolId => {
            if (remainingToolIds.has(toolId)) {
              updated[toolId] = prev[toolId];
            }
          });
          return updated;
        });
        
        toast({
          title: "Préstamos Actualizados",
          description: `${data.activeLoans?.length || 0} préstamo(s) activo(s) restante(s)`
        });
      }
    } catch (error) {
      console.error('Error refreshing loans:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los préstamos activos",
        variant: "destructive"
      });
    }
  };

  // Determinar si un préstamo está vencido
  const isLoanOverdue = (estimatedReturnDate) => {
    return new Date(estimatedReturnDate) < new Date();
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
      className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-700">
            Devolución de Herramientas
          </h1>
        </div>
      </div>

      {/* Sección de búsqueda de estudiante */}
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <UserCircle className="mr-2 h-6 w-6" /> Buscar Estudiante
          </CardTitle>
          <CardDescription>Busque al estudiante por matrícula o huella dactilar para ver sus préstamos activos.</CardDescription>
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
                  <SelectItem value="studentId">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Por Matrícula</span>
                      <span className="sm:hidden">Matrícula</span>
                    </div>
                  </SelectItem>
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
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="student-search" className="text-custom-gold text-sm font-medium">
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
                        disabled={isSearchingStudent}
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
                        {isSearchingStudent ? 'Procesando huella detectada...' : 'Esperando detección automática...'}
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
                    id="student-search" 
                    placeholder={searchType === 'fingerprint' ? "Ingrese ID de huella (1, 2, 3...)" : "Ingrese matrícula del estudiante"} 
                    value={studentSearchId}
                    onChange={(e) => setStudentSearchId(e.target.value)}
                    className="bg-input border-custom-gold/30 focus:border-custom-gold flex-1" 
                    onKeyPress={(e) => e.key === 'Enter' && handleStudentSearch()}
                  />
                  <Button 
                    onClick={handleStudentSearch} 
                    disabled={isSearchingStudent} 
                    className="w-full sm:w-auto sm:min-w-[150px]"
                  >
                    {searchType === 'fingerprint' ? (
                      <Fingerprint className={`mr-2 h-4 w-4 ${isSearchingStudent ? 'animate-ping' : ''}`} />
                    ) : (
                      <UserCircle className={`mr-2 h-4 w-4 ${isSearchingStudent ? 'animate-ping' : ''}`} />
                    )}
                    <span className="hidden sm:inline">
                      {isSearchingStudent ? 'Buscando...' : (searchType === 'fingerprint' ? 'Verificar' : 'Buscar')}
                    </span>
                    <span className="sm:hidden">
                      {isSearchingStudent ? 'Buscando...' : 'Buscar'}
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
                  src={studentInfo.avatar || 'https://images.unsplash.com/photo-1698431048673-53ed1765ea07'} 
                />
                <div className="flex-grow text-center sm:text-left">
                  <p className="font-semibold text-base sm:text-lg text-foreground">{studentInfo.name}</p>
                  <p className="text-sm text-muted-foreground">Matrícula: {studentInfo.studentId} | {studentInfo.career}</p>
                  <p className="text-sm text-muted-foreground">Cuatrimestre: {studentInfo.cuatrimestre || 'N/A'} | Grupo: {studentInfo.group || 'N/A'}</p>
                  <p className="text-sm text-custom-teal font-medium">Préstamos Activos: {activeLoans.length}</p>
                  <p className={`text-sm font-bold ${studentInfo.status === 'Activo' ? 'text-green-500' : 'text-red-500'}`}>
                    Estado: {studentInfo.status}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={refreshActiveLoans}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Sección de escaneo de herramientas */}
      {studentInfo && activeLoans.length > 0 && (
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <ScanLine className="mr-2 h-6 w-6" /> Escanear Herramientas a Devolver
            </CardTitle>
            <CardDescription>Escanee o ingrese el ID de cada herramienta que está siendo devuelta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor="tool-scan" className="text-custom-gold">ID o Código de Herramienta</Label>
                <Input 
                  id="tool-scan" 
                  placeholder="Ingrese ID o código de la herramienta a devolver" 
                  value={scannedToolId}
                  onChange={(e) => setScannedToolId(e.target.value)}
                  className="bg-input border-custom-gold/30 focus:border-custom-gold" 
                  onKeyPress={(e) => e.key === 'Enter' && handleToolScan()}
                />
              </div>
              <Button onClick={handleToolScan} disabled={isScanningTool} className="min-w-[150px]">
                <ScanLine className={`mr-2 h-5 w-5 ${isScanningTool ? 'animate-ping' : ''}`} />
                {isScanningTool ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>

            {/* Lista de herramientas verificadas */}
            {Object.keys(verifiedTools).length > 0 && (
              <div className="mt-4 p-4 border border-green-500/30 rounded-lg bg-green-500/5">
                <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Herramientas Verificadas para Devolución ({Object.keys(verifiedTools).length})
                </h4>
                <div className="space-y-2">
                  {Object.entries(verifiedTools).map(([toolId, tool]) => (
                    <div key={toolId} className="flex items-center justify-between p-2 bg-background rounded border">
                      <div className="flex-grow">
                        <span className="font-medium">{tool.toolName}</span>
                        <span className="text-sm text-muted-foreground ml-2">({tool.toolCode})</span>
                        <span className="text-sm text-muted-foreground ml-2">- Cant: {tool.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={tool.condition} onValueChange={(value) => updateToolCondition(toolId, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excelente">Excelente</SelectItem>
                            <SelectItem value="Bueno">Bueno</SelectItem>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="Dañado">Dañado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeVerifiedTool(toolId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabla de préstamos activos */}
      {studentInfo && (
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <Package className="mr-2 h-6 w-6" /> Préstamos Activos de {studentInfo.name}
            </CardTitle>
            <CardDescription>Herramientas pendientes de devolución.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeLoans.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-custom-gold">Herramienta</TableHead>
                      <TableHead className="text-custom-gold">Código</TableHead>
                      <TableHead className="text-custom-gold">Cantidad</TableHead>
                      <TableHead className="text-custom-gold">Fecha Límite</TableHead>
                      <TableHead className="text-custom-gold text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLoans.flatMap(loan => 
                      loan.tools.map(tool => {
                        const isOverdue = isLoanOverdue(loan.estimatedReturnDate);
                        const isVerified = verifiedTools[tool.toolId];
                        
                        return (
                          <TableRow 
                            key={`${loan.id}-${tool.toolId}`} 
                            className={`${isVerified ? 'bg-green-500/10' : ''} ${isOverdue && !isVerified ? 'bg-red-500/10' : ''}`}
                          >
                            <TableCell className="font-medium text-foreground">{tool.toolName}</TableCell>
                            <TableCell className="text-muted-foreground">{tool.toolCode}</TableCell>
                            <TableCell className="text-muted-foreground">{tool.quantityBorrowed}</TableCell>
                            <TableCell className={`text-muted-foreground ${isOverdue && !isVerified ? 'text-red-500 font-semibold' : ''}`}>
                              <Clock className={`inline h-4 w-4 mr-1 ${isOverdue && !isVerified ? 'text-red-500' : 'text-muted-foreground'}`} />
                              {new Date(loan.estimatedReturnDate).toLocaleString('es-ES')}
                            </TableCell>
                            <TableCell className="text-center">
                              {isVerified ? (
                                <span className="flex items-center justify-center text-green-500">
                                  <CheckCircle className="mr-1 h-5 w-5" /> Verificada
                                </span>
                              ) : isOverdue ? (
                                <span className="flex items-center justify-center text-red-500">
                                  <AlertCircle className="mr-1 h-5 w-5" /> Vencido
                                </span>
                              ) : (
                                <span className="text-yellow-500">Pendiente</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : studentInfo ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">Este estudiante no tiene préstamos activos</p>
                <p className="text-muted-foreground text-sm mt-2">No hay herramientas pendientes de devolución</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Botón de finalizar devolución */}
      {studentInfo && Object.keys(verifiedTools).length > 0 && (
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Finalizar Devolución</CardTitle>
            <CardDescription>Procesar la devolución de las herramientas verificadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={clearForm}>
                Cancelar Todo
              </Button>
              <Button 
                onClick={processCompleteReturn} 
                disabled={isProcessingReturn}
                className="min-w-[200px]"
              >
                {isProcessingReturn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando Devolución...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completar Devolución
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado inicial */}
      {!studentInfo && (
        <div className="text-center py-10">
          <UserCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">Busque un estudiante para iniciar el proceso de devolución</p>
          <p className="text-muted-foreground text-sm mt-2">Use la matrícula o huella dactilar para encontrar sus préstamos activos</p>
        </div>
      )}

      {/* Estado cuando estudiante está bloqueado */}
      {studentInfo && studentInfo.status === 'Bloqueado' && (
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-500 mb-4" />
          <p className="text-red-500 font-semibold text-sm sm:text-base">
            El estudiante {studentInfo.name} está bloqueado.
          </p>
          <p className="text-muted-foreground text-sm sm:text-base">
            No puede procesar devoluciones hasta que se resuelva su situación.
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

export default ReturnProcessPage;