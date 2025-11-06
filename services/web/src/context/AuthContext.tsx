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
  const [user, setUser] = useState<User | null>(null); // <-- Uses imported User type
  const [bookmarks, setBookmarks] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBookmarks = useCallback(async () => {
    try {
      const response = await getUserBookmarks();
      setBookmarks(response.data || []); // API returns string[]
    } catch (error) {
      console.error("Failed to fetch bookmarks", error);
      // Don't toast here, it's a background task
    }
  }, []);

  const handleAuthSuccess = useCallback((token: string, redirect: boolean = true) => {
    localStorage.setItem('token', token);
    setAuthToken(token);

    
    const decoded = jwtDecode<JwtPayload>(token);
    
    const fullUser: User = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email, // <-- Now explicitly included
      role: decoded.role,
      status: decoded.status,
      createdAt: decoded.createdAt || decoded.created_at, // Handle both
      dateJoined: decoded.createdAt || decoded.created_at, // Use createdAt for dateJoined

      // Add optional fields from JWT if they exist
      phone: decoded.phone,
      provider: decoded.provider,
      settings: undefined
    };
    setUser(fullUser);
    

    if (fullUser.role === 'customer') { // Fetch bookmarks only for customers
      fetchBookmarks();
    }

    if (redirect) {
      const targetPath = decoded.role === 'owner' ? '/owner/dashboard' : decoded.role === 'admin' ? '/admin/dashboard' : '/';
      router.replace(targetPath);
    }
    return fullUser;
  }, [router, fetchBookmarks]); 

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
          // --- FIX 5: Decode as JwtPayload here too ---
          const decoded = jwtDecode<JwtPayload>(localToken);
          if (decoded.exp * 1000 > Date.now()) {
           
            handleAuthSuccess(localToken, false); 
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
    try {
      const response = await loginUser({ email, password });
      return handleAuthSuccess(response.data.token);
    } catch (error: any) {
      
      if (error.response?.data?.needsVerification) {
        toast.error(error.response.data.error);
        router.push(`/verify-email?email=${email}`);
      }
      throw error; // Re-throw for the form to handle
    }
  };
    
  // --- MODIFIED: register function no longer logs in ---
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'customer' | 'owner',
    phone?: string,
    businessLocation?: string
  ): Promise<any> => {
    // It just calls the API and returns the response (e.g., { message, email })
    const response = await registerUser({ name, email, password, role, phone, businessLocation });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setBookmarks([]); // <-- 6. CLEAR BOOKMARKS ON LOGOUT
    setAuthToken(null);
    router.push('/login');
  };

  // --- 7. IMPLEMENT BOOKMARK HANDLERS ---
  const addBookmark = async (placeId: string) => {
    try {
      const response = await apiAddBookmark(placeId);
      // Ensure we're using strings for comparison
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
    addBookmark, 
    removeBookmark,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};