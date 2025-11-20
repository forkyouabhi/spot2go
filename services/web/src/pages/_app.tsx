// services/web/src/pages/_app.tsx
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner'; // Ensure this path is correct
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Spot2Go - Find Your Study Spot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#FFF8DC" />
      </Head>
      
      {/* The Toaster component handles the rendering of the toast notifications */}
      <Toaster />
      
      <Component {...pageProps} />
    </AuthProvider>
  );
}