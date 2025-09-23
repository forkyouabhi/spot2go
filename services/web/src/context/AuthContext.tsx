import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { setAuthToken, registerUser, loginUser } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

/**
 * @typedef {Object} User
 * @property {number} exp
 * @property {any} [key]
 */

interface User {
  exp: number;
  [key: string]: any;
}

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {function} setUser
 * @property {boolean} isAuthenticated
 * @property {boolean} loading
 * @property {function(string, string): Promise<User>} login
 * @property {function(string, string, string): Promise<User>} register
 * @property {function(): void} logout
 */

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  loading: false,
  login: async () => {
    throw new Error('login function not initialized');
  },
  register: async () => {
    throw new Error('register function not initialized');
  },
  logout: () => {},
});

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && typeof decoded.exp === 'number' && decoded.exp * 1000 > Date.now()) {
          setUser(decoded as User);
          setAuthToken(token);
        } else {
          // Token expired or exp is missing
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
      const response = await loginUser({ email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const decoded: User = jwtDecode(token);
      setUser(decoded);
      setAuthToken(token);
      router.push('/');
      return decoded;
    };
    
    const register = async (name: string, email: string, password: string): Promise<User> => {
      const response = await registerUser({ name, email, password, role: 'customer' });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const decoded: User = jwtDecode(token);
      setUser(decoded);
      setAuthToken(token);
      router.push('/');
      return decoded;
    };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthToken(null);
    router.push('/login');
  };

  const authContextValue = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

