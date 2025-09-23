import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Failed to log in. Please check your credentials.');
    }
  };
  
  const handleThirdPartyAuth = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      onThirdPartyAuth={handleThirdPartyAuth}
      onBack={() => router.push('/')}
    />
  );
}

