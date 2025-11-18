// services/web/src/pages/success.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Loader2 } from 'lucide-react';
import Head from 'next/head';
import { toast } from 'sonner';

export default function AuthSuccessPage() {
    const router = useRouter();
    // --- FIX: Get handleAuthSuccess directly ---
    const { handleAuthSuccess } = useAuth(); 
    const { token } = router.query;
    const [processed, setProcessed] = useState(false); // Flag to prevent multiple runs

    useEffect(() => {
        // Only run this logic once when the component is ready and not already processed
        if (router.isReady && !processed) {
            if (typeof token === 'string' && token) {
                setProcessed(true); // Mark as processed
                // Call handleAuthSuccess directly. It will handle redirecting.
                handleAuthSuccess(token);
            } else {
               // If no token, this is an invalid visit to this page
               setProcessed(true); // Mark as processed
               toast.error("Authentication failed.");
               router.push('/login');
            }
        }
    }, [token, router.isReady, handleAuthSuccess, processed]); // Added 'processed' to deps

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