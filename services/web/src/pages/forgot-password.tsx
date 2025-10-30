// services/web/src/pages/forgot-password.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from 'sonner';
import { requestPasswordReset } from '../lib/api';
import { ArrowLeft, Mail, Loader2, Sparkles } from "lucide-react";
import Head from 'next/head';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessageSent(false); 
    try {
      const response = await requestPasswordReset({ email });
      toast.success(response.data.message || 'Password reset link sent.');
      setMessageSent(true); 
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send reset link. Please try again.';
      toast.error(errorMessage);
      console.error('Password reset request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Spot2Go | Forgot Password</title>
      </Head>
      {/* --- MODIFIED: Using new background class --- */}
      <div className="min-h-screen relative overflow-hidden auth-background">

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full space-y-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="self-start p-3 rounded-xl border-2 transition-button"
              style={{ color: '#FFF8DC', borderColor: '#F7C566', backgroundColor: 'rgba(255, 248, 220, 0.1)' }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>

            <div className="text-center space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-3">
                 <div className="p-4 rounded-2xl border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
                    <Sparkles className="h-8 w-8" style={{ color: '#6C0345' }} />
                </div>
                <h1 className="text-4xl font-bold" style={{ color: '#FFF8DC' }}>Spot2Go</h1>
              </div>
            </div>

            <Card className="shadow-2xl border-2 rounded-2xl animate-scale-in" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
              <CardHeader className="text-center space-y-4 pb-6">
                <CardTitle className="text-2xl" style={{ color: '#6C0345' }}>
                  Forgot Your Password?
                </CardTitle>
                <CardDescription className="text-base" style={{ color: '#6C0345' }}>
                  No worries! Enter your email below and we'll send you a link to reset it.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {messageSent ? (
                    <div className="text-center p-4 rounded-lg bg-green-100 border border-green-300">
                        <p className="font-medium text-green-700">
                            Check your email! If an account exists, you'll receive a password reset link shortly.
                        </p>
                        <Button variant="link" onClick={() => router.push('/login')} className="mt-2 text-brand-orange">
                          Back to Login
                        </Button>
                    </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium flex items-center gap-2" style={{ color: '#6C0345' }}>
                        <Mail className="h-4 w-4" style={{ color: '#DC6B19' }} /> Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-xl h-12 border-2 transition-smooth"
                        style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl font-semibold text-lg"
                      size="lg"
                      style={{ backgroundColor: '#DC6B19', color: '#FFF8DC' }}
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '📧 Send Reset Link'}
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