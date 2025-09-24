import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [isOwner, setIsOwner] = useState(false); // State for the checkbox

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (email: string, password: string, name?: string) => {
    try {
      const role = isOwner ? 'owner' : 'customer'; // Determine role from state
      await register(name || '', email, password, role);
      toast.success('Account created successfully! Welcome.');
      // Redirection is now handled by the AuthContext after successful registration
    } catch (error) {
        const errorMessage = (error as any).response?.data?.error || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        console.error('Signup failed:', error);
    }
  };

  return (
    <AuthForm
      type="signup"
      onSubmit={handleSignup}
      onBack={() => router.push('/')}
      onThirdPartyAuth={(provider) => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
      }}
      isOwner={isOwner}
      setIsOwner={setIsOwner}
    />
  );
}

