// services/web/src/pages/admin/dashboard.tsx
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { 
  getPendingPlaces, 
  approvePlace, 
  rejectPlace, 
  getAdminPlaceStats,
  getPendingOwners,
  updateOwnerStatus
} from '../../lib/api';
import { toast } from 'sonner';
import { 
  Loader2, CheckCircle, XCircle, BarChart3, MapPin, Users, 
  LogOut, Shield 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { PendingPlaceCard } from '../../components/PendingPlaceCard';
import Image from 'next/image';

// Generic Card for Owners since we don't have a specific component for it yet
const PendingOwnerCard = ({ owner, onApprove, onReject }: any) => (
  <Card className="bg-white border-2 border-brand-yellow shadow-sm">
    <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
            <CardTitle className="text-lg text-brand-burgundy">{owner.name}</CardTitle>
            <CardDescription>{owner.email}</CardDescription>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
    </CardHeader>
    <CardContent className="space-y-3">
        <div className="text-sm text-gray-600">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {owner.businessLocation || 'No Location'}</p>
            <p className="flex items-center gap-2 mt-1"><Users className="h-4 w-4"/> {owner.phone || 'No Phone'}</p>
        </div>
        <div className="flex gap-3 pt-2">
            <Button onClick={onApprove} className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8">
                <CheckCircle className="h-4 w-4 mr-2"/> Approve
            </Button>
            <Button onClick={onReject} variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-700 h-8">
                <XCircle className="h-4 w-4 mr-2"/> Reject
            </Button>
        </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  const [stats, setStats] = useState({ totalPlaces: 0, pendingPlaces: 0, totalUsers: 0, pendingOwners: 0 });
  const [pendingPlaces, setPendingPlaces] = useState<any[]>([]);
  const [pendingOwners, setPendingOwners] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, placesRes, ownersRes] = await Promise.all([
        getAdminPlaceStats(),
        getPendingPlaces(),
        getPendingOwners()
      ]);

      setStats(statsRes.data);
      setPendingPlaces(placesRes.data);
      setPendingOwners(ownersRes.data);
    } catch (error: any) {
      // FIX: Handle 401 silently to prevent crash
      if (error.response?.status === 401) {
         console.warn("Admin session expired or invalid.");
         return; // Auth effect will handle redirect
      }
      toast.error("Failed to load dashboard data.");
      console.error(error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role !== 'admin') {
      toast.error("Access Denied: Admins only.");
      router.replace('/');
      return;
    }

    // Only fetch if authenticated AND user is admin
    if (user) {
        fetchDashboardData();
    }
  }, [loading, isAuthenticated, user, router, fetchDashboardData]);

  const handlePlaceAction = async (placeId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') await approvePlace(placeId);
      else await rejectPlace(placeId);
      
      toast.success(`Place ${action}d successfully.`);
      fetchDashboardData(); 
    } catch (error) {
      toast.error(`Failed to ${action} place.`);
    }
  };

  const handleOwnerAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'active' : 'rejected';
      await updateOwnerStatus(userId, status);
      
      toast.success(`Owner ${action}d successfully.`);
      fetchDashboardData();
    } catch (error) {
      toast.error(`Failed to ${action} owner.`);
    }
  };

  if (loading || (isAuthenticated && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 className="h-12 w-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="w-full bg-brand-burgundy shadow-md sticky top-0 z-20">
        <div className="p-4 flex justify-between items-center max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <Image src="/logo-mark.png" alt="Spot2Go Logo" width={40} height={40} className="object-contain" />
            <h1 className="text-xl md:text-2xl font-bold text-brand-cream">Admin Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-brand-yellow text-sm hidden md:inline">Logged in as {user.name}</span>
            <Button onClick={logout} variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard label="Total Places" value={stats.totalPlaces} icon={<MapPin className="h-8 w-8 text-blue-200"/>} color="blue" />
            <StatsCard label="Pending Places" value={stats.pendingPlaces} icon={<Shield className="h-8 w-8 text-amber-200"/>} color="amber" />
            <StatsCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-8 w-8 text-purple-200"/>} color="purple" />
            <StatsCard label="Pending Owners" value={stats.pendingOwners} icon={<Users className="h-8 w-8 text-red-200"/>} color="red" />
        </div>

        <Tabs defaultValue="places" className="w-full">
          <TabsList className="w-full justify-start bg-white border-b border-gray-200 rounded-none p-0 h-12">
            <TabsTrigger value="places" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange rounded-none h-12 px-6">
              Pending Places ({pendingPlaces.length})
            </TabsTrigger>
            <TabsTrigger value="owners" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange rounded-none h-12 px-6">
              Pending Owners ({pendingOwners.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="places" className="mt-6">
             {pendingPlaces.length === 0 ? (
                <EmptyState message="No pending place submissions." />
             ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingPlaces.map(place => (
                        <PendingPlaceCard 
                            key={place.id} 
                            place={place} 
                            onApprove={() => handlePlaceAction(place.id, 'approve')}
                            onReject={() => handlePlaceAction(place.id, 'reject')}
                        />
                    ))}
                </div>
             )}
          </TabsContent>

          <TabsContent value="owners" className="mt-6">
            {pendingOwners.length === 0 ? (
                <EmptyState message="No pending owner verification requests." />
             ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {pendingOwners.map(owner => (
                         <PendingOwnerCard 
                            key={owner.id} 
                            owner={owner}
                            onApprove={() => handleOwnerAction(owner.id, 'approve')}
                            onReject={() => handleOwnerAction(owner.id, 'reject')}
                         />
                    ))}
                </div>
             )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const StatsCard = ({ label, value, icon, color }: any) => (
    <Card className={`border-l-4 border-${color}-500 shadow-sm`}>
        <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-gray-500">{label}</p><h3 className={`text-2xl font-bold text-${color}-600`}>{value}</h3></div>
            {icon}
        </CardContent>
    </Card>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
        <p className="text-gray-500">{message}</p>
    </div>
);