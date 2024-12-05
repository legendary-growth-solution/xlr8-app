import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      navigate('/auth', { replace: true });
      return;
    }
    
    setAuthenticated(true);
    setLoading(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return authenticated ? <>{children}</> : null;
} 