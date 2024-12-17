import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/hooks/use-auth';

export default function LogoutHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return null;
} 