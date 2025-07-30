// services/loanService.ts
import { API_CONFIG } from '../config/environment';

export interface LoanItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  loanDate: string;
  returnDate: string;
  returnDateShort: string;
  loanDateTime: string;
  returnDateTime: string;
  status: 'Activo' | 'Vencido';
}

export interface LoanResponse {
  success: boolean;
  student?: {
    name: string;
    email: string;
    studentId: string;
  };
  activeLoans: LoanItem[];
  totalActive: number;
  message?: string;
}

class LoanService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getActiveLoans(studentEmail: string): Promise<LoanResponse> {
    try {
      console.log('Obteniendo préstamos para:', studentEmail);
      
      const response = await fetch(`${this.baseUrl}/api/loans/active/${encodeURIComponent(studentEmail)}`);
      const data = await response.json();
      
      console.log('Respuesta de préstamos:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener préstamos');
      }

      return {
        success: data.success || false,
        student: data.student,
        activeLoans: data.activeLoans || [],
        totalActive: data.totalActive || 0,
        message: data.message
      };
    } catch (error) {
      console.error('Error en LoanService.getActiveLoans:', error);
      return {
        success: false,
        activeLoans: [],
        totalActive: 0,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Método para testing - obtener préstamos básicos
  async getBasicLoans(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/loans/basic-test`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en test básico:', error);
      return { success: false, error: error };
    }
  }
}

export default new LoanService();