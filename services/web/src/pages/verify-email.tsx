// services/web/src/pages/verify-email.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { verifyEmail, resendOtp } from '../lib/api';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function VerifyEmailPage() {
  const router = useRouter();
  // Get the new setter from context
  const { setAuthenticatedUser } = useAuth(); 
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (router.isReady && router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.isReady, router.query.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      // 1. Call API
      // The backend verifies the code and sets the 'token' HttpOnly cookie automatically.
      const response = await verifyEmail({ email, otp });
      const { user } = response.data;

      // 2. AUTO-LOGIN: Update AuthContext immediately
      setAuthenticatedUser(user);

      toast.success("Email verified successfully! Welcome to Spot2Go.");

      // 3. Redirect based on role
      if (user.role === 'owner') {
        router.push('/owner/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email address not found. Please try signing up again.");
      return;
    }
    setResendLoading(true);
    try {
      await resendOtp({ email });
      toast.success("A new code has been sent.");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to resend code.";
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Spot2Go | Verify Email</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center p-4 bg-brand-cream auth-background">
        <Card className="w-full max-w-lg bg-brand-cream border-2 border-brand-orange shadow-2xl z-10 animate-fade-in-up">
          <CardHeader className="text-center">
            <Image 
              src="/logo-full.png"
              alt="Spot2Go Logo"
              width={200}
              height={100}
              className="object-contain mx-auto"
            />
            <CardTitle className="text-3xl font-bold text-brand-burgundy">Check Your Email</CardTitle>
            <CardDescription className="text-brand-orange">
              We sent a 6-digit verification code to <span className="font-bold text-brand-burgundy">{email || 'your email'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-brand-burgundy">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || resendLoading || otp.length !== 6}
                className="w-full h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify & Log In"}
              </Button>
            </form>
            
            <div className="text-center text-sm text-brand-burgundy mt-6 space-y-2">
              <p>
                Didn't get a code?
                <Button 
                  variant="link" 
                  onClick={handleResendOtp} 
                  disabled={loading || resendLoading}
                  className="text-brand-orange underline pl-1"
                >
                  {resendLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {resendLoading ? 'Sending...' : 'Resend code'}
                </Button>
              </p>
              <p>
                Wrong email? 
                <Link href="/signup" className="font-semibold text-brand-orange underline ml-1">
                  Go back
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}