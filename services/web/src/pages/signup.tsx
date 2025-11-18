// services/web/src/pages/signup.tsx
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { Checkbox } from "../components/ui/checkbox"; // Import Checkbox
import { TermsAndConditions } from "../components/TermsAndConditions"; // Import Terms Modal

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // --- ADDED: State for Terms Agreement ---
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
        toast.error("You must agree to the Terms and Conditions to sign up.");
        return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    try {
      const response = await register(name, email, password, 'customer');
      toast.success(response.message || 'Registration successful! Please check your email.');
      router.push(`/verify-email?email=${email}`);
    } catch (error: any) {
      const errorMessage = (error as any).response?.data?.error || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThirdPartyAuth = (provider: string) => {
    if (!agreedToTerms) {
        toast.error("You must agree to the Terms and Conditions to sign up.");
        return;
    }
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
  };

  return (
    <>
      <Head>
        <title>Spot2Go | Sign Up</title>
      </Head>
      <div className="min-h-screen relative flex flex-col p-4 md:p-6 auth-background">

        {/* 1. Back Button (in flow) */}
        <div className="w-full max-w-lg mx-auto z-10 mb-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="p-3 rounded-xl border-2 transition-button"
            style={{ color: '#FFF8DC', borderColor: '#F7C566', backgroundColor: 'rgba(255, 248, 220, 0.1)' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* 2. Centered Card */}
        <div className="flex-grow flex items-center justify-center py-2">
          <Card className="w-full max-w-lg bg-brand-cream border-2 border-brand-orange shadow-2xl z-10 animate-fade-in-up">
            <CardHeader className="text-center">
              <Image 
                src="/logo-full.png"
                alt="Spot2Go Logo"
                width={200}
                height={100}
                className="object-contain mx-auto"
              />
              <CardTitle className="text-3xl font-bold text-brand-burgundy">Create an Account</CardTitle>
              <CardDescription className="text-brand-orange">Find your new favorite study spot today.</CardDescription>
            </CardHeader>

            <CardContent>
              {/* --- Google Sign-in --- */}
              <Button 
                variant="outline" 
                className="w-full h-11 text-brand-burgundy border-brand-orange hover:bg-brand-yellow/50 disabled:opacity-50"
                onClick={() => handleThirdPartyAuth('google')}
                // Optional: Disable if terms not agreed, but typical UX allows click then toast error
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Sign up with Google
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-brand-yellow" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-brand-cream px-2 text-brand-orange">
                    Or sign up with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-brand-burgundy">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required 
                    placeholder="John Doe" 
                  />
                </div>
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
                    placeholder="8+ characters" 
                  />
                </div>

                {/* --- ADDED: Terms and Conditions Checkbox --- */}
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="border-brand-orange data-[state=checked]:bg-brand-orange mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none text-brand-burgundy peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the 
                    <TermsAndConditions>
                      <span className="underline text-brand-orange cursor-pointer hover:text-brand-orange/80 ml-1">
                        Terms of Service and Privacy Policy
                      </span>
                    </TermsAndConditions>
                    .
                  </label>
                </div>
                {/* --------------------------------------------- */}
                
                <Button 
                  type="submit" 
                  // Disable button if terms are not agreed
                  disabled={loading || !agreedToTerms}
                  className="w-full h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 3. Bottom Links (in flow) */}
        <div className="w-full max-w-lg mx-auto z-10 text-center p-4 space-y-2">
          <p className="text-sm font-medium text-brand-yellow">
            Already have an account?
            <Link href="/login" className="font-semibold text-brand-yellow hover:text-white underline ml-1">
              Log in
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
    </>
  );
}