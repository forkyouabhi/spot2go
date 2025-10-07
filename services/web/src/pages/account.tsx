import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../lib/api';
import { AccountScreen } from '../components/AccountScreen';
import { toast } from 'sonner';
import { Booking } from '../types';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchUserBookings = async () => {
      try {
        setLoadingData(true);
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
  
  if (!isAuthenticated || !user) {
      return null;
  }

  return (
    <AccountScreen
      user={{...user, createdAt: user.created_at, email: user.email}}
      bookings={bookings}
      onBack={() => router.push('/')}
      onNavigateToSettings={() => router.push('/settings')}
      onLogout={logout}
    />
  );
}
