// services/web/src/pages/reset-password.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from 'sonner';
import { resetPassword } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Head from 'next/head';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { handleTokenUpdate } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      // --- FIX: Look for resetToken instead of token ---
      const queryToken = router.query.resetToken as string;
      if (queryToken) {
        setToken(queryToken);
      } else {
        // Set error state but DO NOT toast on load to prevent spam/double toasts
        setError("Invalid or missing reset token. Please request a new one.");
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        toast.error("Password must be at least 8 characters long.");
        return;
    }
    if (!token) {
      setError("No reset token found.");
      toast.error("No reset token found.");
      return;
    }

    setLoading(true);
    try {
      // API call remains the same as your API client aligns with the updated backend
      const response = await resetPassword({ token, password });
      toast.success('Password reset successfully! You are now logged in.');

      if (response.data.token) {
        handleTokenUpdate(response.data.token);
        router.push('/');
      } else {
         toast.info('Password reset, please log in.');
         router.push('/login');
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to reset password. The link may have expired or is invalid.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Password reset failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Spot2Go | Reset Password</title>
      </Head>
     <div className="min-h-screen relative overflow-hidden auth-background">

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full space-y-8">
             <div className="text-center space-y-4 mb-8">
              <Image 
                src="/logo-full.png" 
                alt="Spot2Go Logo"
                width={250}
                height={67}
                className="object-contain mx-auto"
                style={{ filter: 'brightness(0) invert(1)' }} 
                priority
              />
            </div>

            <Card className="shadow-2xl border-2 rounded-2xl animate-scale-in" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
              <CardHeader className="text-center space-y-4 pb-6">
                <CardTitle className="text-2xl" style={{ color: '#6C0345' }}>
                  Set Your New Password
                </CardTitle>
                <CardDescription className="text-base" style={{ color: '#6C0345' }}>
                  Enter and confirm your new password below.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && !token ? (
                     <div className="text-center p-4 rounded-lg bg-red-100 border border-red-300">
                        <p className="font-medium text-red-700">{error}</p>
                        <Button variant="link" onClick={() => router.push('/forgot-password')} className="mt-2 text-brand-orange">Request a new link</Button>
                    </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2 relative">
                      <Label htmlFor="password" className="font-medium flex items-center gap-2" style={{ color: '#6C0345' }}>
                        <Lock className="h-4 w-4" style={{ color: '#DC6B19' }} /> New Password
                      </Label>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="rounded-xl h-12 border-2 transition-smooth pr-10"
                        style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                      />
                       <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 bottom-1 h-7 w-7 p-0 rounded-lg transition-button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ color: '#DC6B19' }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                            ) : (
                            <Eye className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-medium flex items-center gap-2" style={{ color: '#6C0345' }}>
                        <Lock className="h-4 w-4" style={{ color: '#DC6B19' }} /> Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                         type={showPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="rounded-xl h-12 border-2 transition-smooth pr-10"
                        style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                        aria-invalid={!!error && password !== confirmPassword}
                      />
                    </div>
                    {error && token && (
                         <p className="text-sm text-red-600 text-center">{error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={loading || !token}
                      className="w-full h-14 rounded-xl font-semibold text-lg"
                      size="lg"
                      style={{ backgroundColor: '#DC6B19', color: '#FFF8DC' }}
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '🔒 Reset Password'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}