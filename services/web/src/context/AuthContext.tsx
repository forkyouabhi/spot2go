// services/web/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { setAuthToken, registerUser, loginUser, getUserBookmarks, addBookmark as apiAddBookmark, removeBookmark as apiRemoveBookmark } from '../lib/api';
import { jwtDecode } from 'jwt-decode';
import { toast } from "sonner"; 
import { User } from '../types';

interface JwtPayload {
  id: string;
  email: string; 
  name: string;
  role: 'customer' | 'owner' | 'admin';
  status: 'active' | 'pending_verification' | 'rejected';
  createdAt: string; 
  created_at: string; // Handle legacy field
  phone?: string;
  provider?: 'google' | 'apple' | 'email';
  exp: number;
  iat: number;
}

interface AuthContextType {
  user: User | null; 
  isAuthenticated: boolean;
  loading: boolean;
  bookmarks: string[];
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role: 'customer' | 'owner',
    phone?: string,
    businessLocation?: string
  ) => Promise<any>; 
  logout: () => void;
  handleTokenUpdate: (token: string) => void;
  handleAuthSuccess: (token: string, redirect?: boolean) => User; // Expose this
  addBookmark: (placeId: string) => Promise<void>;
  removeBookmark: (placeId: string) => Promise<void>;
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
  const [bookmarks, setBookmarks] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBookmarks = useCallback(async () => {
    try {
      const response = await getUserBookmarks();
      setBookmarks(response.data || []);
    } catch (error) {
      console.error("Failed to fetch bookmarks", error);
    }
  }, []);

  const handleAuthSuccess = useCallback((token: string, redirect: boolean = true) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    
    const decoded = jwtDecode<JwtPayload>(token);
    
    const fullUser: User = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
      createdAt: decoded.createdAt || decoded.created_at,
      dateJoined: decoded.createdAt || decoded.created_at,
      phone: decoded.phone,
      provider: decoded.provider,
      settings: undefined
    };
    setUser(fullUser);
    
    if (fullUser.role === 'customer') {
      fetchBookmarks();
    }

    if (redirect) {
      const targetPath = decoded.role === 'owner' ? '/owner/dashboard' : decoded.role === 'admin' ? '/admin/dashboard' : '/';
      router.replace(targetPath);
    }
    return fullUser;
  }, [router, fetchBookmarks]); 

  // This function is for non-redirect updates (e.g., profile edit)
  const handleTokenUpdate = useCallback((token: string) => {
    handleAuthSuccess(token, false);
  }, [handleAuthSuccess]);

  useEffect(() => {
    const processToken = () => {
      // --- FIX: REMOVED logic that checked router.query.token ---
      // This useEffect is now ONLY responsible for checking localStorage on load

      const localToken = localStorage.getItem('token');
      if (localToken) {
        try {
          const decoded = jwtDecode<JwtPayload>(localToken);
          if (decoded.exp * 1000 > Date.now()) {
            // Log in, but DO NOT redirect, just load state
            handleAuthSuccess(localToken, false); 
          } else {
            // Token is expired
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

    // We no longer depend on router.query.token
    if (router.isReady) {
      processToken();
    }
  }, [router.isReady, handleAuthSuccess]); // <-- Dependency array updated
  
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await loginUser({ email, password });
      // handleAuthSuccess will redirect by default
      return handleAuthSuccess(response.data.token);
    } catch (error: any) {
      
      if (error.response?.data?.needsVerification) {
        toast.error(error.response.data.error);
        router.push(`/verify-email?email=${email}`);
      }
      throw error; // Re-throw for the form to handle
    }
  };
    
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'customer' | 'owner',
    phone?: string,
    businessLocation?: string
  ): Promise<any> => {
    const response = await registerUser({ name, email, password, role, phone, businessLocation });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setBookmarks([]);
    setAuthToken(null);
    router.push('/login');
  };

  const addBookmark = async (placeId: string) => {
    try {
      const response = await apiAddBookmark(placeId);
      setBookmarks((prev) => [...prev, response.data.placeId.toString()]);
      toast.success("Bookmarked!");
    } catch (error) {
      toast.error("Failed to add bookmark.");
    }
  };

  const removeBookmark = async (placeId: string) => {
    try {
      const response = await apiRemoveBookmark(placeId);
      setBookmarks((prev) => prev.filter((id) => id !== response.data.placeId.toString()));
      toast.success("Bookmark removed.");
    } catch (error) {
      toast.error("Failed to remove bookmark.");
    }
  };

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    bookmarks,
    login,
    register,
    logout,
    handleTokenUpdate,
    handleAuthSuccess, 
    addBookmark, 
    removeBookmark,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};