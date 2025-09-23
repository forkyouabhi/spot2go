import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  );
}

