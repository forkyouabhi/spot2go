import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { setAuthToken, registerUser, loginUser } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: any;
  exp: number;
  name: string;
  role: 'customer' | 'owner' | 'admin';
  createdAt: string;
  dateJoined: string; // Ensure dateJoined is part of the type
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  // UPDATED: The register function now accepts a role.
  register: (name: string, email: string, password: string, role: 'customer' | 'owner') => Promise<User>;
  logout: () => void;
  // ADDED: A function to update user data in the context for real-time changes.
  updateUser: (userData: Partial<User>) => void;
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        if (decoded.exp * 1000 > Date.now()) {
          // Ensure the dateJoined field is populated from the token's createdAt
          setUser({ ...decoded, dateJoined: decoded.createdAt });
          setAuthToken(token);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (token: string): User => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode<User>(token);
    // Standardize the user object upon login/registration
    const fullUser = { ...decoded, dateJoined: decoded.createdAt };
    setUser(fullUser);
    setAuthToken(token);
    
    // UPDATED: Redirect based on user role, including admin for future use.
    if (decoded.role === 'owner') {
      router.push('/owner/dashboard');
    } else if (decoded.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
    return fullUser;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const response = await loginUser({ email, password });
    return handleAuthSuccess(response.data.token);
  };
    
  // UPDATED: The register function now passes the role to the API.
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

  // ADDED: Function to allow other parts of the app to update the user context.
  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...userData };
      
      // Also update the token in localStorage to persist the change
      const token = localStorage.getItem('token');
      if (token) {
        // This is a simplified update; in a real-world scenario, you'd get a new token from the backend
        const newToken = jwt.sign(
            {...updatedUser, exp: prevUser.exp}, 
            process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback_secret'
        );
        localStorage.setItem('token', newToken)
      }

      return updatedUser;
    });
  };

  const authContextValue = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

