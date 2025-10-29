// services/web/src/pages/business.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import Head from 'next/head';

export default function BusinessSignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    // If user is already logged in and is an owner, send to dashboard
    if (isAuthenticated) {
      router.replace('/owner/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (email: string, password: string, name?: string) => {
    try {
      // This form registers as an 'owner'
      await register(name || '', email, password, 'owner');
      toast.success('Account created successfully!');
      toast.info('Your account is now pending verification by an admin.');
      setSignupSuccess(true);
      // Let the AuthContext handle the redirect to /owner/dashboard
      // where they will see the pending message.
    } catch (error) {
        const errorMessage = (error as any).response?.data?.error || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        console.error('Signup failed:', error);
    }
  };

  // Show a success message after signup instead of the form
  if (signupSuccess) {
    return (
      <>
        <Head>
          <title>Spot2Go | Verification Pending</title>
        </Head>
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6C0345 0%, #DC6B19 100%)' }}>
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
              <div className="flex items-center justify-center space-x-3">
                 <div className="p-4 rounded-2xl border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
                    <Sparkles className="h-8 w-8" style={{ color: '#6C0345' }} />
                </div>
                <h1 className="text-4xl font-bold" style={{ color: '#FFF8DC' }}>Spot2Go</h1>
              </div>
              <Card className="shadow-2xl border-2 rounded-2xl animate-scale-in" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
                <CardHeader className="text-center space-y-4 pb-6">
                   <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <CardTitle className="text-2xl" style={{ color: '#6C0345' }}>
                    Registration Submitted!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-base" style={{ color: '#6C0345' }}>
                    Thank you for registering. Your account is now pending verification by our admin team.
                  </p>
                  <p className="text-sm text-brand-orange">
                    You will receive an email as soon as your account is approved. You can now close this page.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Spot2Go | Business Signup</title>
      </Head>
      <AuthForm
        type="signup"
        onSubmit={handleSignup}
        onBack={() => router.push('/')}
        onThirdPartyAuth={(provider) => {
          // You might want to disable third-party auth for owners,
          // or handle linking logic differently. For now, it works.
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
        }}
      />
    </>
  );
}