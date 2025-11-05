// services/web/src/pages/verify-email.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Loader2, MailCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { verifyEmail } from '../lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { handleTokenUpdate } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');

  // Get email from query param
  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.query.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const response = await verifyEmail({ email, otp });
      // On success, the API returns a token.
      // We use handleTokenUpdate to log the user in and redirect.
      handleTokenUpdate(response.data.token);
      toast.success("Email verified successfully! Welcome to Spot2Go.");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Add a "Resend OTP" function
  // This would call a new API endpoint, e.g., POST /api/auth/resend-otp
  const handleResendOtp = () => {
    toast.info("Resend OTP functionality is not yet implemented.");
    // Example:
    // setLoading(true);
    // api.post('/auth/resend-otp', { email })
    //   .then(() => toast.success("A new code has been sent."))
    //   .catch(() => toast.error("Failed to resend code."))
    //   .finally(() => setLoading(false));
  };

  return (
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
            We sent a 6-digit verification code to <span className="font-bold text-brand-burgundy">{email}</span>
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
              disabled={loading || otp.length !== 6}
              className="w-full h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify & Log In"}
            </Button>
          </form>
          
          <div className="text-center text-sm text-brand-burgundy mt-6 space-y-2">
            <p>
              Didn't get a code?
              <Button variant="link" onClick={handleResendOtp} className="text-brand-orange underline pl-1">
                Resend code
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
  );
}