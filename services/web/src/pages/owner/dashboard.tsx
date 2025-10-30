// services/web/src/pages/owner/dashboard.tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOwnerPlaces, getOwnerPlaceById } from '../../lib/api';
import { AddPlaceForm } from '../../components/AddPlaceForm';
import { ManageMenu } from '../../components/ManageMenu';
import { toast } from 'sonner';
import { StudyPlace } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { PlusCircle, Clock, CheckCircle, XCircle, Building2, LogOut, Utensils, Edit, MapPin, Loader2, Mail } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import Image from 'next/image'; // Import Image

// ... (PendingVerification component is unchanged)
const PendingVerification = () => (
  <div className="min-h-screen bg-brand-cream">
     <header className="w-full bg-brand-burgundy shadow-md sticky top-0 z-20">
        <div className="p-4 flex justify-between items-center max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3">
              {/* --- MODIFIED: Use Logo Mark --- */}
              <Image 
                src="/logo-mark.png" // Assumes 'logo-mark.png' is in /public
                alt="Spot2Go Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-brand-cream">Owner Dashboard</h1>
              </div>
            </div>
        </div>
      </header>
      <main className="p-4 md:p-8 max-w-screen-xl mx-auto">
        <Card className="text-center p-12 border-2 border-dashed border-brand-yellow bg-white shadow-lg">
            <CardHeader>
                <div className="mx-auto bg-brand-yellow rounded-full h-16 w-16 flex items-center justify-center">
                    <Mail className="h-10 w-10 text-brand-burgundy" />
                </div>
                <CardTitle className="text-2xl font-bold text-brand-burgundy mt-4">
                    Account Pending Verification
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-brand-orange text-lg">
                    Thank you for registering! Your account is currently under review by our admin team.
                </p>
                <p className="text-brand-burgundy">
                    You will receive an email as soon as your account is approved. After approval, you will be able to add and manage your study spots here.
                </p>
            </CardContent>
        </Card>
      </main>
  </div>
);


export default function OwnerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [places, setPlaces] = useState<StudyPlace[]>([]);
  
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [managingPlace, setManagingPlace] = useState<StudyPlace | null>(null);
  const [editingPlace, setEditingPlace] = useState<StudyPlace | null>(null);

  const fetchPlaces = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'owner' || user?.status !== 'active') return;
    try {
      const response = await getOwnerPlaces();
      setPlaces(response.data);
    } catch (error) {
      toast.error("Could not fetch your places.");
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'owner') {
        router.replace('/');
      } else if (user.status === 'active') {
        fetchPlaces();
      }
    }
  }, [isAuthenticated, loading, user, router, fetchPlaces]);

  // ... (all other handlers remain the same)
  const handleOpenManageModal = async (place: StudyPlace) => {
    try {
      const response = await getOwnerPlaceById(place.id);
      setManagingPlace(response.data);
    } catch {
      toast.error("Could not load place data.");
    }
  };
  const handleOpenEditModal = (place: StudyPlace) => {
    setEditingPlace(place);
    setIsAddPlaceOpen(true);
  };
  const handleSuccess = () => {
    fetchPlaces();
    setIsAddPlaceOpen(false);
    setEditingPlace(null);
  };
  const handleMenuItemAdded = () => {
    if (managingPlace) {
      handleOpenManageModal(managingPlace);
    }
    fetchPlaces();
  };
  const placeStats = useMemo(() => ({
    total: places.length,
    approved: places.filter(p => p.status === 'approved').length,
    pending: places.filter(p => p.status === 'pending').length,
  }), [places]);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500 text-white"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream"><Loader2 className="h-12 w-12 animate-spin text-brand-orange"/></div>;
  }

  if (user.status === 'pending_verification') {
    return <PendingVerification />;
  }

  if (user.status === 'rejected') {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream">Your account application was rejected. Please contact support.</div>;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="w-full bg-brand-burgundy shadow-md sticky top-0 z-20">
        <div className="p-4 flex justify-between items-center max-w-screen-xl mx-auto">
            {/* --- MODIFIED: Use Logo Mark --- */}
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-mark.png" // Assumes 'logo-mark.png' is in /public
                alt="Spot2Go Logo"
                width={40}
                height={40}
                className="object-contain"
                // style={{ filter: 'brightness(0) invert(1)' }} // Makes logo white
              />
              <div>
                <h1 className="text-2xl font-bold text-brand-cream">Owner Dashboard</h1>
                <p className="text-sm text-brand-yellow">Welcome, {user?.name}!</p>
              </div>
            </div>
            {/* --- END MODIFICATION --- */}
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => { setEditingPlace(null); setIsAddPlaceOpen(true); }}
                className="bg-brand-orange hover:bg-brand-orange/90 text-brand-cream font-semibold"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New Spot
              </Button>
              <Button onClick={logout} variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream">
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
        </div>
      </header>

      {/* ... (rest of the dashboard page) ... */}
      <main className="p-4 md:p-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-brand-orange bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Total Places</CardTitle><Building2 className="h-5 w-5 text-brand-orange" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{placeStats.total}</div></CardContent></Card>
          <Card className="border-2 border-green-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Approved</CardTitle><CheckCircle className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{placeStats.approved}</div></CardContent></Card>
          <Card className="border-2 border-amber-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Pending Review</CardTitle><Clock className="h-5 w-5 text-amber-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{placeStats.pending}</div></CardContent></Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-brand-burgundy">Your Submitted Places</h2>
          {places.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <Card key={place.id} className="border-2 border-brand-yellow bg-white overflow-hidden shadow-lg flex flex-col transition-all hover:shadow-xl hover:-translate-y-1">
                  <ImageWithFallback src={place.images?.[0] || ''} alt={place.name} className="w-full h-40 object-cover"/>
                  <CardContent className="p-4 flex-grow"><div className="flex justify-between items-start"><h3 className="font-bold text-lg text-brand-burgundy">{place.name}</h3>{getStatusBadge(place.status)}</div><p className="text-sm text-brand-orange flex items-center gap-1 mt-1"><MapPin className="h-4 w-4"/>{place.location.address}</p></CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto flex items-center gap-2">
                      {place.type === 'cafe' && (
                        <Button onClick={() => handleOpenManageModal(place)} className="flex-1 bg-brand-burgundy hover:bg-brand-burgundy/90 text-white">
                            <Utensils className="h-4 w-4 mr-2" />Menu
                        </Button>
                      )}
                      <Button onClick={() => handleOpenEditModal(place)} variant="outline" className="flex-1 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream">
                          <Edit className="h-4 w-4 mr-2" />Edit
                      </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-12 border-2 border-dashed border-brand-yellow bg-brand-cream/50">
              <h3 className="text-xl font-semibold text-brand-burgundy">No places yet!</h3>
              <p className="text-brand-orange mt-2">Click the "Add New Spot" button to get started.</p>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={isAddPlaceOpen} onOpenChange={(isOpen) => { setIsAddPlaceOpen(isOpen); if (!isOpen) setEditingPlace(null); }}>
        <DialogContent className="sm:max-w-[600px] bg-brand-cream border-brand-orange border-2">
          <DialogHeader><DialogTitle className="text-2xl text-brand-burgundy">{editingPlace ? 'Edit & Re-submit Spot' : 'Submit a New Study Spot'}</DialogTitle><DialogDescription className="text-brand-orange">{editingPlace ? "Update your spot's details below." : 'Fill in the details below. It will be reviewed by an admin.'}</DialogDescription></DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-1 pr-4"><AddPlaceForm onSuccess={handleSuccess} initialData={editingPlace} /></div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!managingPlace} onOpenChange={() => setManagingPlace(null)}>
        <DialogContent className="sm:max-w-[700px] bg-brand-cream border-brand-orange border-2">
          <DialogHeader><DialogTitle className="text-2xl text-brand-burgundy">Manage Menu for {managingPlace?.name}</DialogTitle><DialogDescription className="text-brand-orange">Add or view items on your cafe's menu.</DialogDescription></DialogHeader>
          {managingPlace && <ManageMenu place={managingPlace} onMenuItemAdded={handleMenuItemAdded} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}