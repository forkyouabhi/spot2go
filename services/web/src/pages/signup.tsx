// services/web/src/pages/signup.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, User, Mail, Lock, Phone, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from "../components/ui/checkbox";
import { TermsAndConditions } from "../components/TermsAndConditions";
import Head from 'next/head'; // Import Head

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    try {
      // This is the correct logic from our OTP implementation
      const response = await register(customerName, customerEmail, customerPassword, 'customer', customerPhone);
      toast.success("Registration successful! Check your email for an OTP.");
      // Redirect to the new verification page
      router.push(`/verify-email?email=${customerEmail}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Spot2Go | Sign Up</title>
      </Head>
      {/* 1. Main container matches login.tsx */}
      <div className="min-h-screen relative overflow-hidden auth-background flex flex-col items-center justify-center p-6">
        
        {/* 2. Wrapper div matches login.tsx (using max-w-lg for the larger card) */}
        <div className="relative z-10 max-w-lg w-full space-y-8">
          
          {/* 3. Back button matches login.tsx */}
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="absolute -top-16 left-0 p-3 rounded-xl border-2 transition-button"
            style={{ color: '#FFF8DC', borderColor: '#F7C566', backgroundColor: 'rgba(255, 248, 220, 0.1)' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* The Card is now inside the wrapper */}
          <Card className="w-full bg-brand-cream border-2 border-brand-orange shadow-2xl z-10 animate-fade-in-up">
            <CardHeader className="text-center">
              <Image 
                src="/logo-full.png"
                alt="Spot2Go Logo"
                width={200}
                height={100}
                className="object-contain mx-auto"
              />
              <CardTitle className="text-3xl font-bold text-brand-burgundy">Create your Account</CardTitle>
              <CardDescription className="text-brand-orange">Sign up to find and book study spots.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name" className="text-brand-burgundy">Full Name</Label>
                  <Input id="customer-name" value={customerName} onChange={e => setCustomerName(e.target.value)} required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email" className="text-brand-burgundy">Email</Label>
                  <Input id="customer-email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone" className="text-brand-burgundy">Phone Number (Optional)</Label>
                  <Input id="customer-phone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-password" className="text-brand-burgundy">Password (min. 8 characters)</Label>
                  <Input id="customer-password" type="password" value={customerPassword} onChange={e => setCustomerPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="terms-customer"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="border-brand-orange data-[state=checked]:bg-brand-orange mt-1"
                  />
                  <label
                    htmlFor="terms-customer"
                    className="text-sm font-medium leading-none text-brand-burgundy peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the 
                    <TermsAndConditions>
                      <span className="underline text-brand-orange cursor-pointer hover:text-brand-orange/80">
                        &nbsp;Terms of Service and Privacy Policy
                      </span>
                    </TermsAndConditions>
                    .
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading || !agreedToTerms}
                  className="w-full h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 4. Links are now *outside* the card, styled to match login.tsx */}
          <div className="relative z-10 text-center p-4 space-y-2">
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
      </div>
    </>
  );
}