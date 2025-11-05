// services/web/src/pages/account.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, getPlaces } from '../lib/api';
import { AccountScreen } from '../components/AccountScreen';
import { toast } from 'sonner';
import { Booking, StudyPlace } from '../types';
import { Loader2 } from 'lucide-react'; 

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout, bookmarks } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<StudyPlace[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchPageData = async () => {
      try {
        setLoadingData(true);
        // Fetch bookings and places in parallel
        const [bookingsRes, placesRes] = await Promise.all([
          getUserBookings(),
          getPlaces(null, null) // Fetch all places
        ]);
        
        setBookings(bookingsRes.data);

        // Filter all places to find the bookmarked ones
        const allPlaces: StudyPlace[] = placesRes.data;
        const filteredBookmarks = allPlaces.filter(place => 
          bookmarks.includes(place.id.toString())
        );
        setBookmarkedPlaces(filteredBookmarks);

      } catch (error) {
        toast.error('Could not fetch your account data.');
        console.error('Failed to fetch account data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPageData();
  }, [isAuthenticated, authLoading, router, bookmarks]); // Add bookmarks as a dependency

  if (authLoading || (isAuthenticated && loadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8DC' }}>
        {/* Use the branded loader */}
        <Loader2 className="h-12 w-12 animate-spin text-brand-orange" />
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
      return null;
  }

  // Pass the user's email and createdAt from the token
  return (
    <AccountScreen
      user={{...user, createdAt: user.createdAt, email: user.email}}
      bookings={bookings}      
      bookmarkedPlaces={bookmarkedPlaces}
      onBack={() => router.push('/')}
      onNavigateToSettings={() => router.push('/settings')}
      onLogout={logout}
    />
  );
}