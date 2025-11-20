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
import { Checkbox } from "../components/ui/checkbox";
import { TermsAndConditions } from "../components/TermsAndConditions";

export default function BusinessSignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/owner/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
        toast.error("You must agree to the Terms and Conditions.");
        return;
    }
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
      // Register now accepts businessLocation as the 6th argument
      await register(name, email, password, 'owner', phone, businessLocation);
      
      toast.success('Account created successfully! Check your email for an OTP.');
      router.push(`/verify-email?email=${email}`);

    } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
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
        <Card className="w-full max-w-lg bg-brand-cream border-2 border-brand-orange shadow-2xl z-10 relative animate-in fade-in zoom-in-95 duration-300">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.push('/')}
                className="absolute top-4 left-4 text-brand-burgundy hover:bg-brand-yellow/20 rounded-full"
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>

            <CardHeader className="text-center pt-10">
               <div className="mx-auto mb-4 relative w-40 h-12">
                 {/* Ensure logo exists in public/logo-full.png */}
                 <Image src="/logo-full.png" alt="Spot2Go" fill className="object-contain" priority />
               </div>
              <CardTitle className="text-3xl font-bold text-brand-burgundy">
                Create Owner Account
              </CardTitle>
              <CardDescription className="text-brand-orange">
                Start managing your spot today.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Owner's Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="name" className="pl-9" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                   <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="email" className="pl-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="owner@business.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Business Phone</Label>
                   <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="phone" className="pl-9" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(555) 000-0000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessLocation">Business Address</Label>
                   <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="businessLocation" className="pl-9" type="text" value={businessLocation} onChange={(e) => setBusinessLocation(e.target.value)} required placeholder="123 Main St" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="pl-9 pr-10"
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-brand-orange hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                        id="confirmPassword" 
                        type={showPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required 
                        className="pl-9"
                        placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(c) => setAgreedToTerms(c as boolean)}
                    className="mt-1 border-brand-orange data-[state=checked]:bg-brand-orange"
                  />
                  <label htmlFor="terms" className="text-sm font-medium text-brand-burgundy leading-none">
                    I agree to the <TermsAndConditions><span className="underline cursor-pointer text-brand-orange">Terms of Service</span></TermsAndConditions>.
                  </label>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={loading || !agreedToTerms} 
                    className="w-full h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Create Account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-white/90 text-sm">
              Already have an account? 
              <Link href="/login" className="font-bold text-brand-yellow hover:underline ml-1">Log in</Link>
            </p>
          </div>
      </div>
    </>
  );
}