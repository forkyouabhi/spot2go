// services/web/src/components/SettingsScreen.tsx
import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "sonner";
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
  Phone,
  LogOut,
} from "lucide-react";
import { User as UserType, UserSettings } from "../types";

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
  const [activeSection, setActiveSection] = useState<
    "profile" | "notifications" | "privacy" | "preferences" | "account"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSaveProfile = useCallback(() => {
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error("New passwords don't match");
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      toast.error("Please enter your current password to set a new one.");
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    
    onUpdateUser(formData);

    setIsEditing(false);
    // Clear password fields from local state after saving for security
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  }, [formData, onUpdateUser]);

  const handleSettingChange = useCallback(
    (category: keyof UserSettings, setting: string, value: any) => {
      const newSettings = {
        ...settings,
        [category]: {
          ...settings[category],
          [setting]: value,
        },
      };
      onUpdateSettings(newSettings);
      toast.success("Settings updated");
    },
    [settings, onUpdateSettings]
  );

  const handleDeleteAccount = useCallback(() => {
    toast.success(
      "Account deletion requested. You'll receive an email with further instructions."
    );
  }, []);

  const sections = useMemo(
    () => [
      { id: "profile", label: "Profile", icon: User, emoji: "👤" },
      { id: "notifications", label: "Notifications", icon: Bell, emoji: "🔔" },
      { id: "privacy", label: "Privacy", icon: Shield, emoji: "🛡️" },
      { id: "preferences", label: "Preferences", icon: Settings, emoji: "⚙️" },
      { id: "account", label: "Account", icon: Trash2, emoji: "⚠️" },
    ],
    []
  );

  const renderProfileSection = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold" style={{ color: "#6C0345" }}>
            Profile Information
          </h3>
          <p className="text-sm mt-1" style={{ color: "#DC6B19" }}>
            Update your personal details and password
          </p>
        </div>
        <Button
          className="rounded-xl border-2 transition-button"
          style={{
            backgroundColor: isEditing ? "#F7C566" : "#DC6B19",
            borderColor: "#6C0345",
            color: isEditing ? "#6C0345" : "#FFF8DC",
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
              Save Changes
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card
          className="border-2 rounded-2xl shadow-lg animate-scale-in"
          style={{ borderColor: "#DC6B19", backgroundColor: "#FFF8DC" }}
        >
          <CardHeader className="pb-4">
            <CardTitle
              className="flex items-center gap-3"
              style={{ color: "#6C0345" }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center border-2"
                style={{
                  backgroundColor: "#F7C566",
                  borderColor: "#DC6B19",
                }}
              >
                <User className="h-5 w-5" style={{ color: "#6C0345" }} />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="name"
                  className="flex items-center gap-2 mb-2"
                  style={{ color: "#6C0345" }}
                >
                  <User className="h-4 w-4" style={{ color: "#DC6B19" }} />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={`rounded-xl border-2 transition-button ${
                    !isEditing ? "opacity-70" : ""
                  }`}
                  style={{
                    backgroundColor: !isEditing ? "#F7C566" : "#FFF8DC",
                    borderColor: "#DC6B19",
                    color: "#6C0345",
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 mb-2"
                  style={{ color: "#6C0345" }}
                >
                  <Mail className="h-4 w-4" style={{ color: "#DC6B19" }} />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={`rounded-xl border-2 transition-button ${
                    !isEditing ? "opacity-70" : ""
                  }`}
                  style={{
                    backgroundColor: !isEditing ? "#F7C566" : "#FFF8DC",
                    borderColor: "#DC6B19",
                    color: "#6C0345",
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="flex items-center gap-2 mb-2"
                  style={{ color: "#6C0345" }}
                >
                  <Phone className="h-4 w-4" style={{ color: "#DC6B19" }} />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  className={`rounded-xl border-2 transition-button ${
                    !isEditing ? "opacity-70" : ""
                  }`}
                  style={{
                    backgroundColor: !isEditing ? "#F7C566" : "#FFF8DC",
                    borderColor: "#DC6B19",
                    color: "#6C0345",
                  }}
                />
              </div>

              <div>
                <Label
                  className="flex items-center gap-2 mb-2"
                  style={{ color: "#6C0345" }}
                >
                  <Check className="h-4 w-4" style={{ color: "#F7C566" }} />
                  Member Since
                </Label>
                <div
                  className="px-3 py-2 border-2 rounded-xl text-sm"
                  style={{
                    backgroundColor: "#F7C566",
                    borderColor: "#DC6B19",
                    color: "#6C0345",
                  }}
                >
                  {/* --- THIS IS THE FIX --- */}
                  {/* Changed user.created_at to user.createdAt */}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    
                })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Card
            className="border-2 rounded-2xl shadow-lg animate-slide-in-right"
            style={{ borderColor: "#DC6B19", backgroundColor: "#F7C566" }}
          >
            <CardHeader className="pb-4">
              <CardTitle
                className="flex items-center gap-3"
                style={{ color: "#6C0345" }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border-2"
                  style={{
                    backgroundColor: "#6C0345",
                    borderColor: "#DC6B19",
                  }}
                >
                  <Lock className="h-5 w-5" style={{ color: "#FFF8DC" }} />
                </div>
                Change Password
              </CardTitle>
              <p className="text-sm" style={{ color: "#6C0345" }}>
                Leave blank to keep your current password
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="currentPassword"
                  className="flex items-center gap-2 mb-2"
                  style={{ color: "#6C0345" }}
                >
                  <Lock className="h-4 w-4" style={{ color: "#DC6B19" }} />
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                    className="pr-10 rounded-xl border-2"
                    style={{
                      backgroundColor: "#FFF8DC",
                      borderColor: "#DC6B19",
                      color: "#6C0345",
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-lg transition-button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: "#DC6B19" }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="newPassword"
                    className="flex items-center gap-2 mb-2"
                    style={{ color: "#6C0345" }}
                  >
                    <Lock className="h-4 w-4" style={{ color: "#DC6B19" }} />
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                    className="rounded-xl border-2"
                    style={{
                      backgroundColor: "#FFF8DC",
                      borderColor: "#DC6B19",
                      color: "#6C0345",
                    }}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 mb-2"
                    style={{ color: "#6C0345" }}
                  >
                    <Lock className="h-4 w-4" style={{ color: "#DC6B19" }} />
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    className="rounded-xl border-2"
                    style={{
                      backgroundColor: "#FFF8DC",
                      borderColor: "#DC6B19",
                      color: "#6C0345",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      // ... other cases
      default:
        return (
          <Card
            className="border-2 rounded-2xl shadow-lg text-center p-12"
            style={{ borderColor: "#DC6B19", backgroundColor: "#FFF8DC" }}
          >
            <CardTitle
              className="text-xl font-bold"
              style={{ color: "#6C0345" }}
            >
              Coming Soon
            </CardTitle>
            <CardContent className="p-0 pt-4">
              <p className="text-brand-orange">
                This settings section is under construction.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF8DC" }}>
      <div
        className="shadow-sm p-4 flex items-center justify-between"
        style={{ backgroundColor: "#6C0345" }}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-xl border-2 transition-button"
            style={{
              color: "#FFF8DC",
              borderColor: "#DC6B19",
              backgroundColor: "transparent",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-lg" style={{ color: "#FFF8DC" }}>
            Settings
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="rounded-xl border-2 transition-button"
          style={{
            color: "#F7C566",
            borderColor: "#DC6B19",
            backgroundColor: "transparent",
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      {/* --- RESPONSIVENESS FIX --- */}
      {/* This outer div centers the content and adds a max-width */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          <div
            className="w-full lg:w-80 shadow-xl lg:border-r-2" // Add border only on desktop
            style={{
              backgroundColor: "#FFF8DC",
              borderColor: "#DC6B19",
            }}
          >
            <div className="p-6 space-y-3">
              {sections.map((section, index) => {
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-left transition-button shadow-md hover:shadow-lg transform hover:scale-[1.02] animate-fade-in-up`}
                    style={{
                      backgroundColor: isActive ? "#DC6B19" : "#F7C566",
                      borderWidth: "2px",
                      borderColor: "#DC6B19",
                      color: isActive ? "#FFF8DC" : "#6C0345",
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div
                      className="p-2 rounded-xl border-2"
                      style={{
                        backgroundColor: isActive ? "#FFF8DC" : "#6C0345",
                        borderColor: isActive ? "#F7C566" : "#DC6B19",
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

          <div className="flex-1 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">{renderSection()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}