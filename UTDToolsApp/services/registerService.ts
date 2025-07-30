// // services/registerService.ts
// import { API_CONFIG } from '../config/environment';
// import { Platform } from 'react-native';
// import * as Device from 'expo-device';
// import Constants from 'expo-constants';

// export interface RegisterCredentials {
//   email: string;
//   password: string;
// }

// export interface RegisterResponse {
//   success: boolean;
//   message: string;
//   student?: {
//     _id: string;
//     email: string;
//     full_name: string;
//     student_id?: string;
//     registration_source: string;
//     is_mobile_registration_pending: boolean;
//     is_profile_complete: boolean;
//   };
// }

// class RegisterService {
//   private baseUrl = API_CONFIG.BASE_URL;

//   async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
//     try {
//       console.log('Iniciando registro con:', credentials.email);
      
//       // Obtener información del dispositivo
//       const deviceInfo = this.getDeviceInfo();
      
//       const response = await fetch(`${this.baseUrl}/api/students/mobile/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: credentials.email,
//           password: credentials.password,
//           device_info: deviceInfo,
//           app_version: Constants.expoConfig?.version || '1.0.0'
//         }),
//       });

//       const data = await response.json();
      
//       console.log('Respuesta del registro:', data);
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Error en el registro');
//       }

//       return data;
//     } catch (error) {
//       console.error('Error en RegisterService.register:', error);
//       throw error;
//     }
//   }

//   private getDeviceInfo(): string {
//     try {
//       const deviceName = Device.deviceName || 'Dispositivo desconocido';
//       const osName = Platform.OS === 'ios' ? 'iOS' : 'Android';
//       const osVersion = Platform.Version;
//       const modelName = Device.modelName || 'Modelo desconocido';
      
//       return `${deviceName} (${modelName}) - ${osName} ${osVersion}`;
//     } catch (error) {
//       console.error('Error obteniendo info del dispositivo:', error);
//       return 'Dispositivo móvil';
//     }
//   }
// }

// export default new RegisterService();

// services/registerService.ts
import { API_CONFIG } from '../config/environment';
import { Platform } from 'react-native';

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  student?: {
    _id: string;
    email: string;
    full_name: string;
    student_id?: string;
    registration_source: string;
    is_mobile_registration_pending: boolean;
    is_profile_complete: boolean;
  };
}

class RegisterService {
  private baseUrl = API_CONFIG.BASE_URL;

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      console.log('Iniciando registro con:', credentials.email);
      
      // Información básica del dispositivo sin dependencias adicionales
      const deviceInfo = this.getDeviceInfo();
      
      const response = await fetch(`${this.baseUrl}/api/students/mobile/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          device_info: deviceInfo,
          app_version: '1.0.0'
        }),
      });

      const data = await response.json();
      
      console.log('Respuesta del registro:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } catch (error) {
      console.error('Error en RegisterService.register:', error);
      throw error;
    }
  }

  private getDeviceInfo(): string {
    try {
      const osName = Platform.OS === 'ios' ? 'iOS' : 'Android';
      const osVersion = Platform.Version;
      
      return `Dispositivo ${osName} ${osVersion}`;
    } catch (error) {
      console.error('Error obteniendo info del dispositivo:', error);
      return 'Dispositivo móvil';
    }
  }
}

export default new RegisterService();