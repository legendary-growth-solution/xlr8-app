import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';

interface Props {
  children: ReactNode;
}

export default function GuestGuard({ children }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      navigate('/', { replace: true });
      return;
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
} 