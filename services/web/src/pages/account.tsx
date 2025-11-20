// services/web/src/pages/account.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import AccountScreen from '../components/AccountScreen'; // <--- FIXED: Default Import
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
        // Redirect non-customers to their respective dashboards
        const destination = user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard';
        toast.error("Redirecting to your dashboard...");
        router.replace(destination);
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <p className="font-semibold text-brand-burgundy">Loading Account...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Account | Spot2Go</title>
      </Head>
      {/* AccountScreen is now self-contained and handles its own state */}
      <AccountScreen />
    </>
  );
}