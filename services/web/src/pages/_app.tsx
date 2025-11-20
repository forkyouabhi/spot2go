// services/web/src/pages/_app.tsx
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner';
import type { AppProps } from 'next/app';
import Head from 'next/head';
// Removed Framer Motion page transitions to fix "glitch/lag" on mobile

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Spot2Go - Find Your Study Spot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        {/* FIX: Matches mobile browser top bar color to your brand cream color */}
        <meta name="theme-color" content="#FFF8DC" />
      </Head>
      <Toaster />
      
      {/* Render component directly for instant navigation */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}