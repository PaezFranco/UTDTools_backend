// src/services/toolsApi.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Función helper para manejar errores de red
const handleNetworkError = (error) => {
  console.error('Error de red:', error);
  throw new Error('Error de conexión. Verifica tu conexión a internet.');
};

export const toolsApi = {
  // Obtener todas las herramientas
  getAllTools: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        handleNetworkError(error);
      }
      throw error;
    }
  },

  // Obtener herramienta por ID
  getToolById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        handleNetworkError(error);
      }
      throw error;
    }
  },

  // Crear nueva herramienta
  createTool: async (toolData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        handleNetworkError(error);
      }
      throw error;
    }
  },

  // Actualizar herramienta
  updateTool: async (id, toolData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        handleNetworkError(error);
      }
      throw error;
    }
  },

  // Eliminar herramienta
  deleteTool: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        handleNetworkError(error);
      }
      throw error;
    }
  },

  // Función para verificar conexión con el backend
  checkConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tools`, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};