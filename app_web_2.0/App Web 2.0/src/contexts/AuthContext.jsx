// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useToast } from '@/components/ui/use-toast';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [accessToken, setAccessToken] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const { toast } = useToast();

//   // URL base de tu API
//   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

//   // ========== Renovar Access Token ==========
//   const refreshAccessToken = useCallback(async () => {
//     try {
//       console.log('Attempting to refresh access token...');
      
//       const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       console.log('Refresh response status:', response.status);

//       if (response.ok) {
//         const data = await response.json();
//         console.log('Token refreshed successfully');
        
//         setAccessToken(data.accessToken);
//         setUser(data.user);
        
//         return { success: true, data };
//       } else {
//         const errorData = await response.text();
//         console.log(' Refresh failed:', errorData);
        
//         // Limpiar estado si el refresh falla
//         setAccessToken(null);
//         setUser(null);
        
//         return { success: false, error: errorData };
//       }
//     } catch (error) {
//       console.error('Error refreshing token:', error);
      
//       // Limpiar estado si hay error
//       setAccessToken(null);
//       setUser(null);
      
//       return { success: false, error: error.message };
//     }
//   }, [API_BASE_URL]);

//   // ========== Función para hacer peticiones con token automático ==========
//   const apiRequest = useCallback(async (url, options = {}) => {
//     const config = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       credentials: 'include',
//       ...options,
//     };

//     // Agregar token de acceso si existe
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }

//     try {
//       let response = await fetch(`${API_BASE_URL}${url}`, config);

//       // Si el token expiró, intentar renovarlo
//       if (response.status === 401) {
//         console.log('Token expired, attempting refresh...');
//         const refreshResult = await refreshAccessToken();
        
//         if (refreshResult.success) {
//           // Reintentar la petición con el nuevo token
//           config.headers.Authorization = `Bearer ${refreshResult.data.accessToken}`;
//           response = await fetch(`${API_BASE_URL}${url}`, config);
//         } else {
//           // No se pudo renovar, hacer logout
//           console.log('Cannot refresh token, logging out...');
//           await logout();
//           throw new Error('Session expired');
//         }
//       }

//       return response;
//     } catch (error) {
//       console.error('API Request Error:', error);
//       throw error;
//     }
//   }, [accessToken, API_BASE_URL, refreshAccessToken]);

//   // ========== Login ==========
//   const login = async (email, password, userType = 'supervisor') => {
//     try {
//       console.log(' Attempting login for:', email);
      
//       const response = await fetch(`${API_BASE_URL}/auth/login/${userType}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ email, password }),
//       });

//       console.log('Login response status:', response.status);

//       if (response.ok) {
//         const data = await response.json();
//         console.log('Login successful');
        
//         // Actualizar estado
//         setAccessToken(data.accessToken);
//         setUser(data.supervisor || data.user); // Compatibilidad con tu backend
        
//         toast({
//           title: 'Inicio de sesión exitoso',
//           description: `Bienvenido, ${(data.supervisor || data.user).name || (data.supervisor || data.user).email}`,
//         });
        
//         return { success: true };
//       } else {
//         const errorData = await response.json();
//         console.log('Login failed:', errorData);
        
//         toast({
//           title: 'Error de autenticación',
//           description: errorData.message || 'Credenciales inválidas',
//           variant: 'destructive',
//         });
        
//         return { success: false, error: errorData.message };
//       }
//     } catch (error) {
//       console.error('Login error:', error);
      
//       toast({
//         title: 'Error de conexión',
//         description: 'No se pudo conectar con el servidor',
//         variant: 'destructive',
//       });
      
//       return { success: false, error: error.message };
//     }
//   };

//   // ========== Register Student ==========
//   const registerStudent = async (email, password) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/auth/register/student`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ email, password }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast({
//           title: 'Registro exitoso',
//           description: 'Estudiante registrado correctamente',
//         });
//         return { success: true, data };
//       } else {
//         const errorData = await response.json();
//         toast({
//           title: 'Error de registro',
//           description: errorData.message || 'Error al registrar estudiante',
//           variant: 'destructive',
//         });
//         return { success: false, error: errorData.message };
//       }
//     } catch (error) {
//       console.error('Register error:', error);
//       toast({
//         title: 'Error de conexión',
//         description: 'No se pudo conectar con el servidor',
//         variant: 'destructive',
//       });
//       return { success: false, error: error.message };
//     }
//   };

//   // ========== Logout ==========
//   const logout = useCallback(async () => {
//     try {
//       await fetch(`${API_BASE_URL}/auth/logout`, {
//         method: 'POST',
//         credentials: 'include',
//       });
//       console.log('Logout successful');
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       // Limpiar estado local
//       setAccessToken(null);
//       setUser(null);
      
//       toast({
//         title: 'Sesión cerrada',
//         description: 'Has cerrado sesión correctamente',
//       });
//     }
//   }, [API_BASE_URL, toast]);

//   // ========== Logout de todas las sesiones ==========
//   const logoutAllSessions = async () => {
//     try {
//       await apiRequest('/auth/logout-all', {
//         method: 'POST',
//       });
      
//       setAccessToken(null);
//       setUser(null);
      
//       toast({
//         title: 'Todas las sesiones cerradas',
//         description: 'Se han cerrado todas las sesiones activas',
//       });
//     } catch (error) {
//       console.error('Logout all sessions error:', error);
//       toast({
//         title: 'Error',
//         description: 'Error al cerrar todas las sesiones',
//         variant: 'destructive',
//       });
//     }
//   };

//   // ========== Verificar autenticación al cargar (SOLO UNA VEZ) ==========
//   useEffect(() => {
//     if (isInitialized) return; // Evitar múltiples inicializaciones

//     let isMounted = true;

//     const checkAuth = async () => {
//       try {
//         console.log('Checking initial authentication...');
        
//         const refreshResult = await refreshAccessToken();
        
//         if (isMounted) {
//           if (refreshResult.success) {
//             console.log('Valid session restored');
//             // El estado ya se actualiza en refreshAccessToken
//           } else {
//             console.log('No valid session found');
//             // El estado ya se limpia en refreshAccessToken
//           }
//         }
//       } catch (error) {
//         console.error('Auth check error:', error);
//         if (isMounted) {
//           setAccessToken(null);
//           setUser(null);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//           setIsInitialized(true);
//         }
//       }
//     };

//     checkAuth();

//     return () => {
//       isMounted = false;
//     };
//   }, [isInitialized, refreshAccessToken]);

//   // ========== Auto-refresh token cada 9 minutos ==========
//   useEffect(() => {
//     if (!accessToken || !isInitialized) return;

//     console.log(' Setting up auto-refresh interval');
    
//     const interval = setInterval(async () => {
//       console.log('Auto-refreshing token...');
//       await refreshAccessToken();
//     }, 9 * 60 * 1000); // 9 minutos

//     return () => {
//       console.log('Clearing auto-refresh interval');
//       clearInterval(interval);
//     };
//   }, [accessToken, isInitialized, refreshAccessToken]);

//   const value = {
//     user,
//     accessToken,
//     loading,
//     login,
//     registerStudent,
//     logout,
//     logoutAllSessions,
//     apiRequest,
//     refreshAccessToken,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Refs para evitar race conditions
  const isRefreshing = useRef(false);
  const refreshPromise = useRef(null);
  const eventSource = useRef(null);

  // URL base de tu API
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Limpiar estado completamente
  const clearAuthState = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    // Limpiar cualquier dato de sesión en localStorage como respaldo
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  }, []);

  // Configurar listener para logout en otras pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'logout-event') {
        console.log('Logout event detected in another tab');
        clearAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAuthState]);

  // Notificar logout a otras pestañas
  const notifyLogoutToOtherTabs = useCallback(() => {
    localStorage.setItem('logout-event', Date.now().toString());
    setTimeout(() => localStorage.removeItem('logout-event'), 1000);
  }, []);

  // Renovar Access Token mejorado para múltiples navegadores
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing.current) {
      console.log('Refresh already in progress, waiting...');
      return refreshPromise.current;
    }

    isRefreshing.current = true;
    
    refreshPromise.current = (async () => {
      try {
        console.log('Attempting to refresh access token...');
        
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        console.log('Refresh response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Token refreshed successfully');
          
          setAccessToken(data.accessToken);
          setUser(data.user);
          
          // Guardar en localStorage como respaldo para otros navegadores
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          return { success: true, data };
        } else {
          console.log('Refresh failed, status:', response.status);
          clearAuthState();
          return { success: false, error: 'Token refresh failed' };
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        clearAuthState();
        return { success: false, error: error.message };
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, [API_BASE_URL, clearAuthState]);

  // Función para hacer peticiones con token automático
  const apiRequest = useCallback(async (url, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Usar token del estado o localStorage como respaldo
    const token = accessToken || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      let response = await fetch(`${API_BASE_URL}${url}`, config);

      // Si el token expiró, intentar renovarlo
      if (response.status === 401 && !isRefreshing.current) {
        console.log('Token expired, attempting refresh...');
        const refreshResult = await refreshAccessToken();
        
        if (refreshResult.success) {
          // Reintentar la petición con el nuevo token
          config.headers.Authorization = `Bearer ${refreshResult.data.accessToken}`;
          response = await fetch(`${API_BASE_URL}${url}`, config);
        } else {
          console.log('Cannot refresh token, logging out...');
          await logout();
          throw new Error('Session expired');
        }
      }

      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }, [accessToken, API_BASE_URL, refreshAccessToken]);

  // Login
  const login = async (email, password, userType = 'supervisor') => {
    try {
      console.log('Attempting login for:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login/${userType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful');
        
        // Actualizar estado y localStorage
        const userData = data.supervisor || data.user;
        setAccessToken(data.accessToken);
        setUser(userData);
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast({
          title: 'Inicio de sesión exitoso',
          description: `Bienvenido, ${userData.name || userData.email}`,
        });
        
        return { success: true };
      } else {
        const errorData = await response.json();
        console.log('Login failed:', errorData);
        
        toast({
          title: 'Error de autenticación',
          description: errorData.message || 'Credenciales inválidas',
          variant: 'destructive',
        });
        
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive',
      });
      
      return { success: false, error: error.message };
    }
  };

  // Register Student
  const registerStudent = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Registro exitoso',
          description: 'Estudiante registrado correctamente',
        });
        return { success: true, data };
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error de registro',
          description: errorData.message || 'Error al registrar estudiante',
          variant: 'destructive',
        });
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  // Logout mejorado para cerrar todas las sesiones
  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');
      
      // Primero notificar a otras pestañas
      notifyLogoutToOtherTabs();
      
      // Luego hacer logout en el servidor
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar estado local
      clearAuthState();
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
    }
  }, [API_BASE_URL, toast, clearAuthState, notifyLogoutToOtherTabs]);

  // Logout de todas las sesiones
  const logoutAllSessions = async () => {
    try {
      notifyLogoutToOtherTabs();
      
      await apiRequest('/auth/logout-all', {
        method: 'POST',
      });
      
      clearAuthState();
      
      toast({
        title: 'Todas las sesiones cerradas',
        description: 'Se han cerrado todas las sesiones activas',
      });
    } catch (error) {
      console.error('Logout all sessions error:', error);
      toast({
        title: 'Error',
        description: 'Error al cerrar todas las sesiones',
        variant: 'destructive',
      });
    }
  };

  // Verificar autenticación al cargar con respaldo de localStorage
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Checking initial authentication...');
        
        // Intentar con refresh token primero
        const refreshResult = await refreshAccessToken();
        
        if (isMounted) {
          if (refreshResult.success) {
            console.log('Valid session restored from cookies');
          } else {
            console.log('No valid session from cookies, checking localStorage...');
            
            // Respaldo: verificar localStorage
            const storedToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken && storedUser) {
              try {
                // Verificar si el token almacenado es válido
                const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                });
                
                if (verifyResponse.ok) {
                  const verifyData = await verifyResponse.json();
                  const userData = JSON.parse(storedUser);
                  setAccessToken(storedToken);
                  setUser(verifyData.user || userData); // Usar datos del servidor o localStorage
                  console.log('Session restored from localStorage');
                } else {
                  console.log('Stored token is invalid, clearing...');
                  clearAuthState();
                }
              } catch (error) {
                console.log('Error verifying stored token:', error);
                clearAuthState();
              }
            } else {
              console.log('No stored session found');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          clearAuthState();
        }
      } finally {
        if (isMounted) {
          console.log('Auth initialization complete');
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }

    return () => {
      isMounted = false;
    };
  }, [refreshAccessToken, clearAuthState, API_BASE_URL]);

  // Auto-refresh token cada 9 minutos
  useEffect(() => {
    if (!isInitialized || !accessToken) return;

    console.log('Setting up auto-refresh interval');
    
    const interval = setInterval(async () => {
      if (!isRefreshing.current) {
        console.log('Auto-refreshing token...');
        await refreshAccessToken();
      }
    }, 9 * 60 * 1000); // 9 minutos

    return () => {
      console.log('Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [isInitialized, accessToken, refreshAccessToken]);

  const value = {
    user,
    accessToken,
    loading,
    login,
    registerStudent,
    logout,
    logoutAllSessions,
    apiRequest,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};