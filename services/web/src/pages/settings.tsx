// services/web/src/pages/settings.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SettingsScreen } from '../components/SettingsScreen';
import { toast } from 'sonner';
import { updateUserProfile, changePassword, updateUserSettings } from '../lib/api';
import { UserSettings } from '../types';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, setAuthenticatedUser } = useAuth();

  // --- FIX: Default object that matches UserSettings interface ---
  const DEFAULT_SETTINGS: UserSettings = {
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      promotionalEmails: false,
      bookingReminders: true,
      
    },
    privacy: {
      profileVisibility: 'public',
      showBookingHistory: true,
      allowLocationTracking: false,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'CAD',
      distanceUnit: 'km',
    },
  };

  // Initialize settings safely
  const [settings, setSettings] = useState<UserSettings>(
    (user?.settings as UserSettings) || DEFAULT_SETTINGS
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
    if (user?.settings) {
        setSettings(user.settings);
    }
  }, [isAuthenticated, loading, router, user]);

  const handleUpdateUser = async (formData: any) => {
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    try {
      const { name, email, phone, currentPassword, newPassword } = formData;
      const profileData = { name, email, phone };

      const response = await updateUserProfile(profileData);

      // Update global context
      if (setAuthenticatedUser) {
          const updatedUser = response.data?.user || { ...user, ...profileData };
          setAuthenticatedUser(updatedUser);
      }

      toast.success('Profile updated successfully!');

      if (newPassword && currentPassword) {
        const passwordData = { currentPassword, newPassword };
        await changePassword(passwordData);
        toast.success('Password changed successfully!');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update settings. Please try again.';
      toast.error(errorMessage);
      console.error('Update failed:', error);
    }
  };

  const handleUpdateSettings = async (newSettings: UserSettings) => {
    if (!user) {
      toast.error("You must be logged in to update settings.");
      return;
    }

    setSettings(newSettings);

    try {
      await updateUserSettings(newSettings);
      // Update global context
      if (setAuthenticatedUser) {
          setAuthenticatedUser({ ...user, settings: newSettings });
      }
      toast.success("Settings saved!");
    } catch (error) {
      toast.error("Failed to save settings.");
    }
  };
  
  if (loading || !isAuthenticated || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream">
            <p className="text-brand-burgundy font-semibold">Loading...</p>
        </div>
    );
  }

  const userWithEmail = { ...user, email: user.email || '' };

  return (
    <SettingsScreen
      user={userWithEmail}
      settings={settings}
      onBack={() => router.push('/account')}
      onUpdateUser={handleUpdateUser}
      onUpdateSettings={handleUpdateSettings}
      onLogout={logout}
    />
  );
}