// services/web/src/pages/signup.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';
import Link from 'next/link';

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
      // This form now only registers customers
      await register(name || '', email, password, 'customer');
      toast.success('Account created successfully! Welcome.');
      // Redirection is handled by the AuthContext
    } catch (error) {
        const errorMessage = (error as any).response?.data?.error || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        console.error('Signup failed:', error);
    }
  };

  return (
    <>
      <AuthForm
        type="signup"
        onSubmit={handleSignup}
        onBack={() => router.push('/')}
        onThirdPartyAuth={(provider) => {
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
        }}
      />
      {/* Link to the new business signup page */}
      <div className="text-center -mt-4 pb-4 relative z-10">
        <Link href="/business" legacyBehavior>
          <a className="text-sm font-medium text-brand-yellow hover:text-white underline">
            Are you a business owner? Partner with us
          </a>
        </Link>
      </div>
    </>
  );
}