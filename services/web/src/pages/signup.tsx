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
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
// --- Imports for Terms & Checkbox ---
import { Checkbox } from "../components/ui/checkbox";
import { TermsAndConditions } from "../components/TermsAndConditions";

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // State for checkbox

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Terms
    if (!agreedToTerms) {
        toast.error("You must agree to the Terms and Conditions to create an account.");
        return;
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
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
    // Optional: Enforce terms for social login too
    if (!agreedToTerms) {
        toast.error("You must agree to the Terms and Conditions.");
        return;
    }
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${provider}`;
  };

  return (
    <>
      <Head>
        <title>Spot2Go | Sign Up</title>
      </Head>
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 md:p-6 auth-background">

        {/* Centered Card with Relative Positioning */}
        <Card className="w-full max-w-lg bg-brand-cream border-2 border-brand-orange shadow-2xl z-10 animate-fade-in-up relative">
            
            {/* Back Button moved inside the Card (Top Left) */}
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.push('/')}
                className="absolute top-4 left-4 text-brand-burgundy hover:bg-brand-yellow/20 transition-colors rounded-full"
                aria-label="Back to Home"
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>

            <CardHeader className="text-center pt-10">
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
              <Button 
                variant="outline" 
                className="w-full h-11 text-brand-burgundy border-brand-orange hover:bg-brand-yellow/50"
                onClick={() => handleThirdPartyAuth('google')}
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
                
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-brand-burgundy">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required 
                      placeholder="8+ characters" 
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-brand-orange hover:bg-transparent hover:text-brand-burgundy"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-brand-burgundy">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required 
                      placeholder="Re-enter password" 
                      className="pr-10"
                    />
                  </div>
                </div>

                {/* --- Terms Checkbox --- */}
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
                
                <Button 
                  type="submit" 
                  disabled={loading || !agreedToTerms} // Disable if terms not agreed
                  className="w-full h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

        {/* Bottom Links */}
        <div className="w-full max-w-lg mx-auto z-10 text-center p-4 space-y-2 mt-4">
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