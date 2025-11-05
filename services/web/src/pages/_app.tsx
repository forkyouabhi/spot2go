// services/web/src/pages/_app.tsx
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence, Variants, easeInOut } from 'framer-motion';

// --- THIS IS THE MODIFIED ANIMATION ---
const pageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2, // <-- Faster animation
      ease: easeInOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2, // <-- Faster animation
      ease: easeInOut,
    },
  },
};
// --- END MODIFICATION ---

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AuthProvider>
      <Head>
        <title>Spot2Go - Find Your Study Spot</title>
      </Head>
      <Toaster />

      <AnimatePresence mode="wait">
        <motion.div
          key={router.route} 
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </AuthProvider>
  );
}