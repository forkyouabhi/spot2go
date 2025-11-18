// services/web/src/pages/business.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Loader2, User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
// --- New Imports for Terms & Checkbox ---
import { Checkbox } from "../components/ui/checkbox";
import { TermsAndConditions } from "../components/TermsAndConditions";

export default function BusinessSignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New State
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New State
  const [agreedToTerms, setAgreedToTerms] = useState(false); // New State

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/owner/dashboard');
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
      await register(name, email, password, 'owner', phone, businessLocation);
      
      toast.success('Account created successfully! Check your email for an OTP.');
      router.push(`/verify-email?email=${email}`);

    } catch (error) {
        const errorMessage = (error as any).response?.data?.error || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Spot2Go | Business Signup</title>
      </Head>
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 md:p-6 auth-background">
        
        <Card className="w-full max-w-lg bg-brand-cream border-2 border-brand-orange shadow-2xl z-10 animate-fade-in-up relative">
            
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
                priority
              />
              <CardTitle className="text-3xl font-bold text-brand-burgundy mt-4">
                Create your Owner Account
              </CardTitle>
              <CardDescription className="text-brand-orange">
                Fill in your business details. All accounts are verified by an admin.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4"> {/* Changed space-y-5 to space-y-4 for tighter form */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-brand-burgundy flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-orange" /> Owner's Full Name
                  </Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="e.g., Jane Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brand-burgundy flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand-orange" /> Business Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@yourbusiness.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-brand-burgundy flex items-center gap-2">
                    <Phone className="h-4 w-4 text-brand-orange" /> Business Phone
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="(807) 555-1234" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessLocation" className="text-brand-burgundy flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-orange" /> Business Address
                  </Label>
                  <Input 
                    id="businessLocation" 
                    type="text" 
                    placeholder="123 Main St, Thunder Bay, ON" 
                    value={businessLocation} 
                    onChange={(e) => setBusinessLocation(e.target.value)} 
                    required 
                  />
                </div>
                
                {/* --- Password Field with Toggle --- */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-brand-burgundy flex items-center gap-2">
                      <Lock className="h-4 w-4 text-brand-orange" /> Password
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a secure password (min. 8 chars)" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
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
                
                {/* --- Confirm Password Field --- */}
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
                
                <div className="space-y-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={loading || !agreedToTerms} 
                    className="w-full h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : '🌟 Submit for Verification'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
        {/* Bottom Links */}
        <div className="w-full max-w-lg mx-auto z-10 text-center p-4 space-y-2 mt-4">
          <p className="text-sm font-medium text-brand-yellow">
            Already have an owner account?
            <Link href="/login" className="font-semibold text-brand-yellow hover:text-white underline ml-1">
              Log in
            </Link>
          </p>
          <div className="text-brand-yellow/50 text-xs">|</div>
          <p className="text-sm font-medium text-brand-yellow">
            Are you a customer?
            <Link href="/signup" className="font-semibold text-brand-yellow hover:text-white underline ml-1">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}