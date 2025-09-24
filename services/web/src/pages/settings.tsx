import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SettingsScreen } from '../components/SettingsScreen';
import { toast } from 'sonner';
import { updateUser, updateUserPassword } from '../lib/api';
import { mockUserSettings } from '../data/mockData'; // Using mock settings for now

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  // In a real app, you would fetch and manage user settings
  const [settings, setSettings] = useState(mockUserSettings);

  useEffect(() => {
    // If loading is finished and user is not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleUpdateUser = async (formData) => {
    try {
      // Destructure formData to separate profile and password data
      const { name, email, phone, currentPassword, newPassword } = formData;
      
      const profileData = { name, email, phone };
      const passwordData = { currentPassword, newPassword };

      // Update profile information
      await updateUser(user.id, profileData);
      toast.success('Profile updated successfully!');

      // Handle password change if a new password was provided
      if (passwordData.newPassword) {
        await updateUserPassword(user.id, passwordData);
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update settings. Please try again.';
      toast.error(errorMessage);
      console.error('Update failed:', error);
    }
  };

  const handleUpdateSettings = (newSettings) => {
    // This would typically involve an API call to save settings
    setSettings(newSettings);
    // toast.success("Preferences updated!"); // Already handled in the component
  };

  if (loading || !isAuthenticated) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  return (
    <SettingsScreen
      user={user}
      settings={settings}
      onBack={() => router.push('/account')}
      onUpdateUser={handleUpdateUser}
      onUpdateSettings={handleUpdateSettings}
    />
  );
}

