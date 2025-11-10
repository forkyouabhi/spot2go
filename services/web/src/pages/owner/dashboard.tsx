// services/web/src/pages/owner/dashboard.tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOwnerPlaces, getOwnerPlaceById, getOwnerBookings, updateBookingStatus } from '../../lib/api'; 
import { AddPlaceWizard } from '../../components/AddPlaceWizard';
import { ManageMenu } from '../../components/ManageMenu';
import { toast } from 'sonner';
import { StudyPlace, Booking, User } from '../../types'; 
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'; 
import { 
  PlusCircle, Clock, CheckCircle, XCircle, Building2, LogOut, Utensils, Edit, MapPin, Loader2, Mail, Users, CalendarDays, Phone,
  UserCheck, UserX 
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import Image from 'next/image';

const PendingVerification = ({ onLogout }: { onLogout: () => void }) => (
  // ... (unchanged)
  <div className="min-h-screen bg-brand-cream">
     <header className="w-full bg-brand-burgundy shadow-md sticky top-0 z-20">
        <div className="p-4 flex justify-between items-center max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-mark.png"
                alt="Spot2Go Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-brand-cream">Owner Dashboard</h1>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
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
  const [bookings, setBookings] = useState<Booking[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [managingPlace, setManagingPlace] = useState<StudyPlace | null>(null);
  const [editingPlace, setEditingPlace] = useState<StudyPlace | null>(null);

  const fetchData = useCallback(async () => {
    // ... (unchanged)
    if (!isAuthenticated || user?.role !== 'owner' || user?.status !== 'active') return;
    setIsLoading(true);
    try {
      const [placesRes, bookingsRes] = await Promise.all([
        getOwnerPlaces(),
        getOwnerBookings()
      ]);
      setPlaces(placesRes.data);
      setBookings(bookingsRes.data); 
    } catch (error) {
      toast.error("Could not fetch your dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // ... (unchanged)
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'owner') {
        router.replace('/');
      } else if (user.status === 'active') {
        fetchData();
      }
    }
  }, [isAuthenticated, loading, user, router, fetchData]);

  const handleOpenManageModal = async (place: StudyPlace) => {
    // ... (unchanged)
    try {
      const response = await getOwnerPlaceById(place.id);
      setManagingPlace(response.data);
    } catch {
      toast.error("Could not load place data.");
    }
  };
  const handleOpenEditModal = (place: StudyPlace) => {
    // ... (unchanged)
    setEditingPlace(place);
    setIsAddPlaceOpen(true);
  };
  const handleSuccess = () => {
    // ... (unchanged)
    fetchData(); 
    setIsAddPlaceOpen(false);
    setEditingPlace(null);
  };
  const handleMenuItemAdded = () => {
    // ... (unchanged)
    if (managingPlace) {
      handleOpenManageModal(managingPlace); 
    }
    fetchData(); 
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'completed' | 'no-show') => {
    // ... (unchanged)
    try {
      const response = await updateBookingStatus(bookingId, status);
      toast.success(`Booking marked as ${status}.`);
      setBookings(bookings.map(b => b.id === bookingId ? response.data.booking : b));
    } catch (error) {
      toast.error("Failed to update booking status.");
    }
  };

  const dashboardStats = useMemo(() => {
    // ... (unchanged)
    const upcomingBookings = bookings.filter(b => 
      new Date(b.date) >= new Date(new Date().setHours(0,0,0,0)) && b.status === 'confirmed'
    );
    const checkIns = bookings.filter(b => b.status === 'completed').length;
    const noShows = bookings.filter(b => b.status === 'no-show').length;

    return {
      places: {
        total: places.length,
        approved: places.filter(p => p.status === 'approved').length,
        pending: places.filter(p => p.status === 'pending').length,
      },
      bookings: {
        upcoming: upcomingBookings.length,
        checkIns: checkIns,
        noShows: noShows,
      }
    }
  }, [places, bookings]);

  const getStatusBadge = (status: string) => {
    // ... (unchanged)
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
    return <PendingVerification onLogout={logout} />;
  }

  if (user.status === 'rejected') {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream">Your account application was rejected. Please contact support.</div>;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="w-full bg-brand-burgundy shadow-md sticky top-0 z-20">
        {/* ... (header unchanged) ... */}
        <div className="p-4 flex justify-between items-center max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-mark.png"
                alt="Spot2Go Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-brand-cream">Owner Dashboard</h1>
                <p className="text-sm text-brand-yellow">Welcome, {user?.name}!</p>
              </div>
            </div>
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

      <main className="p-4 md:p-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* ... (stat cards unchanged) ... */}
          <Card className="border-2 border-brand-orange bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Total Places</CardTitle><Building2 className="h-5 w-5 text-brand-orange" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dashboardStats.places.total}</div></CardContent></Card>
          <Card className="border-2 border-green-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Approved Places</CardTitle><CheckCircle className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dashboardStats.places.approved}</div></CardContent></Card>
          <Card className="border-2 border-amber-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Pending Places</CardTitle><Clock className="h-5 w-5 text-amber-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dashboardStats.places.pending}</div></CardContent></Card>
          <Card className="border-2 border-blue-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Upcoming Bookings</CardTitle><CalendarDays className="h-5 w-5 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dashboardStats.bookings.upcoming}</div></CardContent></Card>
          <Card className="border-2 border-green-600 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Total Check-ins</CardTitle><UserCheck className="h-5 w-5 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dashboardStats.bookings.checkIns}</div></CardContent></Card>
          <Card className="border-2 border-red-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Total No-shows</CardTitle><UserX className="h-5 w-5 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dashboardStats.bookings.noShows}</div></CardContent></Card>
        </div>


        <Tabs defaultValue="places" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-brand-cream/50 border-2 border-brand-yellow">
                <TabsTrigger value="places" className="text-brand-burgundy data-[state=active]:bg-brand-orange data-[state=active]:text-brand-cream">
                    My Places
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-brand-burgundy data-[state=active]:bg-brand-orange data-[state=active]:text-brand-cream">
                    Manage Bookings ({bookings.length})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="places" className="mt-6">
              {/* ... (My Places content unchanged) ... */}
              <h2 className="text-2xl font-semibold mb-4 text-brand-burgundy">Your Submitted Places</h2>
              {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div>
              ) : places.length > 0 ? (
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
            </TabsContent>

            {/* --- MODIFIED: Manage Bookings Tab --- */}
            <TabsContent value="bookings" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 text-brand-burgundy">Customer Bookings</h2>
              <Card className="border-2 border-brand-yellow bg-white overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div>
                  ) : bookings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-brand-cream">
                          <TableRow>
                            <TableHead className="text-brand-burgundy">Customer</TableHead>
                            <TableHead className="text-brand-burgundy">Place</TableHead>
                            <TableHead className="text-brand-burgundy">Date & Time</TableHead>
                            <TableHead className="text-brand-burgundy">Guests</TableHead> {/* <-- NEW COLUMN */}
                            <TableHead className="text-brand-burgundy">Status</TableHead>
                            <TableHead className="text-brand-burgundy text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium text-brand-burgundy">
                                <div className="flex flex-col">
                                  <span>{booking.user.name}</span>
                                  <span className="text-xs text-brand-orange flex items-center gap-1"><Mail className="h-3 w-3"/>{booking.user.email}</span>
                                  <span className="text-xs text-brand-orange flex items-center gap-1"><Phone className="h-3 w-3"/>{booking.user.phone || 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-700">{booking.place.name}</TableCell>
                              <TableCell className="text-gray-700">
                                <div>{new Date(booking.date).toLocaleDateString()}</div>
                                <div className="text-xs">{booking.startTime.slice(0,5)} - {booking.endTime.slice(0,5)}</div>
                              </TableCell>
                              {/* --- NEW CELL --- */}
                              <TableCell className="text-gray-700 font-medium">
                                {booking.partySize || 1} {booking.partySize && booking.partySize > 1 ? 'people' : 'person'}
                              </TableCell>
                              {/* --- END NEW CELL --- */}
                              <TableCell>
                                <Badge variant={booking.status === 'confirmed' ? 'default' : (booking.status === 'completed' ? 'secondary' : 'destructive')}
                                  className={booking.status === 'confirmed' ? 'bg-blue-500 text-white' : (booking.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white')}
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  className="mr-2 bg-green-600 hover:bg-green-700 text-white"
                                  disabled={booking.status !== 'confirmed'}
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1"/> Check-in
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  disabled={booking.status !== 'confirmed'}
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'no-show')}
                                >
                                  <XCircle className="h-4 w-4 mr-1"/> No-show
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-brand-orange p-12">You have no bookings for any of your places yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {/* --- END MODIFICATION --- */}
        </Tabs>
      </main>

      <Dialog open={isAddPlaceOpen} onOpenChange={setIsAddPlaceOpen}>
        <DialogContent className="sm:max-w-[700px] bg-brand-cream border-brand-orange border-2">
          <AddPlaceWizard onSuccess={handleSuccess} initialData={editingPlace} />
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