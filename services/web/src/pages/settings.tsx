import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SettingsScreen } from '../components/SettingsScreen';
import { toast } from 'sonner';
import { updateUser, updateUserPassword } from '../lib/api';
import { mockUserSettings } from '../data/mockData'; 
import { jwtDecode } from 'jwt-decode';

export default function SettingsPage() {
  const router = useRouter();
  // We get setUser from the context now
  const { user, isAuthenticated, loading, logout, setUser } = useAuth();
  const [settings, setSettings] = useState(mockUserSettings);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleUpdateUser = async (formData) => {
    try {
      const { name, email, phone, currentPassword, newPassword } = formData;
      const profileData = { name, email, phone };

      // The API now returns the updated user and a new token
      const response = await updateUser(user.id, profileData);
      const { token, user: updatedUser } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({ ...decoded, created_at: decoded.created_at });
      } else {
        // If no new token, just update the context with the returned user data
        setUser(prevUser => ({...prevUser, ...updatedUser}));
      }

      toast.success('Profile updated successfully!');

      if (newPassword && currentPassword) {
        const passwordData = { currentPassword, newPassword };
        await updateUserPassword(user.id, passwordData);
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update settings.';
      toast.error(errorMessage);
      console.error('Update failed:', error);
    }
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  if (loading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <SettingsScreen
      user={user}
      settings={settings}
      onBack={() => router.push('/account')}
      onUpdateUser={handleUpdateUser}
      onUpdateSettings={handleUpdateSettings}
      onLogout={logout}
    />
  );
}
