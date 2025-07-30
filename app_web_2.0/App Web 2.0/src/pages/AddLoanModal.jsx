import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Search, Package, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AddLoanModal = ({ student, onLoanAdded, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [configuredHours, setConfiguredHours] = useState(6);
  const [toolSearch, setToolSearch] = useState('');
  const { toast } = useToast();

  // Cargar herramientas disponibles
  useEffect(() => {
    const loadTools = async () => {
      try {
        const response = await fetch(`${API_URL}/tools`);
        if (response.ok) {
          const toolsData = await response.json();
          // Filtrar solo herramientas disponibles
          const availableTools = toolsData.filter(tool => tool.available_quantity > 0);
          setTools(availableTools);
        }
      } catch (error) {
        console.error('Error loading tools:', error);
      }
    };

    const loadSupervisors = async () => {
      try {
        const response = await fetch(`${API_URL}/supervisors`);
        if (response.ok) {
          const supervisorsData = await response.json();
          setSupervisors(supervisorsData);
        }
      } catch (error) {
        console.error('Error loading supervisors:', error);
      }
    };

    if (isOpen) {
      loadTools();
      loadSupervisors();
    }
  }, [isOpen]);

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
    tool.code.toLowerCase().includes(toolSearch.toLowerCase())
  );

  const handleAddTool = (tool) => {
    const existingTool = selectedTools.find(t => t.tool_id === tool._id);
    if (existingTool) {
      if (existingTool.quantity < tool.available_quantity) {
        setSelectedTools(prev =>
          prev.map(t =>
            t.tool_id === tool._id
              ? { ...t, quantity: t.quantity + 1 }
              : t
          )
        );
      } else {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${tool.available_quantity} unidades disponibles de ${tool.name}`,
          variant: "destructive"
        });
      }
    } else {
      setSelectedTools(prev => [
        ...prev,
        {
          tool_id: tool._id,
          quantity: 1,
          name: tool.name,
          code: tool.code,
          available_quantity: tool.available_quantity
        }
      ]);
    }
  };

  const handleUpdateQuantity = (toolId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedTools(prev => prev.filter(t => t.tool_id !== toolId));
    } else {
      const tool = tools.find(t => t._id === toolId);
      if (newQuantity <= tool.available_quantity) {
        setSelectedTools(prev =>
          prev.map(t =>
            t.tool_id === toolId ? { ...t, quantity: newQuantity } : t
          )
        );
      } else {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${tool.available_quantity} unidades disponibles`,
          variant: "destructive"
        });
      }
    }
  };

  const handleCreateLoan = async () => {
    if (!selectedSupervisor) {
      toast({
        title: "Error",
        description: "Debe seleccionar un supervisor",
        variant: "destructive"
      });
      return;
    }

    if (selectedTools.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una herramienta",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const loanData = {
        student_code: student.studentId,
        supervisor_id: selectedSupervisor,
        tools: selectedTools.map(tool => ({
          tool_id: tool.tool_id,
          quantity: tool.quantity
        })),
        configured_time_hours: configuredHours
      };

      const response = await fetch(`${API_URL}/loans/create-with-validation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear el préstamo');
      }

      toast({
        title: "Préstamo creado",
        description: `Préstamo creado exitosamente para ${student.name}`,
      });

      // Limpiar formulario
      setSelectedTools([]);
      setSelectedSupervisor('');
      setConfiguredHours(6);
      setToolSearch('');
      setIsOpen(false);

      // Notificar al componente padre para actualizar la lista
      if (onLoanAdded) {
        onLoanAdded();
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el préstamo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateReturnTime = () => {
    const returnDate = new Date();
    returnDate.setHours(returnDate.getHours() + configuredHours);
    return returnDate.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Préstamo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Crear Préstamo para {student?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo - Selección de herramientas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="tool-search">Buscar Herramientas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tool-search"
                  placeholder="Buscar por nombre o código..."
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredTools.map((tool) => (
                <Card key={tool._id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleAddTool(tool)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Código: {tool.code} | Disponible: {tool.available_quantity}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Panel derecho - Configuración del préstamo */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="supervisor">Supervisor</Label>
              <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => (
                    <SelectItem key={supervisor._id} value={supervisor._id}>
                      {supervisor.full_name || supervisor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hours">Tiempo de Préstamo (horas)</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                max="24"
                value={configuredHours}
                onChange={(e) => setConfiguredHours(parseInt(e.target.value) || 6)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                <Clock className="inline h-3 w-3 mr-1" />
                Fecha de devolución: {calculateReturnTime()}
              </p>
            </div>

            <div>
              <Label>Herramientas Seleccionadas</Label>
              <div className="max-h-40 overflow-y-auto space-y-2 mt-2">
                {selectedTools.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay herramientas seleccionadas
                  </p>
                ) : (
                  selectedTools.map((tool) => (
                    <Card key={tool.tool_id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{tool.name}</h4>
                            <p className="text-xs text-muted-foreground">{tool.code}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(tool.tool_id, tool.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {tool.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(tool.tool_id, tool.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateLoan} 
            disabled={loading || selectedTools.length === 0 || !selectedSupervisor}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Crear Préstamo
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLoanModal;