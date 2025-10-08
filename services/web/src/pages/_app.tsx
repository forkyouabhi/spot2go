import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Spot2Go - Find Your Study Spot</title>
      </Head>
      <Toaster />
      <Component {...pageProps} />
    </AuthProvider>
  );
}