import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getPlaces } from '../lib/api';
import { HomeScreen } from '../components/HomeScreen';
import { SplashScreen } from '../components/SplashScreen';
import { toast } from 'sonner';
import { StudyPlace } from '../types';

export default function Home() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [places, setPlaces] = useState<StudyPlace[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait until authentication check is complete

    if (isAuthenticated) {
      const fetchPlaces = async () => {
        try {
          setLoadingData(true);
          const response = await getPlaces();
          setPlaces(response.data);
        } catch (error) {
          toast.error("Could not fetch study places.");
          console.error("Failed to fetch places:", error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchPlaces();
    } else {
      setLoadingData(false);
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || loadingData) {
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
      onPlaceSelect={(place) => router.push(`/places/${place.id}`)}
      onNavigate={(screen) => router.push(`/${screen}`)}
    />
  );
}
