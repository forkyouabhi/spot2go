import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getPlaceById } from '../lib/api';
import { PlaceDetails } from '../components/PlaceDetails';
import { toast } from 'sonner';

// This is a dynamic page. The [id] in the filename corresponds to the place's ID.
export default function PlaceDetailsPage() {
  const router = useRouter();
  const { id: placeId } = router.query; // Get the place ID from the URL
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [place, setPlace] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (placeId) {
      const fetchPlaceDetails = async () => {
        try {
          const response = await getPlaceById(placeId);
          // NOTE: The backend doesn't have review/slot data yet, so we add mock data for now.
          const placeData = {
            ...response.data,
            reviews: [], 
            availableSlots: [],
            image: "https://images.unsplash.com/photo-1562727226-fbcc78ac89e9?w=1080", // Placeholder image
            rating: 4.5 // Placeholder rating
          };
          setPlace(placeData);
        } catch (error) {
          toast.error('Could not fetch place details.');
          console.error('Failed to fetch place:', error);
          router.push('/'); // Go back home if the place is not found
        } finally {
          setLoadingData(false);
        }
      };
      fetchPlaceDetails();
    }
  }, [isAuthenticated, authLoading, router, placeId]);

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8DC' }}>
        <p className="font-semibold" style={{ color: '#6C0345' }}>Loading Study Spot...</p>
      </div>
    );
  }
  
  if (!place) {
      return null; // or a 404 component
  }

  return (
    <PlaceDetails
      place={place}
      onBack={() => router.push('/')}
      onBookNow={(place) => alert(`Booking for ${place.name} is the next step!`)}
    />
  );
}
