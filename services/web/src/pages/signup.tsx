import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (email, password, name) => {
    try {
      await register(name, email, password);
      toast.success('Account created successfully! Welcome.');
      router.push('/');
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        console.error('Signup failed:', error);
    }
  };

  return (
    <AuthForm
      type="signup"
      onSubmit={(email, password, name) => handleSignup(email, password, name)}
      onBack={() => router.push('/')}
      onThirdPartyAuth={(provider) => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
      }}
    />
  );
}

