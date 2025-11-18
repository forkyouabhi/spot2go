// services/web/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { registerUser, loginUser, getUserBookmarks, addBookmark as apiAddBookmark, removeBookmark as apiRemoveBookmark } from '../lib/api';
import axios from 'axios';
import { toast } from "sonner"; 
import { User } from '../types';

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
  addBookmark: (placeId: string) => Promise<void>;
  removeBookmark: (placeId: string) => Promise<void>;
  // --- NEW: Allow manual user setting for auto-login flows ---
  setAuthenticatedUser: (user: User) => void;
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
      console.warn("Could not fetch bookmarks (user might not be logged in or session expired).");
      setBookmarks([]);
    }
  }, []);
  
  const checkSessionAndLoadUser = useCallback(async () => {
    const localUserString = localStorage.getItem('user');
    if (!localUserString) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      const localUser = JSON.parse(localUserString) as User;
      setUser(localUser);
      
      if (localUser.role === 'customer') {
          await fetchBookmarks();
      }
      
    } catch (error) {
        console.log("Session invalid. Clearing local user data.");
        localStorage.removeItem('user');
        setUser(null);
        setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [fetchBookmarks]); 

  useEffect(() => {
    if (router.isReady) {
      checkSessionAndLoadUser();
    }
  }, [router.isReady, checkSessionAndLoadUser]); 
  
  // --- NEW: Implementation of setAuthenticatedUser ---
  const setAuthenticatedUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    // Optionally fetch bookmarks if it's a customer
    if (newUser.role === 'customer') {
        fetchBookmarks();
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await loginUser({ email, password });
      const user = response.data.user;
      
      setAuthenticatedUser(user); // Use the shared setter

      const targetPath = user.role === 'owner' ? '/owner/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/';
      router.replace(targetPath);
      return user;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.needsVerification) {
        throw error; 
      }
      throw error;
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
    localStorage.removeItem('user');
    setUser(null);
    setBookmarks([]);
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
    addBookmark, 
    removeBookmark,
    setAuthenticatedUser, // Export the new function
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};