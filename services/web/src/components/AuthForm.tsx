// services/web/src/components/AuthForm.tsx
import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, Loader2 } from "lucide-react";

interface AuthFormProps {
  type: 'login' | 'signup';
  onSubmit: (email: string, password: string, name?: string) => Promise<void>;
  onThirdPartyAuth: (provider: 'google' | 'apple') => void;
  // Removed props that are now handled by the page:
  // onBack, isOwner, setIsOwner
}

export function AuthForm({ type, onSubmit, onThirdPartyAuth }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(email, password, name);
    setLoading(false);
  };

  const handleThirdPartyAuth = (provider: 'google' | 'apple') => {
    setLoadingProvider(provider);
    onThirdPartyAuth(provider);
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    // The component is now just the Card.
    // The page will handle layout and background.
    <Card className="shadow-2xl border-2 rounded-2xl animate-scale-in w-full max-w-md" style={{ backgroundColor: '#FFF8DC', borderColor: '#F7C566' }}>
      <CardHeader className="text-center space-y-4 pb-6">
        <CardTitle className="text-2xl" style={{ color: '#6C0345' }}>
          {type === 'login' ? '✨ Welcome Back!' : '🚀 Join the Community'}
        </CardTitle>
        <CardDescription className="text-base" style={{ color: '#6C0345' }}>
          {type === 'login' ? 'Ready to discover amazing study spaces?' : 'Start your journey to finding the perfect study environments'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!showEmailForm ? (
          <div className="space-y-4">
            <Button onClick={() => handleThirdPartyAuth('google')} disabled={loadingProvider !== null} className="w-full h-12 rounded-xl border-2 font-semibold transition-button transform hover:scale-[1.02] flex items-center justify-center space-x-3" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}>
              {loadingProvider === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />} <span>Continue with Google</span>
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2" style={{ borderColor: '#F7C566' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 font-medium" style={{ backgroundColor: '#FFF8DC', color: '#6C0345' }}>or continue with email</span>
              </div>
            </div>
            <Button onClick={() => setShowEmailForm(true)} className="w-full h-12 rounded-xl border-2 font-semibold transition-button transform hover:scale-[1.02] flex items-center justify-center space-x-3" style={{ backgroundColor: '#F7C566', borderColor: '#DC6B19', color: '#6C0345' }}>
              <Mail className="h-5 w-5" /> <span>Continue with Email</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {type === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium" style={{ color: '#6C0345' }}>Full Name</Label>
                <Input id="name" type="text" placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)} required 
                  className="rounded-xl h-12 border-2 transition-smooth" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium" style={{ color: '#6C0345' }}>Email Address</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                className="rounded-xl h-12 border-2 transition-smooth" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium" style={{ color: '#6C0345' }}>Password</Label>
              <Input id="password" type="password" placeholder={type === 'login' ? "Enter your password" : "Create a secure password (min. 8 chars)"} value={password} onChange={(e) => setPassword(e.target.value)} required 
                className="rounded-xl h-12 border-2 transition-smooth" style={{ backgroundColor: '#FFF8DC', borderColor: '#DC6B19', color: '#6C0345' }}
              />
            </div>
            
            <div className="space-y-3">
              <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl font-semibold text-lg" size="lg" style={{ backgroundColor: '#DC6B19', color: '#FFF8DC' }}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (type === 'login' ? '🎯 Sign In' : '🌟 Create Account')}
              </Button>
              <Button type="button" onClick={() => setShowEmailForm(false)} variant="outline" className="w-full h-12 rounded-xl border-2 font-medium" style={{ backgroundColor: 'transparent', borderColor: '#F7C566', color: '#6C0345' }}>
                ← Back to sign-in options
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}