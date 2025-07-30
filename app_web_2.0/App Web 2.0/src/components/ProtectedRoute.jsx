
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute:', {
    loading,
    user: user?.email || null,
    role: user?.role || null,
    path: location.pathname,
    requiredRole
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico, verificarlo
  if (requiredRole) {
    const userRole = user.role || 'user';
    const hasRequiredRole = userRole === requiredRole || 
                           (requiredRole === 'supervisor' && ['admin', 'supervisor'].includes(userRole)) ||
                           (requiredRole === 'admin' && userRole === 'admin');

    if (!hasRequiredRole) {
      console.log(`Access denied. User role: ${userRole}, Required role: ${requiredRole}`);
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
            <p className="text-muted-foreground mb-4">
              No tienes permisos suficientes para acceder a esta página.
            </p>
            <p className="text-sm text-muted-foreground">
              Rol requerido: <span className="font-medium">{requiredRole}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Tu rol actual: <span className="font-medium">{userRole}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  // Si todo está bien, mostrar el contenido
  return children;
};

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('PublicRoute:', {
    loading,
    user: user?.email || null,
    path: location.pathname,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Componentes de conveniencia para roles específicos
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const SupervisorRoute = ({ children }) => (
  <ProtectedRoute requiredRole="supervisor">
    {children}
  </ProtectedRoute>
);

export const UserRoute = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;