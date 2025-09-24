import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingPlaces, approvePlace, rejectPlace } from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { StudyPlace } from '../../types';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [pendingPlaces, setPendingPlaces] = useState<StudyPlace[]>([]);

  const fetchPendingPlaces = async () => {
    try {
      const response = await getPendingPlaces();
      setPendingPlaces(response.data);
    } catch (error) {
      toast.error('Could not fetch pending places.');
    }
  };

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/');
    } else if (isAuthenticated) {
      fetchPendingPlaces();
    }
  }, [isAuthenticated, loading, user, router]);

  const handleApprove = async (placeId: string) => {
    try {
      await approvePlace(placeId);
      toast.success('Place approved successfully!');
      fetchPendingPlaces();
    } catch (error) {
      toast.error('Failed to approve place.');
    }
  };

  const handleReject = async (placeId: string) => {
    try {
      await rejectPlace(placeId);
      toast.info('Place has been rejected.');
      fetchPendingPlaces();
    } catch (error) {
      toast.error('Failed to reject place.');
    }
  };

  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FFF8DC' }}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#6C0345' }}>
            Admin Dashboard
          </h1>
          <p className="text-lg" style={{ color: '#DC6B19' }}>
            Review new submissions
          </p>
        </div>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </header>

      <div>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: '#6C0345' }}>
          Places Awaiting Approval
        </h2>
        <div className="space-y-4">
          {pendingPlaces.length > 0 ? (
            pendingPlaces.map((place) => (
              <div
                key={place.id}
                className="p-4 border-2 rounded-lg flex justify-between items-center"
                style={{ borderColor: '#F7C566', backgroundColor: '#fff' }}
              >
                <div>
                  <p className="font-bold text-lg" style={{ color: '#6C0345' }}>
                    {place.name}
                  </p>
                  <p className="text-sm" style={{ color: '#DC6B19' }}>
                    {place.type} - {place.location.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(place.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(place.id)}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>There are no pending places to review right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
