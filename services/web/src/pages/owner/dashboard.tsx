import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOwnerPlaces } from '../../lib/api';
import { AddPlaceForm } from '../../components/AddPlaceForm';
import { toast } from 'sonner';
import { StudyPlace } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [places, setPlaces] = useState<StudyPlace[]>([]);

  const fetchPlaces = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'owner') return;
    try {
      const response = await getOwnerPlaces();
      setPlaces(response.data);
    } catch (error) {
      toast.error("Could not fetch your places.");
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'owner')) {
      router.replace('/');
    } else if (isAuthenticated) {
      fetchPlaces();
    }
  }, [isAuthenticated, loading, user, router, fetchPlaces]);

  if (loading || !isAuthenticated || user?.role !== 'owner') {
    return <div>Loading...</div>;
  }

  const getStatusVariant = (status: string) => {
    if (status === 'approved') return 'default';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FFF8DC' }}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#6C0345' }}>Owner Dashboard</h1>
          <p className="text-lg" style={{ color: '#DC6B19' }}>Welcome, {user.name}!</p>
        </div>
        <Button onClick={logout} variant="outline">Logout</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#6C0345' }}>Your Places</h2>
          <div className="space-y-4">
            {places.length > 0 ? (
              places.map((place) => (
                <div key={place.id} className="p-4 border-2 rounded-lg flex justify-between items-center" style={{ borderColor: '#F7C566', backgroundColor: '#fff' }}>
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#6C0345' }}>{place.name}</p>
                    <p className="text-sm" style={{ color: '#DC6B19' }}>{place.type}</p>
                  </div>
                  <Badge variant={getStatusVariant(place.status)}>{place.status}</Badge>
                </div>
              ))
            ) : (
              <p>You haven't added any places yet. Add one using the form!</p>
            )}
          </div>
        </div>
        <div>
          <AddPlaceForm onPlaceAdded={fetchPlaces} />
        </div>
      </div>
    </div>
  );
}

