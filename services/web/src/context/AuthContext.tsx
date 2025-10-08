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
    const fullUser = { ...decoded, dateJoined: decoded.createdAt };
    setUser(fullUser);

    if (redirect) {
      // Clean the URL of the token after processing
      const targetPath = decoded.role === 'owner' ? '/owner/dashboard' : decoded.role === 'admin' ? '/admin/dashboard' : '/';
      router.replace(targetPath);
    }
    return fullUser;
  }, [router]);

  const handleTokenUpdate = useCallback((token: string) => {
    // This is for profile updates, no redirect needed
    handleAuthSuccess(token, false);
  }, [handleAuthSuccess]);

  useEffect(() => {
    // This function checks for a token in the URL first, then localStorage
    const processToken = () => {
      // Check for token in URL (from OAuth redirect)
      const urlToken = router.query.token as string;
      if (urlToken) {
        handleAuthSuccess(urlToken, true);
        // The handleAuthSuccess function will redirect and clean the URL
        return; // Stop processing to avoid conflicts
      }

      // If no token in URL, check localStorage
      const localToken = localStorage.getItem('token');
      if (localToken) {
        try {
          const decoded = jwtDecode<User>(localToken);
          if (decoded.exp * 1000 > Date.now()) {
            setUser({ ...decoded, dateJoined: decoded.createdAt });
            setAuthToken(localToken);
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

    // router.isReady is crucial to ensure router.query is populated
    if (router.isReady) {
      processToken();
    }
  }, [router.isReady, router.query.token, handleAuthSuccess]);
  
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
    handleTokenUpdate,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};