import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';

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
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login failed:', error);
    }
  };

 return (
  <AuthForm
    type="login"
    onSubmit={(email, password) => handleLogin(email, password)}
    onBack={() => router.push('/')}
    onThirdPartyAuth={(provider) => {
      // Redirect to the backend OAuth endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
    }}
  />
);
}