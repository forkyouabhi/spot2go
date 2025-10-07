import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingPlaces, approvePlace, rejectPlace, getAdminPlaceStats } from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StudyPlace } from '../../types';
import { LogOut, Inbox, Check, X, Building2, Clock, CheckCircle } from 'lucide-react';
import { PendingPlaceCard } from '../../components/PendingPlaceCard';

interface PlaceStats {
  total: number;
  approved: number;
  pending: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [pendingPlaces, setPendingPlaces] = useState<StudyPlace[]>([]);
  const [stats, setStats] = useState<PlaceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [placesRes, statsRes] = await Promise.all([
        getPendingPlaces(),
        getAdminPlaceStats(),
      ]);
      setPendingPlaces(placesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Could not fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/');
    } else if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, loading, user, router, fetchData]);

  const handleDecision = async (placeId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approvePlace(placeId);
        toast.success('Place approved!');
      } else {
        await rejectPlace(placeId);
        toast.info('Place rejected.');
      }
      // Refresh all data after making a decision
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${action} place.`);
    }
  };

  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="w-full bg-brand-burgundy shadow-md sticky top-0 z-20">
        <div className="p-4 flex justify-between items-center max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3">
              <Inbox className="h-8 w-8 text-brand-yellow" />
              <div>
                <h1 className="text-2xl font-bold text-brand-cream">Admin Review</h1>
                <p className="text-sm text-brand-yellow">
                  Welcome, {user.name}!
                </p>
              </div>
            </div>
          <Button onClick={logout} variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-brand-orange bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Total Places</CardTitle><Building2 className="h-5 w-5 text-brand-orange" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.total}</div></CardContent>
            </Card>
            <Card className="border-2 border-brand-orange bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Approved</CardTitle><CheckCircle className="h-5 w-5 text-green-500" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.approved}</div></CardContent>
            </Card>
            <Card className="border-2 border-brand-orange bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Pending Review</CardTitle><Clock className="h-5 w-5 text-amber-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.pending}</div></CardContent>
            </Card>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-brand-burgundy">
            Awaiting Review ({pendingPlaces.length})
          </h2>
          {isLoading ? (
            <p className="text-center text-brand-burgundy">Loading submissions...</p>
          ) : pendingPlaces.length > 0 ? (
            <div className="space-y-8">
              {pendingPlaces.map((place) => (
                <PendingPlaceCard
                  key={place.id}
                  place={place}
                  onApprove={() => handleDecision(place.id, 'approve')}
                  onReject={() => handleDecision(place.id, 'reject')}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center p-12 border-2 border-dashed border-brand-yellow bg-white">
              <CardHeader><div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center"><Check className="h-10 w-10 text-green-600" /></div><CardTitle className="text-2xl font-bold text-brand-burgundy mt-4">All caught up!</CardTitle></CardHeader>
              <CardContent><p className="text-brand-orange">There are no new places awaiting review.</p></CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}