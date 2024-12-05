import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { mainApi } from 'src/services/api/main.api';

interface User {
  id?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (code: string) => {
    try {
      const data = await mainApi.validateCode(code);
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('user', JSON.stringify({role: data.role}));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const userStr = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken')

    if (!!userStr && !!accessToken) {
      return true;
    }
    return false;
  }, []);

  const user = useMemo(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
    };
    checkAuthStatus();
  }, [checkAuth]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated,
    }),
    [user, login, logout, isAuthenticated]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 