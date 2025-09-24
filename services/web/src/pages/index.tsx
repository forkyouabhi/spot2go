import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getPlaces } from '../lib/api';
import { HomeScreen } from '../components/HomeScreen';
import { SplashScreen } from '../components/SplashScreen';
import { toast } from 'sonner';

export default function Home() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchPlaces = async () => {
        try {
          const response = await getPlaces();
          setPlaces(response.data);
        } catch (error) {
          toast.error("Could not fetch study places.");
          console.error("Failed to fetch places:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPlaces();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (authLoading || (isAuthenticated && loading)) {
    return (
       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8DC' }}>
        <p className="font-semibold" style={{ color: '#6C0345' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SplashScreen onNavigate={(screen) => router.push(`/${screen}`)} />;
  }

  return (
    <HomeScreen
      userName={user?.name || 'User'}
      places={places}
      onPlaceSelect={(place) => {
        toast.info(`Clicked on ${place.name}. Details page coming soon!`);
      }}
      // UPDATED: The 'account' string now correctly navigates to the new /account page.
      onNavigate={(screen) => router.push(`/${screen}`)}
    />
  );
}

