import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  ArrowLeft,
  MapPin,
  BookOpen,
  Users,
  Sparkles,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (email: string, password: string, name?: string) => void;
  onThirdPartyAuth: (provider: "google" | "apple", userData: any) => void;
  onBack: () => void;
}

export function AuthForm({
  type,
  onSubmit,
  onThirdPartyAuth,
  onBack,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(email, password, name);
    } catch (error) {
      // The parent component (login.tsx or signup.tsx) will handle the toast.
    } finally {
      setLoading(false);
    }
  };

  const handleThirdPartyAuth = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    onThirdPartyAuth(provider, {});
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  const AppleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Background with Brand Color */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #6C0345 0%, #DC6B19 100%)",
        }}
      />

      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-16 h-16 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: "#F7C566", animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-15 animate-pulse"
          style={{ backgroundColor: "#FFF8DC", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-40 left-20 w-20 h-20 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: "#F7C566", animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="self-start p-3 rounded-xl border-2 transition-button"
            style={{
              color: "#FFF8DC",
              borderColor: "#F7C566",
              backgroundColor: "rgba(255, 248, 220, 0.1)",
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Brand Header */}
          <div className="text-center space-y-4 mb-8 animate-fade-in-up">
            <div className="flex items-center justify-center space-x-3">
              <div
                className="p-4 rounded-2xl border-2"
                style={{
                  backgroundColor: "#FFF8DC",
                  borderColor: "#F7C566",
                }}
              >
                <Sparkles className="h-8 w-8" style={{ color: "#6C0345" }} />
              </div>
              <h1 className="text-4xl font-bold" style={{ color: "#FFF8DC" }}>
                Spot2Go
              </h1>
            </div>
            <p className="text-lg" style={{ color: "#FFF8DC" }}>
              Find Your Perfect Study Spot
            </p>
          </div>

          {/* Main Card */}
          <Card
            className="shadow-2xl border-2 rounded-2xl animate-scale-in"
            style={{
              backgroundColor: "#FFF8DC",
              borderColor: "#F7C566",
            }}
          >
            <CardHeader className="text-center space-y-4 pb-6">
              <CardTitle className="text-2xl" style={{ color: "#6C0345" }}>
                {type === "login" ? "✨ Welcome Back!" : "🚀 Join the Community"}
              </CardTitle>
              <CardDescription className="text-base" style={{ color: "#6C0345" }}>
                {type === "login"
                  ? "Ready to discover amazing study spaces in Thunder Bay?"
                  : "Start your journey to finding the perfect study environments"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!showEmailForm ? (
                /* Third-Party Authentication Options */
                <div className="space-y-4">
                  {/* Google Sign In */}
                  <Button
                    onClick={() => handleThirdPartyAuth("google")}
                    disabled={loadingProvider !== null}
                    className="w-full h-12 rounded-xl border-2 font-semibold transition-button transform hover:scale-[1.02] flex items-center justify-center space-x-3"
                    style={{
                      backgroundColor: "#FFF8DC",
                      borderColor: "#DC6B19",
                      color: "#6C0345",
                    }}
                  >
                    {loadingProvider === "google" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span>Continue with Google</span>
                  </Button>

                  {/* Apple Sign In */}
                  <Button
                    onClick={() => handleThirdPartyAuth("apple")}
                    disabled={loadingProvider !== null}
                    className="w-full h-12 rounded-xl border-2 font-semibold transition-button transform hover:scale-[1.02] flex items-center justify-center space-x-3"
                    style={{
                      backgroundColor: "#6C0345",
                      borderColor: "#DC6B19",
                      color: "#FFF8DC",
                    }}
                  >
                    {loadingProvider === "apple" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <AppleIcon />
                    )}
                    <span>Continue with Apple</span>
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className="w-full border-t-2"
                        style={{ borderColor: "#F7C566" }}
                      />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span
                        className="px-4 font-medium"
                        style={{
                          backgroundColor: "#FFF8DC",
                          color: "#6C0345",
                        }}
                      >
                        or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email Option */}
                  <Button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full h-12 rounded-xl border-2 font-semibold transition-button transform hover:scale-[1.02] flex items-center justify-center space-x-3"
                    style={{
                      backgroundColor: "#F7C566",
                      borderColor: "#DC6B19",
                      color: "#6C0345",
                    }}
                  >
                    <Mail className="h-5 w-5" />
                    <span>Continue with Email</span>
                  </Button>
                </div>
              ) : (
                /* Email/Password Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {type === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="font-medium"
                        style={{ color: "#6C0345" }}
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="What should we call you?"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl h-12 border-2 transition-smooth"
                        style={{
                          backgroundColor: "#FFF8DC",
                          borderColor: "#DC6B19",
                          color: "#6C0345",
                        }}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="font-medium"
                      style={{ color: "#6C0345" }}
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl h-12 border-2 transition-smooth"
                      style={{
                        backgroundColor: "#FFF8DC",
                        borderColor: "#DC6B19",
                        color: "#6C0345",
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="font-medium"
                      style={{ color: "#6C0345" }}
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl h-12 border-2 transition-smooth"
                      style={{
                        backgroundColor: "#FFF8DC",
                        borderColor: "#DC6B19",
                        color: "#6C0345",
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-button flex items-center justify-center space-x-2"
                      style={{
                        backgroundColor: "#DC6B19",
                        color: "#FFF8DC",
                      }}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Please wait...</span>
                        </>
                      ) : (
                        <span>
                          {type === "login"
                            ? "🎯 Sign In"
                            : "🌟 Create Account"}
                        </span>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="w-full h-12 rounded-xl border-2 font-medium transition-button"
                      style={{
                        backgroundColor: "transparent",
                        borderColor: "#F7C566",
                        color: "#6C0345",
                      }}
                    >
                      ← Back to sign-in options
                    </Button>
                  </div>
                </form>
              )}

              {/* Features Preview - Only show when not in email form */}
              {!showEmailForm && (
                <div
                  className="pt-6 border-t-2"
                  style={{ borderColor: "#F7C566" }}
                >
                  <p
                    className="text-center text-sm mb-4"
                    style={{ color: "#6C0345" }}
                  >
                    What you'll get:
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto border-2"
                        style={{
                          backgroundColor: "#F7C566",
                          borderColor: "#DC6B19",
                        }}
                      >
                        <MapPin
                          className="h-5 w-5"
                          style={{ color: "#6C0345" }}
                        />
                      </div>
                      <p className="text-xs" style={{ color: "#6C0345" }}>
                        Find Spots
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto border-2"
                        style={{
                          backgroundColor: "#F7C566",
                          borderColor: "#DC6B19",
                        }}
                      >
                        <BookOpen
                          className="h-5 w-5"
                          style={{ color: "#6C0345" }}
                        />
                      </div>
                      <p className="text-xs" style={{ color: "#6C0345" }}>
                        Book Easily
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto border-2"
                        style={{
                          backgroundColor: "#F7C566",
                          borderColor: "#DC6B19",
                        }}
                      >
                        <Users
                          className="h-5 w-5"
                          style={{ color: "#6C0345" }}
                        />
                      </div>
                      <p className="text-xs" style={{ color: "#6C0345" }}>
                        Join Community
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="text-center space-y-2 animate-fade-in-up">
            <p className="text-sm" style={{ color: "#FFF8DC" }}>
              Trusted by students across Thunder Bay
            </p>
            <div
              className="flex items-center justify-center space-x-4 text-xs"
              style={{ color: "#F7C566" }}
            >
              <span>🔒 Secure</span>
              <span>⚡ Fast</span>
              <span>📱 Mobile-First</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}