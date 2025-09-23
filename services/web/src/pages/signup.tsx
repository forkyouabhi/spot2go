import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      await register(name, email, password);
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error?.response?.data?.error || 'Failed to create account.');
    }
  };

   const handleThirdPartyAuth = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
  };

  return (
    <AuthForm
      type="signup"
      onSubmit={handleSignup}
      onThirdPartyAuth={handleThirdPartyAuth}
      onBack={() => router.push('/')}
    />
  );
}

