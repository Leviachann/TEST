import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
      console.log('ProtectedRoute check:', { isAuthenticated, hasToken: !!accessToken });
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, accessToken]);

  if (!isHydrated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: '#999' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Authenticated, rendering protected content');
  return <>{children}</>;
}