import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Settings,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  Camera,
  Lock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { updateUserProfile, changePassword, updateUserSettings } from '../lib/api'; 

export default function AccountScreen() {
  const { user, logout, setAuthenticatedUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    push: true,
    marketing: false
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
        toast.error("Name is required");
        return;
    }
    setIsLoading(true);
    try {
      const res = await updateUserProfile({
        name: profileForm.name,
        phone: profileForm.phone
      });
      setAuthenticatedUser({ ...user!, name: res.data.user.name, phone: res.data.user.phone });
      toast.success("Profile updated successfully!");
      setEditProfileOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setIsLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      toast.success("Password changed! Please login again.");
      setSecurityOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      logout();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
      setIsLoading(true);
      try {
          await updateUserSettings({
              notifications: notificationPrefs
          });
          toast.success("Preferences saved");
          setNotificationsOpen(false);
      } catch (err: any) {
          toast.error("Failed to save preferences");
      } finally {
          setIsLoading(false);
      }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-in fade-in duration-500">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="pt-safe px-6 pb-4">
           <h1 className="text-2xl font-bold text-brand-burgundy mt-4">Account</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="bg-brand-burgundy/5 h-24 w-full relative">
             <div className="absolute -bottom-10 left-6">
               <div className="relative group cursor-pointer">
                 <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                   <AvatarImage src={user.avatar || ""} />
                   <AvatarFallback className="bg-brand-orange text-white text-xl font-bold">
                     {user.name.charAt(0)}
                   </AvatarFallback>
                 </Avatar>
                 <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow border border-gray-100 text-gray-600 hover:text-brand-orange transition-colors">
                   <Camera className="w-3 h-3" />
                 </div>
               </div>
             </div>
          </div>
          <div className="pt-12 px-6 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
              
              <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-brand-burgundy border-brand-burgundy/20 hover:bg-brand-burgundy/5">
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95%] max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your personal details here.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        value={profileForm.name} 
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone"
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2 opacity-60">
                      <Label>Email (Cannot change)</Label>
                      <div className="flex items-center px-3 py-2 border rounded-md bg-gray-50 text-gray-500 text-sm">
                          <Lock className="w-3 h-3 mr-2" />
                          {profileForm.email}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full bg-brand-burgundy">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="mt-4 flex gap-2">
               {user.role === 'owner' && <Badge className="bg-brand-orange hover:bg-brand-orange/90">Business Owner</Badge>}
               <Badge variant="outline" className="border-green-600 text-green-600 bg-green-50">Verified Account</Badge>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">General</h3>
          
          <Card className="border-none shadow-sm overflow-hidden divide-y divide-gray-50">
             <SettingsItem icon={UserIcon} label="Personal Information" onClick={() => setEditProfileOpen(true)} />
             
             <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
                <DialogTrigger asChild>
                    <div className="w-full text-left">
                       <SettingsItem icon={Shield} label="Security & Password" />
                    </div>
                </DialogTrigger>
                <DialogContent className="w-[95%] max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Must be at least 8 chars with a number.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input 
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input 
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input 
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleChangePassword} disabled={isLoading} className="w-full bg-brand-burgundy">
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Update Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>

             <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                 <DialogTrigger asChild>
                    <div className="w-full text-left">
                        <SettingsItem icon={Bell} label="Notifications" />
                    </div>
                 </DialogTrigger>
                 <DialogContent className="w-[95%] max-w-md rounded-2xl">
                     <DialogHeader>
                         <DialogTitle>Notification Preferences</DialogTitle>
                     </DialogHeader>
                     <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Notifications</Label>
                                <p className="text-xs text-gray-500">Booking confirmations</p>
                            </div>
                            <Switch 
                                checked={notificationPrefs.email}
                                onCheckedChange={(c) => setNotificationPrefs(p => ({...p, email: c}))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Marketing</Label>
                                <p className="text-xs text-gray-500">Offers & updates</p>
                            </div>
                            <Switch 
                                checked={notificationPrefs.marketing}
                                onCheckedChange={(c) => setNotificationPrefs(p => ({...p, marketing: c}))}
                            />
                        </div>
                     </div>
                     <DialogFooter>
                         <Button onClick={handleUpdateNotifications} disabled={isLoading} className="w-full bg-brand-burgundy">
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Save Preferences
                         </Button>
                     </DialogFooter>
                 </DialogContent>
             </Dialog>

             <SettingsItem icon={CreditCard} label="Payment Methods" isComingSoon />
          </Card>
        </div>

        <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Support</h3>
            <Card className="border-none shadow-sm overflow-hidden divide-y divide-gray-50">
                <SettingsItem icon={HelpCircle} label="Help & Support" onClick={() => window.open('mailto:support@spot2go.app')} />
            </Card>
        </div>

        <div className="pt-4">
            <Button 
                variant="ghost" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 h-12 font-medium"
                onClick={logout}
            >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
            </Button>
             <p className="text-center text-gray-400 text-xs mt-4">v1.0.2 • Spot2Go Inc.</p>
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ icon: Icon, label, onClick, isComingSoon }: { icon: any, label: string, onClick?: () => void, isComingSoon?: boolean }) {
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left group"
            disabled={isComingSoon}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-brand-burgundy/5 text-brand-burgundy group-hover:bg-brand-burgundy/10 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`font-medium ${isComingSoon ? 'text-gray-400' : 'text-gray-900'}`}>
                    {label}
                </span>
            </div>
            <div className="flex items-center">
                {isComingSoon && <Badge variant="secondary" className="mr-2 text-[10px]">Soon</Badge>}
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
            </div>
        </button>
    )
}