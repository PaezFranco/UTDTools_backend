// services/historyService.ts
import { API_CONFIG } from '../config/environment';

export interface HistoryItem {
  id: string;
  name: string;
  type: 'Préstamo' | 'Devolución' | 'Advertencia' | 'Alerta' | 'Préstamo Activo';
  date: string;
  duration: string;
  category: string;
  status: 'completed' | 'warning' | 'alert' | 'active';
  quantity: number;
  loanDateTime: string;
  estimatedReturnDateTime: string;
  actualReturnDateTime?: string;
  loanStatus: string;
}

export interface HistoryStats {
  completed: number;
  active: number;
  warnings: number;
  alerts: number;
}

export interface HistoryResponse {
  success: boolean;
  student?: {
    name: string;
    email: string;
    studentId: string;
  };
  history: HistoryItem[];
  totalLoans: number;
  stats: HistoryStats;
  message?: string;
}

class HistoryService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getStudentHistory(studentEmail: string): Promise<HistoryResponse> {
    try {
      console.log('Obteniendo historial para:', studentEmail);
      
      const response = await fetch(`${this.baseUrl}/api/loans/history/${encodeURIComponent(studentEmail)}`);
      const data = await response.json();
      
      console.log('Respuesta del historial:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener historial');
      }

      return {
        success: data.success || false,
        student: data.student,
        history: data.history || [],
        totalLoans: data.totalLoans || 0,
        stats: data.stats || { completed: 0, active: 0, warnings: 0, alerts: 0 },
        message: data.message
      };
    } catch (error) {
      console.error('Error en HistoryService.getStudentHistory:', error);
      return {
        success: false,
        history: [],
        totalLoans: 0,
        stats: { completed: 0, active: 0, warnings: 0, alerts: 0 },
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export default new HistoryService();