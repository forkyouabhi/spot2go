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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [place, setPlace] = useState<StudyPlace | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role && user.role !== 'customer') {
      toast.error("Owners cannot book spots. Redirecting to your dashboard.");
      router.replace(user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard');
      return;
    }

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
  }, [id, isAuthenticated, authLoading, router, user]);

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
    />
  );
}