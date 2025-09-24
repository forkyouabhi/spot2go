import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { SettingsScreen } from '../components/SettingsScreen';
import { toast } from 'sonner';
import { updateUser, updateUserPassword } from '../lib/api';

// This is a protected route for user settings.
export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, setUser } = useAuth();
  
  // Mock settings for now, as they are not yet saved in the database.
  // In a future step, these would be fetched from the backend.
  const [settings, setSettings] = React.useState<UserSettings>({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      bookingReminders: true,
      promotionalEmails: false,
    },
    privacy: {
      profileVisibility: 'public',
      showBookingHistory: true,
      allowLocationTracking: true,
    },
    preferences: {
      theme: 'system',
      language: 'en',
      currency: 'CAD',
      distanceUnit: 'km',
    },
  });

  // Redirect to login if the user is not authenticated.
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleUpdateUser = async (formData) => {
    try {
      // Handle profile info update
      const profileUpdates = { name: formData.name, email: formData.email, phone: formData.phone };
      const response = await updateUser(user.id, profileUpdates);
      setUser(response.data); // Update user in context
      toast.success('Profile updated successfully!');

      // Handle password change if a new password was provided
      if (formData.newPassword) {
        await updateUserPassword(user.id, { newPassword: formData.newPassword, oldPassword: formData.oldPassword });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred.';
      toast.error(`Update failed: ${errorMessage}`);
      console.error('Failed to update user:', error);
    }
  };
  
  const handleUpdateSettings = (newSettings) => {
    // For now, this just updates local state. Later, it would call an API endpoint.
    setSettings(newSettings);
    toast.success("Settings updated locally.");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8DC' }}>
        <p className="font-semibold" style={{ color: '#6C0345' }}>Loading Settings...</p>
      </div>
    );
  }

  return (
    <SettingsScreen
      user={{
        id: user?.id ?? '',
        email: user?.email ?? '',
        created_at: user?.created_at ?? '',
        ...user
      }}
      settings={settings}
      onBack={() => router.push('/account')}
      onUpdateUser={handleUpdateUser}
      onUpdateSettings={handleUpdateSettings}
    />
  );
}
