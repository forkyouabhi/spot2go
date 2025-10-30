// services/web/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { setAuthToken, registerUser, loginUser } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: any;
  exp: number;
  name: string;
  role: 'customer' | 'owner' | 'admin';
  status: 'active' | 'pending_verification' | 'rejected';
  createdAt: string;
  dateJoined: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  // --- MODIFIED: Added new fields to register function type ---
  register: (
    name: string, 
    email: string, 
    password: string, 
    role: 'customer' | 'owner',
    phone?: string,
    businessLocation?: string
  ) => Promise<User>;
  logout: () => void;
  handleTokenUpdate: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleAuthSuccess = useCallback((token: string, redirect: boolean = true) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    const decoded = jwtDecode<User>(token);
    const fullUser = { ...decoded, dateJoined: decoded.createdAt, status: decoded.status };
    setUser(fullUser);

    if (redirect) {
      const targetPath = decoded.role === 'owner' ? '/owner/dashboard' : decoded.role === 'admin' ? '/admin/dashboard' : '/';
      router.replace(targetPath);
    }
    return fullUser;
  }, [router]);

  const handleTokenUpdate = useCallback((token: string) => {
    handleAuthSuccess(token, false);
  }, [handleAuthSuccess]);

  useEffect(() => {
    const processToken = () => {
      const urlToken = router.query.token as string;
      if (urlToken) {
        handleAuthSuccess(urlToken, true);
        return; 
      }

      const localToken = localStorage.getItem('token');
      if (localToken) {
        try {
          const decoded = jwtDecode<User>(localToken);
          if (decoded.exp * 1000 > Date.now()) {
            setUser({ ...decoded, dateJoined: decoded.createdAt, status: decoded.status });
            setAuthToken(localToken);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    if (router.isReady) {
      processToken();
    }
  }, [router.isReady, router.query.token, handleAuthSuccess]);
  
  const login = async (email: string, password: string): Promise<User> => {
    const response = await loginUser({ email, password });
    return handleAuthSuccess(response.data.token);
  };
    
  // --- MODIFIED: Pass new fields to registerUser API call ---
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'customer' | 'owner',
    phone?: string,
    businessLocation?: string
  ): Promise<User> => {
    const response = await registerUser({ name, email, password, role, phone, businessLocation });
    return handleAuthSuccess(response.data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthToken(null);
    router.push('/login');
  };

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    handleTokenUpdate,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};