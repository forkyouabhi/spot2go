import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  getUserBookmarks, 
  addBookmark as apiAddBookmark, 
  removeBookmark as apiRemoveBookmark 
} from '../lib/api';
import axios from 'axios';
import { toast } from "sonner"; 
import { User } from '../types';

interface AuthContextType {
  user: User | null; 
  isAuthenticated: boolean;
  loading: boolean;
  bookmarks: string[];
  login: (email: string, password: string) => Promise<User>;
  
  // --- FIX: Added 'businessLocation' to the interface definition ---
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
  setAuthenticatedUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBookmarks = useCallback(async () => {
    try {
      const response = await getUserBookmarks();
      setBookmarks(response.data || []);
    } catch (error) { setBookmarks([]); }
  }, []);
  
  useEffect(() => {
    if (router.isReady) {
      const localUserString = localStorage.getItem('user');
      if (localUserString) {
        const localUser = JSON.parse(localUserString) as User;
        setUser(localUser);
        if (localUser.role === 'customer') fetchBookmarks();
      }
      setLoading(false);
    }
  }, [router.isReady, fetchBookmarks]); 
  
  const setAuthenticatedUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (newUser.role === 'customer') fetchBookmarks();
  };

  const refreshUser = async () => {
    const localUserString = localStorage.getItem('user');
    if (localUserString) setUser(JSON.parse(localUserString));
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await loginUser({ email, password });
      const user = response.data.user;
      setAuthenticatedUser(user);
      const targetPath = user.role === 'owner' ? '/owner/dashboard' : '/';
      router.replace(targetPath);
      return user;
    } catch (error: any) {
      if (error.response?.data?.needsVerification) throw error;
      throw error;
    }
  };
    
  // --- FIX: Added 'businessLocation' to implementation ---
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'customer' | 'owner', 
    phone?: string, 
    businessLocation?: string
  ) => {
    // Pass businessLocation to the API call
    return (await registerUser({ name, email, password, role, phone, businessLocation })).data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Server logout failed (cookie might be gone)", err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setBookmarks([]);
      router.push('/login');
    }
  };

  const addBookmark = async (placeId: string) => {
    try {
      const response = await apiAddBookmark(placeId);
      setBookmarks((prev) => [...prev, response.data.placeId.toString()]);
      toast.success("Bookmarked!");
    } catch (error) { toast.error("Failed to add bookmark."); }
  };

  const removeBookmark = async (placeId: string) => {
    try {
      const response = await apiRemoveBookmark(placeId);
      setBookmarks((prev) => prev.filter((id) => id !== response.data.placeId.toString()));
      toast.success("Bookmark removed.");
    } catch (error) { toast.error("Failed to remove bookmark."); }
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, loading, bookmarks,
      login, register, logout, addBookmark, removeBookmark, setAuthenticatedUser, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};