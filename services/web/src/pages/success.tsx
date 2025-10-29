// services/web/src/pages/success.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Loader2 } from 'lucide-react';
import Head from 'next/head';
import { toast } from 'sonner';

export default function AuthSuccessPage() {
    const router = useRouter();
    const { handleTokenUpdate } = useAuth(); // Use the context function
    const { token } = router.query;

    useEffect(() => {
        if (typeof token === 'string' && token) {
            // Use the handleTokenUpdate which already calls handleAuthSuccess
            // It will set the token, decode user, and redirect
            handleTokenUpdate(token);
        } else if (router.isReady && !token) {
           // If no token, redirect to login
           toast.error("Authentication failed.");
           router.push('/login');
        }
    }, [token, router, handleTokenUpdate]);

    return (
        <>
            <Head>
                <title>Spot2Go | Authenticating...</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-brand-cream">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 rounded-2xl mx-auto animate-spin text-brand-orange"/>
                    <p className="font-semibold text-brand-burgundy">Authenticating, please wait...</p>
                </div>
            </div>
        </>
    );
}