// services/web/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { setAuthToken, registerUser, loginUser, getUserBookmarks, addBookmark as apiAddBookmark, removeBookmark as apiRemoveBookmark } from '../lib/api';
import { jwtDecode } from 'jwt-decode';
import { toast } from "sonner"; // Import toast

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
  bookmarks: string[];
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role: 'customer' | 'owner',
    phone?: string,
    businessLocation?: string
  ) => Promise<any>; // Changed from Promise<User>
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
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]); // <-- 3. ADD BOOKMARKS STATE
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 4. Create a function to fetch bookmarks
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
    const decoded = jwtDecode<User>(token);
    const fullUser = { ...decoded, dateJoined: decoded.createdAt, status: decoded.status };
    setUser(fullUser);

    if (fullUser.role === 'customer') { // Fetch bookmarks only for customers
      fetchBookmarks();
    }

    if (redirect) {
      const targetPath = decoded.role === 'owner' ? '/owner/dashboard' : decoded.role === 'admin' ? '/admin/dashboard' : '/';
      router.replace(targetPath);
    }
    return fullUser;
  }, [router, fetchBookmarks]); // <-- 5. Add dependency

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
            // Use handleAuthSuccess to set user AND fetch bookmarks
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
      // --- MODIFIED: Handle the new "needsVerification" error ---
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