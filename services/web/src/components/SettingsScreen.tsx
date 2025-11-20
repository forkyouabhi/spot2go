import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft, User, Bell, Shield,
  Save, Lock, LogOut, Loader2, Eye, EyeOff, Mail, Phone
} from "lucide-react";
import { User as UserType, UserSettings } from "../types";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { updateUserProfile, updateUserSettings, changePassword } from "../lib/api";

interface SettingsScreenProps {
  user: UserType;
  settings: UserSettings;
  onBack: () => void;
  onUpdateUser: (formData: any) => void;
  onUpdateSettings: (settings: UserSettings) => void;
  onLogout: () => void;
}

export function SettingsScreen({
  user,
  settings,
  onBack,
  onUpdateUser,
  onUpdateSettings,
  onLogout,
}: SettingsScreenProps) {
  const [activeSection, setActiveSection] = useState<"profile" | "notifications" | "privacy">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { permission, requestPermission } = usePushNotifications();

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    }));
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
        if (formData.name !== user.name || formData.phone !== user.phone) {
            const res = await updateUserProfile({ name: formData.name, phone: formData.phone });
            onUpdateUser(res.data.user);
            toast.success("Profile information updated.");
        }

        if (formData.newPassword) {
             if (formData.newPassword !== formData.confirmPassword) {
                toast.error("New passwords do not match.");
                setLoading(false);
                return;
             }
             if (!formData.currentPassword) {
                 toast.error("Current password is required to set a new one.");
                 setLoading(false);
                 return;
             }
             
             await changePassword({ 
                 currentPassword: formData.currentPassword, 
                 newPassword: formData.newPassword 
             });
             toast.success("Password changed successfully.");
             setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
        }
        setIsEditing(false);
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.error || "Failed to save changes.");
    } finally {
        setLoading(false);
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked && permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
    }

    const newSettings = {
        ...settings,
        notifications: { ...settings?.notifications, pushNotifications: checked }
    };
    
    try {
        onUpdateSettings(newSettings);
        await updateUserSettings({ notifications: newSettings.notifications });
        toast.success(`Push notifications ${checked ? 'enabled' : 'disabled'}.`);
    } catch (error) {
        toast.error("Failed to update settings.");
    }
  };

  const sections = useMemo(() => [
      { id: "profile", label: "Profile", icon: User },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "privacy", label: "Privacy & Security", icon: Shield },
  ], []);

  return (
    <div className="min-h-screen bg-[#FFF8DC]">
      {/* --- Header --- */}
      <div className="sticky top-0 z-40 bg-[#6C0345] text-[#FFF8DC] px-4 py-3 shadow-md flex justify-between items-center">
         <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={onBack} className="text-[#FFF8DC] hover:bg-white/10 rounded-full">
                 <ArrowLeft className="h-5 w-5" />
             </Button>
             <h1 className="font-bold text-lg">Settings</h1>
         </div>
         <Button variant="ghost" size="sm" onClick={onLogout} className="text-[#F7C566] hover:bg-white/10 hover:text-[#F7C566]">
             <LogOut className="h-4 w-4 mr-2" /> Logout
         </Button>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
              {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        activeSection === section.id 
                        ? 'bg-[#DC6B19] text-white shadow-md' 
                        : 'bg-white text-[#6C0345] hover:bg-[#DC6B19]/10 border border-transparent'
                    }`}
                  >
                      <section.icon className="h-5 w-5" />
                      <span>{section.label}</span>
                  </button>
              ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6">
              {activeSection === 'profile' && (
                  <div className="animate-in slide-in-from-right duration-300 space-y-6">
                      <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-[#6C0345]">Personal Info</h3>
                            <p className="text-sm text-[#DC6B19]">Manage your details and password</p>
                          </div>
                          <Button
                            className="rounded-xl shadow-sm"
                            style={{
                                backgroundColor: isEditing ? "#F7C566" : "#DC6B19",
                                color: isEditing ? "#6C0345" : "#FFF8DC",
                            }}
                            size="sm"
                            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? <><Save className="h-4 w-4 mr-2" /> Save Changes</> : <><User className="h-4 w-4 mr-2" /> Edit Profile</>)}
                          </Button>
                      </div>

                      <Card className="border-none shadow-sm bg-white">
                        <CardContent className="space-y-5 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-[#6C0345]">Full Name</Label>
                                    <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={!isEditing}
                                    className="bg-[#FFF8DC]/30 border-[#DC6B19]/20 focus:border-[#DC6B19]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#6C0345] flex items-center gap-2"><Mail className="h-3 w-3" /> Email</Label>
                                    <Input
                                    value={formData.email}
                                    disabled={true}
                                    className="bg-gray-50 text-gray-500 border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#6C0345] flex items-center gap-2"><Phone className="h-3 w-3" /> Phone</Label>
                                    <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    disabled={!isEditing}
                                    className="bg-[#FFF8DC]/30 border-[#DC6B19]/20 focus:border-[#DC6B19]"
                                    placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        </CardContent>
                      </Card>

                      {isEditing && (
                        <Card className="border border-[#DC6B19]/30 bg-[#FFF8DC]/50 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                            <CardHeader>
                                <CardTitle className="text-[#6C0345] text-base flex items-center gap-2">
                                    <Lock className="h-4 w-4" /> Change Password
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Label className="text-[#6C0345]">Current Password</Label>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="bg-white border-[#DC6B19]/30 pr-10"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-[#DC6B19]">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[#6C0345]">New Password</Label>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="bg-white border-[#DC6B19]/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[#6C0345]">Confirm New Password</Label>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="bg-white border-[#DC6B19]/30"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                      )}
                  </div>
              )}

              {activeSection === 'notifications' && (
                  <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div>
                        <h3 className="text-xl font-bold text-[#6C0345]">Notification Preferences</h3>
                        <p className="text-sm text-[#DC6B19]">Manage alerts and messages</p>
                    </div>
                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-[#6C0345]">Push Notifications</h4>
                                    <p className="text-sm text-gray-500">Receive updates on your device.</p>
                                </div>
                                <Switch 
                                    checked={settings?.notifications?.pushNotifications ?? false}
                                    onCheckedChange={handleNotificationToggle}
                                    className="data-[state=checked]:bg-[#DC6B19]"
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-[#6C0345]">Email Notifications</h4>
                                    <p className="text-sm text-gray-500">Receive booking confirmations.</p>
                                </div>
                                <Switch 
                                    disabled={true} 
                                    checked={true} 
                                    className="opacity-50 data-[state=checked]:bg-gray-400"
                                />
                            </div>
                        </CardContent>
                    </Card>
                  </div>
              )}

              {activeSection === 'privacy' && (
                   <Card className="border-none shadow-sm bg-white text-center p-12">
                       <div className="bg-[#FFF8DC] p-4 rounded-full w-fit mx-auto mb-4">
                           <Shield className="h-8 w-8 text-[#DC6B19]" />
                       </div>
                       <h3 className="text-lg font-bold text-[#6C0345]">Privacy Settings</h3>
                       <p className="text-gray-500 mt-2">Advanced privacy controls coming soon.</p>
                   </Card>
              )}
          </div>
      </div>
    </div>
  );
}