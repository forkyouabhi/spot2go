import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { setAuthToken, registerUser, loginUser } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: any;
  exp: number;
  name: string;
  role: 'customer' | 'owner' | 'admin';
  createdAt: string;
  dateJoined: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: 'customer' | 'owner') => Promise<User>;
  logout: () => void;
  // This function will now handle receiving a new token from the backend
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

  const handleAuthSuccess = useCallback((token: string): User => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode<User>(token);
    const fullUser = { ...decoded, dateJoined: decoded.createdAt };
    setUser(fullUser);
    setAuthToken(token);
    
    if (decoded.role === 'owner') {
      router.push('/owner/dashboard');
    } else if (decoded.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
    return fullUser;
  }, [router]);
  
  // This function is now exposed to be called after a successful profile update
  const handleTokenUpdate = useCallback((token: string) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode<User>(token);
    const fullUser = { ...decoded, dateJoined: decoded.createdAt };
    setUser(fullUser);
    setAuthToken(token);
  }, []);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<User>(token);
          if (decoded.exp * 1000 > Date.now()) {
            setUser({ ...decoded, dateJoined: decoded.createdAt });
            setAuthToken(token);
          } else {
            // Token expired
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

    checkToken();

    // Listen for storage changes to solve the race condition
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        checkToken();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await loginUser({ email, password });
    return handleAuthSuccess(response.data.token);
  };
    
  const register = async (name: string, email: string, password: string, role: 'customer' | 'owner'): Promise<User> => {
    const response = await registerUser({ name, email, password, role });
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
    handleTokenUpdate, // Expose the new secure update function
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};