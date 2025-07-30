// services/passwordRecoveryService.ts
import { API_CONFIG } from '../config/environment';

export interface PasswordRecoveryResponse {
  success: boolean;
  message: string;
}

class PasswordRecoveryService {
  private baseUrl = API_CONFIG.BASE_URL;

  async forgotPassword(email: string): Promise<PasswordRecoveryResponse> {
    try {
      console.log('Solicitando recuperación de contraseña para:', email);
      
      const response = await fetch(`${this.baseUrl}/api/students/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      console.log('Respuesta de recuperación:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la recuperación de contraseña');
      }

      return data;
    } catch (error) {
      console.error('Error en PasswordRecoveryService.forgotPassword:', error);
      throw error;
    }
  }
}

export default new PasswordRecoveryService();