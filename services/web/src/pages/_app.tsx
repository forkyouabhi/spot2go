import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner';
import type { AppProps } from 'next/app';

// This is the main entry point for your application.
// It wraps all pages with the necessary providers.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Toaster />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

