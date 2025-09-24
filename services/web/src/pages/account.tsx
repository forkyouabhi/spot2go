import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../lib/api';
import { AccountScreen } from '../components/AccountScreen';
import { toast } from 'sonner';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchUserBookings = async () => {
      try {
        const response = await getUserBookings();
        setBookings(response.data);
      } catch (error) {
        toast.error('Could not fetch your bookings.');
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserBookings();
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || (isAuthenticated && loadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8DC' }}>
        <p className="font-semibold" style={{ color: '#6C0345' }}>Loading Your Account...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
      return null;
  }

  return (
    <AccountScreen
      user={user}
      bookings={bookings}
      onBack={() => router.push('/')}
      // UPDATED: This now correctly navigates to the new settings page.
      onNavigateToSettings={() => router.push('/settings')}
    />
  );
}

