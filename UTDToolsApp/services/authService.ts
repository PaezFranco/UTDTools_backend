// services/authService.ts
import { API_CONFIG } from '../config/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  student?: {
    _id: string;
    email: string;
    full_name: string;
    student_id: string;
    phone: string;
    career: string;
    semester: string;
    group: string;
    is_profile_complete: boolean;
    is_mobile_registration_pending: boolean;
    registration_source: string;
    blocked: boolean;
    block_reason?: string;
    registered_fingerprint: boolean;
    registration_date: string;
    profileStatus: {
      isComplete: boolean;
      isPending: boolean;
      hasBasicInfo: boolean;
      hasCareer: boolean;
      needsCompletion: boolean;
    };
  };
  blocked?: boolean;
}

class AuthService {
  private baseUrl = API_CONFIG.BASE_URL;

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Iniciando login con:', credentials.email);
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.MOBILE_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      console.log('Respuesta del servidor:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      return data;
    } catch (error) {
      console.error('Error en AuthService.login:', error);
      throw error;
    }
  }

  async getStudentByEmail(email: string) {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.STUDENT_BY_EMAIL}/${email}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estudiante');
      }

      return data;
    } catch (error) {
      console.error('Error en AuthService.getStudentByEmail:', error);
      throw error;
    }
  }
}

export default new AuthService();