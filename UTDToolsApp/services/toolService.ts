// services/toolService.ts
import { API_CONFIG } from '../config/environment';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  available: number;
  total?: number;
  status: string;
}

export interface ToolsByCategory {
  [category: string]: ToolItem[];
}

export interface InventoryResponse {
  success: boolean;
  data: ToolsByCategory;
  message?: string;
}

class ToolService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getAllTools(): Promise<InventoryResponse> {
    try {
      console.log('Obteniendo inventario completo...');
      
      const response = await fetch(`${this.baseUrl}/api/tools/public/inventory`);
      const data = await response.json();
      
      console.log('Respuesta del inventario:', data);
      
      if (!response.ok) {
        throw new Error('Error al obtener inventario');
      }

      return {
        success: true,
        data: data,
        message: 'Inventario cargado exitosamente'
      };
    } catch (error) {
      console.error('Error en ToolService.getAllTools:', error);
      return {
        success: false,
        data: {},
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async searchTools(query: string): Promise<ToolItem[]> {
    try {
      console.log('Buscando herramientas:', query);
      
      const response = await fetch(`${this.baseUrl}/api/tools/students/search/${encodeURIComponent(query)}`);
      const data = await response.json();
      
      console.log('Resultados de búsqueda:', data);
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      return data || [];
    } catch (error) {
      console.error('Error en ToolService.searchTools:', error);
      return [];
    }
  }

  async getToolsByCategory(category: string): Promise<ToolItem[]> {
    try {
      console.log('Obteniendo herramientas por categoría:', category);
      
      const response = await fetch(`${this.baseUrl}/api/tools/students/category/${encodeURIComponent(category)}`);
      const data = await response.json();
      
      console.log('Herramientas por categoría:', data);
      
      if (!response.ok) {
        throw new Error('Error al obtener herramientas por categoría');
      }

      return data || [];
    } catch (error) {
      console.error('Error en ToolService.getToolsByCategory:', error);
      return [];
    }
  }
}

export default new ToolService();