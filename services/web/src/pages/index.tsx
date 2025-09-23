import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
// Update the path below to the correct relative path if needed
import { useAuth } from '../context/AuthContext';
// Update the path below to the correct relative path if needed
import { getPlaces } from '../lib/api';
import { HomeScreen } from '../components/HomeScreen';
import { SplashScreen } from '../components/SplashScreen';

export default function Home() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [places, setPlaces] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return; // Wait until auth check is complete

    if (!isAuthenticated) {
      setDataLoading(false);
    } else {
      const fetchPlaces = async () => {
        try {
          const response = await getPlaces();
          setPlaces(response.data);
        } catch (error) {
          console.error("Failed to fetch places", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchPlaces();
    }
  }, [isAuthenticated, loading]);
  
  if (loading || dataLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl mx-auto animate-spin border-4 border-t-transparent border-brand-orange"/>
                <p className="font-semibold text-brand-burgundy">Loading Your Spots...</p>
            </div>
        </div>
    );
  }

  if (!isAuthenticated) {
     return <SplashScreen onNavigate={(screen: string) => router.push(`/${screen}`)} />;
  }
  
  return (
    <HomeScreen
      userName={user?.name || user?.email}
      places={places}
      onPlaceSelect={(place: { id: string }) => router.push(`/places/${place.id}`)}
      onNavigate={(screen: string) => router.push(`/${screen}`)}
    />
  );
}

