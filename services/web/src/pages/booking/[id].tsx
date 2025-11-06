// services/web/src/pages/booking/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { getPlaceById } from '../../lib/api';
import { StudyPlace, TimeSlot } from '../../types';
import { BookingScreen } from '../../components/BookingScreen';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Get user
  const [place, setPlace] = useState<StudyPlace | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // --- THIS IS THE FIX ---
    if (user?.role && user.role !== 'customer') {
      toast.error("Owners cannot book spots. Redirecting to your dashboard.");
      router.replace(user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard');
      return;
    }
    // --- END FIX ---

    if (id && isAuthenticated) {
      const fetchPlace = async () => {
        try {
          const response = await getPlaceById(id as string);
          setPlace(response.data);
        } catch (error) {
          toast.error("Could not load place details for booking.");
          router.push('/');
        }
      };
      fetchPlace();
    }
  }, [id, isAuthenticated, authLoading, router, user]); // Added 'user'

  const handleConfirmBooking = (confirmedPlace: StudyPlace, slot: TimeSlot) => {
    // Generate a mock ticket ID
    const ticketId = `SPOT2GO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Pass booking details to the confirmation page via query parameters
    router.push({
      pathname: '/confirmation',
      query: {
        placeName: confirmedPlace.name,
        placeAddress: confirmedPlace.location.address,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        ticketId: ticketId,
      },
    });
  };

  if (authLoading || !place || (isAuthenticated && user?.role !== 'customer')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 className="h-12 w-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <BookingScreen
      place={place}
      onBack={() => router.back()}
      onConfirmBooking={handleConfirmBooking}
    />
  );
}