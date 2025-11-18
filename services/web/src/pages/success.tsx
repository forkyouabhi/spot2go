// services/web/src/pages/success.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext'; 
import { Loader2 } from 'lucide-react';
import Head from 'next/head';
import { toast } from 'sonner';

export default function AuthSuccessPage() {
    const router = useRouter();
    // FIX: Removed handleAuthSuccess from destructuring
    // const { handleAuthSuccess } = useAuth(); 
    const { token } = router.query;
    const [processed, setProcessed] = useState(false); // Flag to prevent multiple runs

    useEffect(() => {
        // Only run this logic once when the component is ready and not already processed
        if (router.isReady && !processed) {
            setProcessed(true); // Mark as processed
            
            if (typeof token === 'string' && token) {
                // WARN: Client-side token handling is insecure. Redirecting home, assuming server set cookie.
                // handleAuthSuccess(token); // REMOVED
                toast.success("Authentication successful.");
                router.replace('/'); 
            } else {
               // If no token, this is an invalid visit to this page
               toast.error("Authentication failed. Please log in.");
               router.push('/login');
            }
        }
    }, [token, router.isReady, processed, router]); 

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