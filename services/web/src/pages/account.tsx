// services/web/src/pages/account.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import AccountScreen from '../components/AccountScreen'; // Default import matches export default above
import { toast } from 'sonner';
import Head from 'next/head';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.role && user.role !== 'customer') {
        const destination = user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard';
        router.replace(destination);
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8DC]">
        <p className="font-semibold text-[#6C0345]">Loading Account...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Account | Spot2Go</title>
      </Head>
      <AccountScreen />
    </>
  );
}