// services/web/src/pages/business.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Sparkles, CheckCircle, Loader2, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import Head from 'next/head';

export default function BusinessSignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  // --- NEW: State for the detailed form ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/owner/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Pass all the new details to the register function
      await register(name, email, password, 'owner', phone, businessLocation);
      toast.success('Account created successfully!');
      toast.info('Your account is now pending verification by an admin.');
      setSignupSuccess(true);
    } catch (error) {
        const errorMessage = (error as any).response?.data?.error || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Success message screen
  if (signupSuccess) {
    return (
      <>
        <Head>
          <title>Spot2Go | Verification Pending</title>
        </Head>
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6C0345 0%, #DC6B19 100%)' }}>
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
              <div className="flex items-center justify-center space-x-3">
                 <div className="p-4 rounded-2xl border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
                    <Sparkles className="h-8 w-8" style={{ color: '#6C0345' }} />
                </div>
                <h1 className="text-4xl font-bold" style={{ color: '#FFF8DC' }}>Spot2Go</h1>
              </div>
              <Card className="shadow-2xl border-2 rounded-2xl animate-scale-in" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
                <CardHeader className="text-center space-y-4 pb-6">
                   <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <CardTitle className="text-2xl" style={{ color: '#6C0345' }}>
                    Registration Submitted!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-base" style={{ color: '#6C0345' }}>
                    Thank you for registering. Your account is now pending verification by our admin team.
                  </p>
                  <p className="text-sm text-brand-orange">
                    You will receive an email as soon as your account is approved.
                  </p>
                  <Button onClick={() => router.push('/')} className="mt-4" style={{ backgroundColor: '#DC6B19', color: '#FFF8DC' }}>
                    Back to Home
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  // The new detailed signup form
  return (
    <>
      <Head>
        <title>Spot2Go | Business Signup</title>
      </Head>
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #6C0345 0%, #DC6B19 100%)' }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: '#F7C566' }} />
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-15 animate-pulse" style={{ backgroundColor: '#FFF8DC', animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full space-y-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="self-start p-3 rounded-xl border-2 transition-button"
              style={{ color: '#FFF8DC', borderColor: '#F7C566', backgroundColor: 'rgba(255, 248, 220, 0.1)' }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="text-center space-y-4 mb-8 animate-fade-in-up">
              <div className="flex items-center justify-center space-x-3">
                <div className="p-4 rounded-2xl border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
                  <Sparkles className="h-8 w-8" style={{ color: '#6C0345' }} />
                </div>
                <h1 className="text-4xl font-bold" style={{ color: '#FFF8DC' }}>Partner With Us</h1>
              </div>
            </div>

            <Card className="shadow-2xl border-2 rounded-2xl animate-scale-in" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
              <CardHeader className="text-center space-y-4 pb-6">
                <CardTitle className="text-2xl" style={{ color: '#6C0345' }}>
                  Create your Owner Account
                </CardTitle>
                <CardDescription className="text-base" style={{ color: '#6C0345' }}>
                  Fill in your details to get started. All accounts are verified by an admin.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium flex items-center gap-2" style={{ color: '#6C0345' }}>
                      <User className="h-4 w-4 text-brand-orange" /> Owner's Full Name
                    </Label>
                    <Input id="name" type="text" placeholder="e.g., Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required 
                      className="rounded-xl h-12 border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium flex items-center gap-2" style={{ color: '#6C0345' }}>
                      <Mail className="h-4 w-4 text-brand-orange" /> Business Email
                    </Label>
                    <Input id="email" type="email" placeholder="you@yourbusiness.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                      className="rounded-xl h-12 border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium flex items-center gap-2" style={{ color: '#6C0345' }}>
                      <Phone className="h-4 w-4 text-brand-orange" /> Business Phone
                    </Label>
                    <Input id="phone" type="tel" placeholder="(807) 555-1234" value={phone} onChange={(e) => setPhone(e.target.value)} required 
                      className="rounded-xl h-12 border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessLocation" className="font-medium flex items-center gap-2" style={{ color: '#6C0345' }}>
                      <MapPin className="h-4 w-4 text-brand-orange" /> Business Address
                    </Label>
                    <Input id="businessLocation" type="text" placeholder="123 Main St, Thunder Bay, ON" value={businessLocation} onChange={(e) => setBusinessLocation(e.target.value)} required 
                      className="rounded-xl h-12 border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium flex items-center gap-2" style={{ color: '#6C0345' }}>
                       <Lock className="h-4 w-4 text-brand-orange" /> Password
                    </Label>
                    <Input id="password" type="password" placeholder="Create a secure password (min. 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required 
                      className="rounded-xl h-12 border-2" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                    />
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl font-semibold text-lg" size="lg" style={{ backgroundColor: '#DC6B19', color: '#FFF8DC' }}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '🌟 Submit for Verification'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}