import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useTools = () => {
  const { apiRequest } = useAuth();
  const { toast } = useToast();
  
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Función para verificar conexión
  const checkConnection = useCallback(async () => {
    try {
      const response = await apiRequest('/health');
      if (response.ok) {
        setIsConnected(true);
        setError(null);
        return true;
      } else {
        setIsConnected(false);
        setError('Sin conexión al servidor');
        return false;
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      setError('Sin conexión al servidor');
      return false;
    }
  }, [apiRequest]);

  // Función para cargar todas las herramientas
  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/tools');
      
      if (response.ok) {
        const data = await response.json();
        setTools(Array.isArray(data) ? data : []);
        setIsConnected(true);
        console.log('Tools loaded successfully:', data.length);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar herramientas');
      }
    } catch (error) {
      console.error('Error loading tools:', error);
      setError(error.message);
      setIsConnected(false);
      
      // En caso de error, mantener las herramientas actuales en lugar de limpiar
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar las herramientas del servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [apiRequest, toast]);

  // Función para crear una nueva herramienta
  const createTool = useCallback(async (toolData) => {
    try {
      setError(null);
      
      // Limpiar datos antes de enviar
      const cleanToolData = {
        uniqueId: toolData.uniqueId.trim(),
        specificName: toolData.specificName.trim(),
        generalName: toolData.generalName.trim(),
        category: toolData.category,
        status: toolData.status || 'Disponible',
        maintenance_status: toolData.maintenance_status || 'OK',
        last_maintenance: toolData.last_maintenance,
        next_maintenance: toolData.next_maintenance,
        usage_count: toolData.usage_count || 0
      };

      const response = await apiRequest('/tools', {
        method: 'POST',
        body: JSON.stringify(cleanToolData)
      });

      if (response.ok) {
        const newTool = await response.json();
        setTools(prev => [...prev, newTool]);
        console.log('Tool created successfully:', newTool);
        return newTool;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la herramienta');
      }
    } catch (error) {
      console.error('Error creating tool:', error);
      setError(error.message);
      throw error;
    }
  }, [apiRequest]);

  // Función para actualizar una herramienta existente
  const updateTool = useCallback(async (toolId, toolData) => {
    try {
      setError(null);
      
      // Limpiar datos antes de enviar
      const cleanToolData = {
        uniqueId: toolData.uniqueId.trim(),
        specificName: toolData.specificName.trim(),
        generalName: toolData.generalName.trim(),
        category: toolData.category,
        status: toolData.status,
        maintenance_status: toolData.maintenance_status,
        last_maintenance: toolData.last_maintenance,
        next_maintenance: toolData.next_maintenance,
        usage_count: toolData.usage_count || 0
      };

      const response = await apiRequest(`/tools/${toolId}`, {
        method: 'PUT',
        body: JSON.stringify(cleanToolData)
      });

      if (response.ok) {
        const updatedTool = await response.json();
        setTools(prev => prev.map(tool => 
          tool._id === toolId ? updatedTool : tool
        ));
        console.log('Tool updated successfully:', updatedTool);
        return updatedTool;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la herramienta');
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      setError(error.message);
      throw error;
    }
  }, [apiRequest]);

  // Función para eliminar una herramienta
  const deleteTool = useCallback(async (toolId) => {
    try {
      setError(null);
      
      const response = await apiRequest(`/tools/${toolId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTools(prev => prev.filter(tool => tool._id !== toolId));
        console.log('Tool deleted successfully:', toolId);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la herramienta');
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      setError(error.message);
      throw error;
    }
  }, [apiRequest]);

  // Función para verificar si un uniqueId existe
  const checkUniqueId = useCallback(async (uniqueId) => {
    try {
      const response = await apiRequest(`/tools/check/${uniqueId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking unique ID:', error);
      return false;
    }
  }, [apiRequest]);

  // Función para obtener herramientas por categoría
  const getToolsByCategory = useCallback(async (category) => {
    try {
      setError(null);
      
      const response = await apiRequest(`/tools/category/${category}`);
      
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener herramientas por categoría');
      }
    } catch (error) {
      console.error('Error getting tools by category:', error);
      setError(error.message);
      throw error;
    }
  }, [apiRequest]);

  // Función para obtener herramientas por estado
  const getToolsByStatus = useCallback(async (status) => {
    try {
      setError(null);
      
      const response = await apiRequest(`/tools/status/${status}`);
      
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener herramientas por estado');
      }
    } catch (error) {
      console.error('Error getting tools by status:', error);
      setError(error.message);
      throw error;
    }
  }, [apiRequest]);

  // Cargar herramientas al montar el componente
  useEffect(() => {
    let isMounted = true;

    const initializeTools = async () => {
      const isConnected = await checkConnection();
      
      if (isConnected && isMounted) {
        await loadTools();
      } else if (isMounted) {
        setLoading(false);
      }
    };

    initializeTools();

    return () => {
      isMounted = false;
    };
  }, [checkConnection, loadTools]);

  // Función para refrescar los datos
  const refreshTools = useCallback(async () => {
    const isConnected = await checkConnection();
    if (isConnected) {
      await loadTools();
    }
  }, [checkConnection, loadTools]);

  return {
    tools,
    loading,
    error,
    isConnected,
    loadTools,
    createTool,
    updateTool,
    deleteTool,
    checkUniqueId,
    getToolsByCategory,
    getToolsByStatus,
    checkConnection,
    refreshTools
  };
};