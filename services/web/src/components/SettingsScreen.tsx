import { useState, useCallback, useMemo } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { toast } from "sonner@2.0.3";
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Check,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import { User as UserType, UserSettings } from '../types';

interface SettingsScreenProps {
  user: UserType;
  settings: UserSettings;
  onBack: () => void;
  onUpdateUser: (updates: Partial<UserType>) => void;
  onUpdateSettings: (settings: UserSettings) => void;
}

export function SettingsScreen({ user, settings, onBack, onUpdateUser, onUpdateSettings }: SettingsScreenProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'preferences' | 'account'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = useCallback(() => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    onUpdateUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    });

    setIsEditing(false);
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    toast.success("Profile updated successfully");
  }, [formData, onUpdateUser]);

  const handleSettingChange = useCallback((category: keyof UserSettings, setting: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    };
    onUpdateSettings(newSettings);
    toast.success("Settings updated");
  }, [settings, onUpdateSettings]);

  const handleDeleteAccount = useCallback(() => {
    toast.success("Account deletion requested. You'll receive an email with further instructions.");
  }, []);

  const sections = useMemo(() => [
    { id: 'profile', label: 'Profile', icon: User, emoji: '👤' },
    { id: 'notifications', label: 'Notifications', icon: Bell, emoji: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: Shield, emoji: '🛡️' },
    { id: 'preferences', label: 'Preferences', icon: Settings, emoji: '⚙️' },
    { id: 'account', label: 'Account', icon: Trash2, emoji: '⚠️' }
  ], []);

  const renderProfileSection = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#6C0345' }}>
            Profile Information
          </h3>
          <p className="text-sm mt-1" style={{ color: '#DC6B19' }}>
            Update your personal details and password
          </p>
        </div>
        <Button
          className="rounded-xl border-2 transition-button"
          style={{
            backgroundColor: isEditing ? '#F7C566' : '#DC6B19',
            borderColor: '#6C0345',
            color: isEditing ? '#6C0345' : '#FFF8DC'
          }}
          size="sm"
          onClick={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              💾 Save Changes
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              ✏️ Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Personal Information Card */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-scale-in"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3" style={{ color: '#6C0345' }}>
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center border-2"
                style={{ 
                  backgroundColor: '#F7C566',
                  borderColor: '#DC6B19'
                }}
              >
                <User className="h-5 w-5" style={{ color: '#6C0345' }} />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2" style={{ color: '#6C0345' }}>
                  <User className="h-4 w-4" style={{ color: '#DC6B19' }} />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className={`rounded-xl border-2 transition-button ${!isEditing ? 'opacity-70' : ''}`}
                  style={{ 
                    backgroundColor: !isEditing ? '#F7C566' : '#FFF8DC',
                    borderColor: '#DC6B19',
                    color: '#6C0345'
                  }}
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2" style={{ color: '#6C0345' }}>
                  <Mail className="h-4 w-4" style={{ color: '#DC6B19' }} />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className={`rounded-xl border-2 transition-button ${!isEditing ? 'opacity-70' : ''}`}
                  style={{ 
                    backgroundColor: !isEditing ? '#F7C566' : '#FFF8DC',
                    borderColor: '#DC6B19',
                    color: '#6C0345'
                  }}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2" style={{ color: '#6C0345' }}>
                  <Phone className="h-4 w-4" style={{ color: '#DC6B19' }} />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  className={`rounded-xl border-2 transition-button ${!isEditing ? 'opacity-70' : ''}`}
                  style={{ 
                    backgroundColor: !isEditing ? '#F7C566' : '#FFF8DC',
                    borderColor: '#DC6B19',
                    color: '#6C0345'
                  }}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2" style={{ color: '#6C0345' }}>
                  <Check className="h-4 w-4" style={{ color: '#F7C566' }} />
                  Member Since
                </Label>
                <div 
                  className="px-3 py-2 border-2 rounded-xl text-sm"
                  style={{ 
                    backgroundColor: '#F7C566',
                    borderColor: '#DC6B19',
                    color: '#6C0345'
                  }}
                >
                  {new Date(user.dateJoined).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        {isEditing && (
          <Card 
            className="border-2 rounded-2xl shadow-lg animate-slide-in-right"
            style={{ borderColor: '#DC6B19', backgroundColor: '#F7C566' }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3" style={{ color: '#6C0345' }}>
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border-2"
                  style={{ 
                    backgroundColor: '#6C0345',
                    borderColor: '#DC6B19'
                  }}
                >
                  <Lock className="h-5 w-5" style={{ color: '#FFF8DC' }} />
                </div>
                🔐 Change Password
              </CardTitle>
              <p className="text-sm" style={{ color: '#6C0345' }}>
                Leave blank to keep your current password
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="flex items-center gap-2 mb-2" style={{ color: '#6C0345' }}>
                  <Lock className="h-4 w-4" style={{ color: '#DC6B19' }} />
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="pr-10 rounded-xl border-2"
                    style={{ 
                      backgroundColor: '#FFF8DC',
                      borderColor: '#DC6B19',
                      color: '#6C0345'
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-lg transition-button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: '#DC6B19' }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword" className="flex items-center gap-2 mb-2" style={{ color: '#6C0345' }}>
                    <Lock className="h-4 w-4" style={{ color: '#DC6B19' }} />
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="rounded-xl border-2"
                    style={{ 
                      backgroundColor: '#FFF8DC',
                      borderColor: '#DC6B19',
                      color: '#6C0345'
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2" style={{ color: '#6C0345' }}>
                    <Lock className="h-4 w-4" style={{ color: '#DC6B19' }} />
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="rounded-xl border-2"
                    style={{ 
                      backgroundColor: '#FFF8DC',
                      borderColor: '#DC6B19',
                      color: '#6C0345'
                    }}
                  />
                </div>
              </div>

              {formData.newPassword && (
                <div 
                  className="mt-4 p-4 border-2 rounded-xl"
                  style={{ 
                    backgroundColor: '#FFF8DC',
                    borderColor: '#DC6B19'
                  }}
                >
                  <p className="text-sm font-semibold mb-2" style={{ color: '#6C0345' }}>
                    🔒 Password Requirements:
                  </p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center gap-2 ${formData.newPassword.length >= 8 ? 'text-green-700' : 'text-red-700'}`}>
                      {formData.newPassword.length >= 8 ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full bg-red-300" />}
                      At least 8 characters
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-700' : 'text-red-700'}`}>
                      {/[A-Z]/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full bg-red-300" />}
                      One uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(formData.newPassword) ? 'text-green-700' : 'text-red-700'}`}>
                      {/[0-9]/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full bg-red-300" />}
                      One number
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-bold" style={{ color: '#6C0345' }}>
          🔔 Notification Preferences
        </h3>
        <p className="text-sm mt-1" style={{ color: '#DC6B19' }}>
          Control how and when you receive notifications
        </p>
      </div>
      
      <div className="grid gap-4">
        {[
          { 
            key: 'pushNotifications', 
            title: 'Push Notifications', 
            description: 'Receive notifications on your device',
            emoji: '📱'
          },
          { 
            key: 'emailNotifications', 
            title: 'Email Notifications', 
            description: 'Receive important updates via email',
            emoji: '📧'
          },
          { 
            key: 'bookingReminders', 
            title: 'Booking Reminders', 
            description: 'Get reminded about upcoming bookings',
            emoji: '⏰'
          },
          { 
            key: 'promotionalEmails', 
            title: 'Promotional Emails', 
            description: 'Receive offers and promotions',
            emoji: '💰'
          }
        ].map((item, index) => (
          <Card 
            key={item.key} 
            className="border-2 rounded-2xl shadow-lg transition-button hover:shadow-xl animate-fade-in-up"
            style={{ 
              borderColor: '#DC6B19', 
              backgroundColor: '#FFF8DC',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border-2"
                    style={{ 
                      backgroundColor: '#F7C566',
                      borderColor: '#DC6B19'
                    }}
                  >
                    <span className="text-lg">{item.emoji}</span>
                  </div>
                  <div>
                    <Label className="font-semibold" style={{ color: '#6C0345' }}>
                      {item.title}
                    </Label>
                    <p className="text-sm" style={{ color: '#DC6B19' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings?.notifications?.[item.key as keyof typeof settings.notifications] || false}
                  onCheckedChange={(checked) => handleSettingChange('notifications', item.key, checked)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-bold" style={{ color: '#6C0345' }}>
          🛡️ Privacy Settings
        </h3>
        <p className="text-sm mt-1" style={{ color: '#DC6B19' }}>
          Control your privacy and data sharing preferences
        </p>
      </div>
      
      <div className="grid gap-4">
        <Card 
          className="border-2 rounded-2xl shadow-lg"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border-2"
                  style={{ 
                    backgroundColor: '#F7C566',
                    borderColor: '#DC6B19'
                  }}
                >
                  <span className="text-lg">👁️</span>
                </div>
                <div>
                  <Label className="font-semibold" style={{ color: '#6C0345' }}>
                    Profile Visibility
                  </Label>
                  <p className="text-sm" style={{ color: '#DC6B19' }}>
                    Control who can see your profile
                  </p>
                </div>
              </div>
              <Select
                value={settings?.privacy?.profileVisibility || 'public'}
                onValueChange={(value: 'public' | 'private') => handleSettingChange('privacy', 'profileVisibility', value)}
              >
                <SelectTrigger 
                  className="w-32 rounded-xl border-2"
                  style={{ 
                    borderColor: '#DC6B19',
                    backgroundColor: '#F7C566',
                    color: '#6C0345'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌍 Public</SelectItem>
                  <SelectItem value="private">🔒 Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {[
          { 
            key: 'showBookingHistory', 
            title: 'Show Booking History', 
            description: 'Allow others to see your past bookings',
            emoji: '📋'
          },
          { 
            key: 'allowLocationTracking', 
            title: 'Location Tracking', 
            description: 'Allow app to access your location',
            emoji: '📍'
          }
        ].map((item, index) => (
          <Card 
            key={item.key} 
            className="border-2 rounded-2xl shadow-lg transition-button hover:shadow-xl animate-fade-in-up"
            style={{ 
              borderColor: '#DC6B19', 
              backgroundColor: '#FFF8DC',
              animationDelay: `${(index + 1) * 0.1}s`
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border-2"
                    style={{ 
                      backgroundColor: '#F7C566',
                      borderColor: '#DC6B19'
                    }}
                  >
                    <span className="text-lg">{item.emoji}</span>
                  </div>
                  <div>
                    <Label className="font-semibold" style={{ color: '#6C0345' }}>
                      {item.title}
                    </Label>
                    <p className="text-sm" style={{ color: '#DC6B19' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings?.privacy?.[item.key as keyof typeof settings.privacy] || false}
                  onCheckedChange={(checked) => handleSettingChange('privacy', item.key, checked)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-bold" style={{ color: '#6C0345' }}>
          ⚙️ App Preferences
        </h3>
        <p className="text-sm mt-1" style={{ color: '#DC6B19' }}>
          Customize your app experience
        </p>
      </div>
      
      <div className="grid gap-4">
        {[
          { 
            key: 'theme', 
            title: 'Theme', 
            description: 'Choose your preferred theme',
            emoji: '🎨',
            options: [
              { value: 'light', label: '☀️ Light' },
              { value: 'dark', label: '🌙 Dark' },
              { value: 'system', label: '⚙️ System' }
            ]
          },
          { 
            key: 'language', 
            title: 'Language', 
            description: 'Select your preferred language',
            emoji: '🌍',
            options: [
              { value: 'en', label: '🇺🇸 English' },
              { value: 'fr', label: '🇫🇷 Français' },
              { value: 'es', label: '🇪🇸 Español' }
            ]
          },
          { 
            key: 'currency', 
            title: 'Currency', 
            description: 'Display prices in your currency',
            emoji: '💰',
            options: [
              { value: 'CAD', label: '🇨🇦 CAD' },
              { value: 'USD', label: '🇺🇸 USD' },
              { value: 'EUR', label: '🇪🇺 EUR' }
            ]
          },
          { 
            key: 'distanceUnit', 
            title: 'Distance Unit', 
            description: 'Choose distance measurement',
            emoji: '📏',
            options: [
              { value: 'km', label: '📏 Kilometers' },
              { value: 'miles', label: '📐 Miles' }
            ]
          }
        ].map((item, index) => (
          <Card 
            key={item.key} 
            className="border-2 rounded-2xl shadow-lg transition-button hover:shadow-xl animate-fade-in-up"
            style={{ 
              borderColor: '#DC6B19', 
              backgroundColor: '#FFF8DC',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border-2"
                    style={{ 
                      backgroundColor: '#F7C566',
                      borderColor: '#DC6B19'
                    }}
                  >
                    <span className="text-lg">{item.emoji}</span>
                  </div>
                  <div>
                    <Label className="font-semibold" style={{ color: '#6C0345' }}>
                      {item.title}
                    </Label>
                    <p className="text-sm" style={{ color: '#DC6B19' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <Select
                  value={(settings?.preferences?.[item.key as keyof typeof settings.preferences] as string) || item.options[0]?.value || ''}
                  onValueChange={(value) => handleSettingChange('preferences', item.key, value)}
                >
                  <SelectTrigger 
                    className="w-40 rounded-xl border-2"
                    style={{ 
                      borderColor: '#DC6B19',
                      backgroundColor: '#F7C566',
                      color: '#6C0345'
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {item.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-bold" style={{ color: '#6C0345' }}>
          ⚠️ Account Management
        </h3>
        <p className="text-sm mt-1" style={{ color: '#DC6B19' }}>
          Manage your account and data
        </p>
      </div>
      
      <Card 
        className="border-2 rounded-2xl shadow-lg"
        style={{ 
          borderColor: '#DC6B19', 
          backgroundColor: '#F7C566'
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3" style={{ color: '#6C0345' }}>
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center border-2"
              style={{ 
                backgroundColor: '#DC6B19',
                borderColor: '#6C0345'
              }}
            >
              <Trash2 className="h-5 w-5" style={{ color: '#FFF8DC' }} />
            </div>
            ⚠️ Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold" style={{ color: '#6C0345' }}>
              Delete Account
            </h4>
            <p className="text-sm mb-4" style={{ color: '#6C0345' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="rounded-xl border-2 transition-button"
                  style={{
                    backgroundColor: '#DC6B19',
                    borderColor: '#6C0345',
                    color: '#FFF8DC'
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  🗑️ Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent 
                className="border-2 shadow-2xl rounded-2xl"
                style={{ 
                  borderColor: '#DC6B19',
                  backgroundColor: '#FFF8DC'
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle style={{ color: '#6C0345' }}>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription style={{ color: '#DC6B19' }}>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers, including:
                    <ul className="list-disc list-inside mt-3 space-y-1">
                      <li>Your profile information</li>
                      <li>Booking history</li>
                      <li>Reviews and ratings</li>
                      <li>Saved preferences</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel 
                    className="rounded-xl border-2"
                    style={{ 
                      borderColor: '#DC6B19',
                      backgroundColor: '#F7C566',
                      color: '#6C0345'
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-xl border-2"
                    style={{
                      backgroundColor: '#DC6B19',
                      borderColor: '#6C0345',
                      color: '#FFF8DC'
                    }}
                    onClick={handleDeleteAccount}
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'privacy':
        return renderPrivacySection();
      case 'preferences':
        return renderPreferencesSection();
      case 'account':
        return renderAccountSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8DC' }}>
      {/* Header */}
      <div 
        className="shadow-sm p-4 flex items-center justify-between"
        style={{ backgroundColor: '#6C0345' }}
      >
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="rounded-xl border-2 transition-button"
            style={{
              color: '#FFF8DC',
              borderColor: '#DC6B19',
              backgroundColor: 'transparent'
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-lg" style={{ color: '#FFF8DC' }}>
            ⚙️ Settings
          </h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Enhanced Sidebar */}
        <div 
          className="w-full lg:w-80 shadow-xl border-r-2"
          style={{ 
            backgroundColor: '#FFF8DC',
            borderColor: '#DC6B19'
          }}
        >
          <div className="p-6 space-y-3">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-left transition-button shadow-md hover:shadow-lg transform hover:scale-[1.02] animate-fade-in-up`}
                  style={{
                    backgroundColor: isActive ? '#DC6B19' : '#F7C566',
                    borderWidth: '2px',
                    borderColor: '#DC6B19',
                    color: isActive ? '#FFF8DC' : '#6C0345',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div 
                    className="p-2 rounded-xl border-2"
                    style={{ 
                      backgroundColor: isActive ? '#FFF8DC' : '#6C0345',
                      borderColor: isActive ? '#F7C566' : '#DC6B19'
                    }}
                  >
                    <span className="text-lg">{section.emoji}</span>
                  </div>
                  <span className="font-semibold">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}