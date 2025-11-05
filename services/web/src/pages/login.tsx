// services/web/src/pages/login.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';
import Head from 'next/head';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc'; // <-- Import Google icon

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful! Welcome back.');
      router.push('/');
    } catch (error: any) {
      // The error is already handled and toasted inside AuthContext,
      // but we'll toast a generic one just in case.
      const errorMessage = (error as any).response?.data?.error || 'Login failed. Please check your credentials.';
      // Check if toast is *not* for OTP
      if (!errorMessage.includes('verification code')) {
        toast.error(errorMessage);
      }
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThirdPartyAuth = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
  };

 return (
  <>
    <Head>
      <title>Spot2Go | Login</title>
    </Head>
    {/* 1. Main container matches signup.tsx */}
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 auth-background">
      
      {/* 2. Back button matches signup.tsx */}
      <div className="relative z-10 max-w-lg w-full space-y-8">
        
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="absolute -top-16 left-0 p-3 rounded-xl border-2 transition-button"
          style={{ color: '#FFF8DC', borderColor: '#F7C566', backgroundColor: 'rgba(255, 248, 220, 0.1)' }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* 3. Card component matches signup.tsx */}
        <Card className="w-full bg-brand-cream border-2 border-brand-orange shadow-2xl z-10 animate-fade-in-up">
          <CardHeader className="text-center">
            <Image 
              src="/logo-full.png"
              alt="Spot2Go Logo"
              width={200}
              height={100}
              className="object-contain mx-auto"
            />
            <CardTitle className="text-3xl font-bold text-brand-burgundy">Welcome Back!</CardTitle>
            <CardDescription className="text-brand-orange">Log in to your account to continue.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-burgundy">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required 
                  placeholder="you@example.com" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-burgundy">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                  placeholder="••••••••" 
                />
              </div>

              <div className="text-right">
                <Link href="/forgot-password" legacyBehavior>
                  <a className="text-sm font-medium text-brand-orange hover:text-brand-burgundy underline">
                    Forgot your password?
                  </a>
                </Link>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Log In"}
              </Button>
            </form>

            {/* --- Divider and Social Login --- */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-brand-yellow" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-cream px-2 text-brand-orange">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 text-brand-burgundy border-brand-orange hover:bg-brand-yellow/50"
              onClick={() => handleThirdPartyAuth('google')}
            >
              <FcGoogle className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>
            {/* --- End Social Login --- */}

          </CardContent>
        </Card>

        {/* 4. Links outside the card match signup.tsx's new style */}
        <div className="relative z-10 text-center p-4 space-y-2">
          <p className="text-sm font-medium text-brand-yellow">
            Don't have an account?
            <Link href="/signup" className="font-semibold text-brand-yellow hover:text-white underline ml-1">
              Sign up
            </Link>
          </p>
          <div className="text-brand-yellow/50 text-xs">|</div>
          <p className="text-sm font-medium text-brand-yellow">
            Are you a business owner?
            <Link href="/business" className="font-semibold text-brand-yellow hover:text-white underline ml-1">
              Register here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  </>
);
}