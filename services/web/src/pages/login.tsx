// services/web/src/pages/login.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';
import Link from 'next/link';
import Head from 'next/head';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image'; // Import Image

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      toast.success('Login successful! Welcome back.');
      router.push('/');
    } catch (error) {
      const errorMessage = (error as any).response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login failed:', error);
    }
  };

 return (
  <>
    <Head>
      <title>Spot2Go | Login</title>
    </Head>
    <div className="min-h-screen relative overflow-hidden auth-background flex flex-col items-center justify-center p-6">
      <div className="relative z-10 max-w-md w-full space-y-8">
        
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="absolute -top-16 left-0 p-3 rounded-xl border-2 transition-button"
          style={{ color: '#FFF8DC', borderColor: '#F7C566', backgroundColor: 'rgba(255, 248, 220, 0.1)' }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* --- MODIFIED: Use Logo Image --- */}
        <div className="text-center space-y-4 mb-8 animate-fade-in-up">
          <Image 
            src="/logo-full.png" // Assumes 'logo-full.png' is in /public
            alt="Spot2Go Logo"
            width={250}
            height={67}
            className="object-contain mx-auto"
            style={{ filter: 'brightness(0) invert(1)' }} // Makes logo white
            priority
          />
        </div>
        {/* --- END MODIFICATION --- */}

        <AuthForm
          type="login"
          onSubmit={(email, password) => handleLogin(email, password)}
          onThirdPartyAuth={(provider) => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
          }}
        />

        {/* --- FIX: Links are now in their own div below the card --- */}
        <div className="relative z-10 text-center p-4 space-y-2">
          <Link href="/forgot-password" legacyBehavior>
            <a className="text-sm font-medium text-brand-yellow hover:text-white underline">
              Forgot your password?
            </a>
          </Link>
          <div className="text-brand-yellow/50 text-xs">|</div>
          <Link href="/business" legacyBehavior>
            <a className="text-sm font-medium text-brand-yellow hover:text-white underline">
              Are you a business owner? Partner with us
            </a>
          </Link>
        </div>
      </div>
    </div>
  </>
);
}