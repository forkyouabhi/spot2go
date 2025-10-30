// services/web/src/pages/signup.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';
import Link from 'next/link';
import Head from 'next/head';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image'; // Import the Next.js Image component

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (email: string, password: string, name?: string) => {
    try {
      await register(name || '', email, password, 'customer');
      toast.success('Account created successfully! Welcome.');
    } catch (error) {
        const errorMessage = (error as any).response?.data?.error || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        console.error('Signup failed:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Spot2Go | Sign Up</title>
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
              src="/logo-full.png" // Assumes you saved the transparent logo here
              alt="Spot2Go Logo"
              width={250} // Larger size for auth pages
              height={67}
              className="object-contain mx-auto"
              style={{ filter: 'brightness(0) invert(1)' }} // Makes logo white to stand out
            />
          </div>
          {/* --- END MODIFICATION --- */}
        
          <AuthForm
            type="signup"
            onSubmit={handleSignup}
            onThirdPartyAuth={(provider) => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
            }}
          />

          <div className="relative z-10 text-center p-4">
            <Link href="/business" className="text-sm font-medium text-brand-yellow hover:text-white underline">
              
                Are you a business owner? Partner with us
              
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}