import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SettingsScreen } from '../components/SettingsScreen';
import { toast } from 'sonner';
import { updateUser, updateUserPassword,updateUserSettings } from '../lib/api';
import { mockUserSettings } from '../data/mockData';
import { UserSettings } from '../types';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, handleTokenUpdate } = useAuth();
  
  const [settings, setSettings] = useState<UserSettings>(user?.settings || mockUserSettings);

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

      const response = await updateUser(user.id, profileData);
      const { token } = response.data;

      if (token) {
        handleTokenUpdate(token);
        toast.success('Profile updated successfully!');
      }

      // This is the section for "passwordData"
      if (newPassword && currentPassword) {
        // This object is the correct format for the API
        const passwordData = { currentPassword, newPassword };
        await updateUserPassword(user.id, passwordData);
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
      await updateUserSettings(user.id, newSettings);
      toast.success("Settings saved!");
    } catch (error) {
      toast.error("Failed to save settings.");
    }
  };
  
  if (loading || !isAuthenticated || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream">
            <p>Loading...</p>
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