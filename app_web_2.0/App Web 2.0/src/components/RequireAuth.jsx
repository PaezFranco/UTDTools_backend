// components/RequireAuth.jsx
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function RequireAuth() {
  const { user, loading } = useAuth();

  // Mientras el contexto consulta al servidor mostramos un loader
  if (loading) return <div className="flex h-screen items-center justify-center">Cargando…</div>;

  // Sin usuario => al login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
