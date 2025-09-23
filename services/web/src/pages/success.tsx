import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This page is a bridge. It receives the token from the backend URL,
// saves it, and then redirects to the home page where the AuthContext
// will pick it up from localStorage and complete the login.
export default function AuthSuccessPage() {
    const router = useRouter();
    const { token } = router.query;

    useEffect(() => {
        if (typeof token === 'string' && token) {
            localStorage.setItem('token', token);
            // Redirect to home page, which will now have the token
            // and can properly initialize the authenticated state.
            router.push('/');
        } else {
           // If no token, redirect to login
           router.push('/login');
        }
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl mx-auto animate-spin border-4 border-t-transparent border-brand-orange"/>
                <p className="font-semibold text-brand-burgundy">Authenticating, please wait...</p>
            </div>
        </div>
    );
}

