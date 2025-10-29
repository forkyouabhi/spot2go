// services/web/src/pages/admin/dashboard.tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getPendingPlaces, 
  approvePlace, 
  rejectPlace, 
  getAdminPlaceStats,
  getPendingOwners, // NEW IMPORT
  updateOwnerStatus // NEW IMPORT
} from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StudyPlace, User } from '../../types'; // IMPORT USER TYPE
import { LogOut, Inbox, Check, X, Building2, Clock, CheckCircle, Users } from 'lucide-react'; // IMPORT USERS ICON
import { PendingPlaceCard } from '../../components/PendingPlaceCard';
import { PendingOwnerCard } from '../../components/PendingOwnerCard'; // NEW IMPORT
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'; // IMPORT TABS

interface PlaceStats {
  total: number;
  approved: number;
  pending: number;
}

interface OwnerStats {
  pending: number;
}

interface DashboardStats {
  places: PlaceStats;
  owners: OwnerStats;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [pendingPlaces, setPendingPlaces] = useState<StudyPlace[]>([]);
  const [pendingOwners, setPendingOwners] = useState<Partial<User>[]>([]); // NEW STATE
  const [stats, setStats] = useState<DashboardStats | null>(null); // UPDATED STATE
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [placesRes, statsRes, ownersRes] = await Promise.all([
        getPendingPlaces(),
        getAdminPlaceStats(),
        getPendingOwners(), // NEW FETCH
      ]);
      setPendingPlaces(placesRes.data);
      setStats(statsRes.data);
      setPendingOwners(ownersRes.data); // SET NEW STATE
    } catch (error) {
      toast.error('Could not fetch all dashboard data.');
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

  const handlePlaceDecision = async (placeId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approvePlace(placeId);
        toast.success('Place approved!');
      } else {
        await rejectPlace(placeId);
        toast.info('Place rejected.');
      }
      fetchData(); // Refresh all data
    } catch (error) {
      toast.error(`Failed to ${action} place.`);
    }
  };

  // NEW HANDLER for owner decisions
  const handleOwnerDecision = async (userId: string, status: 'active' | 'rejected') => {
    try {
      await updateOwnerStatus(userId, status);
      if (status === 'active') {
        toast.success('Owner account approved!');
      } else {
        toast.info('Owner account rejected.');
      }
      fetchData(); // Refresh all data
    } catch (error) {
      toast.error(`Failed to update owner status.`);
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
        {/* STATS SECTION */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-brand-orange bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Total Places</CardTitle><Building2 className="h-5 w-5 text-brand-orange" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.places.total}</div></CardContent>
            </Card>
            <Card className="border-2 border-green-500 bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Approved Places</CardTitle><CheckCircle className="h-5 w-5 text-green-500" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.places.approved}</div></CardContent>
            </Card>
            <Card className="border-2 border-amber-500 bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Pending Places</CardTitle><Clock className="h-5 w-5 text-amber-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.places.pending}</div></CardContent>
            </Card>
            {/* NEW STAT CARD */}
            <Card className="border-2 border-blue-500 bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Pending Owners</CardTitle><Users className="h-5 w-5 text-blue-500" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.owners.pending}</div></CardContent>
            </Card>
          </div>
        )}

        {/* TABS FOR PENDING ITEMS */}
        <Tabs defaultValue="places" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-brand-cream/50 border-2 border-brand-yellow">
                <TabsTrigger value="places" className="text-brand-burgundy data-[state=active]:bg-brand-orange data-[state=active]:text-brand-cream">
                    Pending Places ({pendingPlaces.length})
                </TabsTrigger>
                <TabsTrigger value="owners" className="text-brand-burgundy data-[state=active]:bg-brand-orange data-[state=active]:text-brand-cream">
                    Pending Owners ({pendingOwners.length})
                </TabsTrigger>
            </TabsList>
            
            {/* PENDING PLACES TAB */}
            <TabsContent value="places" className="mt-6">
              {isLoading ? (
                <p className="text-center text-brand-burgundy">Loading submissions...</p>
              ) : pendingPlaces.length > 0 ? (
                <div className="space-y-8">
                  {pendingPlaces.map((place) => (
                    <PendingPlaceCard
                      key={place.id}
                      place={place}
                      onApprove={() => handlePlaceDecision(place.id, 'approve')}
                      onReject={() => handlePlaceDecision(place.id, 'reject')}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center p-12 border-2 border-dashed border-brand-yellow bg-white">
                  <CardHeader><div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center"><Check className="h-10 w-10 text-green-600" /></div><CardTitle className="text-2xl font-bold text-brand-burgundy mt-4">All caught up!</CardTitle></CardHeader>
                  <CardContent><p className="text-brand-orange">There are no new places awaiting review.</p></CardContent>
                </Card>
              )}
            </TabsContent>

            {/* NEW PENDING OWNERS TAB */}
            <TabsContent value="owners" className="mt-6">
              {isLoading ? (
                <p className="text-center text-brand-burgundy">Loading owners...</p>
              ) : pendingOwners.length > 0 ? (
                <div className="space-y-8">
                  {pendingOwners.map((owner) => (
                    <PendingOwnerCard
                      key={owner.id}
                      owner={owner}
                      onApprove={() => handleOwnerDecision(owner.id!, 'active')}
                      onReject={() => handleOwnerDecision(owner.id!, 'rejected')}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center p-12 border-2 border-dashed border-brand-yellow bg-white">
                  <CardHeader><div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center"><Check className="h-10 w-10 text-green-600" /></div><CardTitle className="text-2xl font-bold text-brand-burgundy mt-4">All caught up!</CardTitle></CardHeader>
                  <CardContent><p className="text-brand-orange">There are no new owners awaiting verification.</p></CardContent>
                </Card>
              )}
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}