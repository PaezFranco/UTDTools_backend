// context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  _id: string;
  email: string;
  full_name: string;
  student_id: string;
  phone?: string;
  career?: string;
  semester?: string;
  group?: string;
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
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cargar usuario desde AsyncStorage al iniciar la app
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserState(parsed);
        setIsLoggedIn(true);
        console.log('Usuario cargado desde storage:', parsed.full_name);
      }
    } catch (error) {
      console.error('Error cargando usuario desde storage:', error);
    }
  };

  const setUser = async (userData: UserData | null) => {
    try {
      if (userData) {
        // Guardar en AsyncStorage
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        setUserState(userData);
        setIsLoggedIn(true);
        console.log('Usuario guardado en contexto:', userData.full_name);
      } else {
        await AsyncStorage.removeItem('user_data');
        setUserState(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_data');
      setUserState(null);
      setIsLoggedIn(false);
      console.log('Usuario deslogueado');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de UserProvider');
  }
  return context;
};