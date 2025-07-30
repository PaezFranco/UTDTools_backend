import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import StudentsPage from '@/pages/StudentsPage';
import ToolsPage from '@/pages/ToolsPage';
import HistoryPage from '@/pages/HistoryPage';
import Layout from '@/components/Layout';
import ReturnProcessPage from '@/pages/ReturnProcessPage';
import ReportsPage from '@/pages/ReportsPage';
import OverdueItemsPage from '@/pages/OverdueItemsPage';
import StudentProfilePage from '@/pages/StudentProfilePage';
import AdminProfilePage from '@/pages/AdminProfilePage';
import NewLoanPage from '@/pages/NewLoanPage';

// Componente de protección de rutas mejorado
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - User:', user?.email, 'Role:', user?.role, 'Loading:', loading);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user.role !== requiredRole && !['admin', 'supervisor'].includes(user.role)) {
    console.log(`ProtectedRoute - Access denied. Required: ${requiredRole}, User role: ${user.role}`);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// Componente de rutas públicas (solo login)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('PublicRoute - User:', user?.email, 'Loading:', loading);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir al dashboard
  if (user) {
    console.log('PublicRoute - User authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente que renderiza las rutas con Layout
const LayoutRoute = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <Layout onLogout={logout} currentUser={user}>
      {children}
    </Layout>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LayoutRoute>
              <DashboardPage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <LayoutRoute>
              <StudentsPage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students/:studentId"
        element={
          <ProtectedRoute>
            <LayoutRoute>
              <StudentProfilePage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tools"
        element={
          <ProtectedRoute>
            <LayoutRoute>
              <ToolsPage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <LayoutRoute>
              <HistoryPage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/new-loan"
        element={
          <ProtectedRoute requiredRole="supervisor">
            <LayoutRoute>
              <NewLoanPage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/return-process"
        element={
          <ProtectedRoute requiredRole="supervisor">
            <LayoutRoute>
              <ReturnProcessPage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <LayoutRoute>
              <ReportsPage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/overdue-items"
        element={
          <ProtectedRoute>
            <LayoutRoute>
              <OverdueItemsPage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-profile"
        element={
          <ProtectedRoute>
            <LayoutRoute>
              <AdminProfilePage />
            </LayoutRoute>
          </ProtectedRoute>
        }
      />

      {/* Ruta catch-all - redirige a dashboard si está autenticado, sino a login */}
      <Route
        path="*"
        element={
          user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

// Componente principal con manejo de errores
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;