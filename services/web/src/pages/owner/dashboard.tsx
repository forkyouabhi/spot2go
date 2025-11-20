// services/web/src/pages/owner/dashboard.tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic'; 
import { useAuth } from '../../context/AuthContext';
import { getOwnerPlaces, getOwnerPlaceById, getOwnerBookings, updateBookingStatus, checkInByTicket } from '../../lib/api'; 
import { AddPlaceWizard } from '../../components/AddPlaceWizard';
import { ManageMenu } from '../../components/ManageMenu';
import { toast } from 'sonner';
import { StudyPlace, Booking } from '../../types'; 
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'; 
import { 
  PlusCircle, Clock, CheckCircle, XCircle, Building2, LogOut, Utensils, Edit, MapPin, Loader2, Mail, Users, CalendarDays, Phone,
  UserCheck, UserX, QrCode, Scan, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import Image from 'next/image';

// --- Dynamic Imports ---
const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-black flex items-center justify-center text-white"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }
);

// --- Custom Hook for Data Management ---
const useOwnerData = (user: any, isAuthenticated: boolean) => {
  const [places, setPlaces] = useState<StudyPlace[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
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
      console.error(error);
      toast.error("Could not fetch dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  return { places, bookings, setPlaces, setBookings, isLoading, fetchData };
};

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'approved':
    case 'confirmed': return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" /> {status}</Badge>;
    case 'pending': return <Badge className="bg-amber-500 text-white"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    case 'completed': return <Badge className="bg-blue-600 text-white"><UserCheck className="h-3 w-3 mr-1" /> Completed</Badge>; 
    case 'rejected':
    case 'no-show': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> {status}</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

const StatsOverview = ({ stats }: { stats: any }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <Card className="border-2 border-brand-orange bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Total Places</CardTitle><Building2 className="h-5 w-5 text-brand-orange" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.places.total}</div></CardContent></Card>
    <Card className="border-2 border-green-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Approved</CardTitle><CheckCircle className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.places.approved}</div></CardContent></Card>
    <Card className="border-2 border-amber-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Pending</CardTitle><Clock className="h-5 w-5 text-amber-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.places.pending}</div></CardContent></Card>
    <Card className="border-2 border-blue-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Upcoming</CardTitle><CalendarDays className="h-5 w-5 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.bookings.upcoming}</div></CardContent></Card>
    <Card className="border-2 border-green-600 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Check-ins</CardTitle><UserCheck className="h-5 w-5 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.bookings.checkIns}</div></CardContent></Card>
    <Card className="border-2 border-red-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">No-shows</CardTitle><UserX className="h-5 w-5 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{stats.bookings.noShows}</div></CardContent></Card>
  </div>
);

const PendingVerification = ({ onLogout }: { onLogout: () => void }) => (
  <div className="min-h-screen bg-brand-cream">
     <header className="w-full bg-brand-burgundy shadow-md sticky top-0 z-20 p-4 flex justify-between items-center max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          <Image src="/logo-mark.png" alt="Spot2Go Logo" width={40} height={40} className="object-contain"/>
          <h1 className="text-2xl font-bold text-brand-cream">Owner Dashboard</h1>
        </div>
        <Button onClick={onLogout} variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
     </header>
      <main className="p-4 md:p-8 max-w-screen-xl mx-auto">
        <Card className="text-center p-12 border-2 border-dashed border-brand-yellow bg-white shadow-lg max-w-2xl mx-auto">
            <CardHeader>
                <div className="mx-auto bg-yellow-100 rounded-full h-20 w-20 flex items-center justify-center mb-2">
                    <MapPin className="h-10 w-10 text-brand-orange" />
                </div>
                <CardTitle className="text-2xl font-bold text-brand-burgundy mt-4">Location Verification Pending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-gray-700 text-lg">We are currently verifying your business location and details.</p>
                <div className="bg-blue-50 p-4 rounded-lg text-left border border-blue-100">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2"><ShieldAlert className="h-4 w-4"/> Why do we verify?</h4>
                  <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                    <li>To confirm your business exists at the stated location.</li>
                    <li>To ensure a safe and reliable experience for students.</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500">This process typically takes 24-48 hours.</p>
            </CardContent>
        </Card>
      </main>
  </div>
);

// --- Main Dashboard Component ---

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { places, bookings, setPlaces, setBookings, isLoading, fetchData } = useOwnerData(user, isAuthenticated);
  
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [managingPlace, setManagingPlace] = useState<StudyPlace | null>(null);
  const [editingPlace, setEditingPlace] = useState<StudyPlace | null>(null);

  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [mountScanner, setMountScanner] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'owner') {
        router.replace('/');
      } else if (user.status === 'active') {
        fetchData();
      }
    }
  }, [isAuthenticated, loading, user, router, fetchData]);

  // Scanner Lifecycle
  useEffect(() => {
    if (isScannerOpen) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError("Camera API is not supported. Try HTTPS or Localhost.");
            return;
        }
        setCameraError(null);
        const timer = setTimeout(() => setMountScanner(true), 300);
        return () => clearTimeout(timer);
    } else {
        setMountScanner(false);
        setIsProcessingScan(false);
    }
  }, [isScannerOpen]);

  const handleUpdateBookingStatus = async (bookingId: string, status: 'completed' | 'no-show') => {
    try {
      const response = await updateBookingStatus(bookingId, status);
      toast.success(`Booking marked as ${status}.`);
      setBookings(prev => prev.map(b => b.id === bookingId ? response.data.booking : b));
    } catch (error) {
      toast.error("Failed to update booking status.");
    }
  };

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0 && !isProcessingScan) {
      const ticketId = detectedCodes[0].rawValue;
      if (!ticketId) return;

      setIsProcessingScan(true);
      try {
        const response = await checkInByTicket(ticketId);
        toast.success("Ticket Checked In Successfully! ✅");
        
        // Update local state if the booking is in the list, otherwise just re-fetch
        const existingBooking = bookings.find(b => b.ticketId === ticketId);
        if (existingBooking) {
            setBookings(prev => prev.map(b => b.ticketId === ticketId ? response.data.booking : b));
        } else {
            fetchData();
        }
        
        setIsScannerOpen(false); 
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || "Invalid Ticket or Scan Failed.";
        toast.error(errorMsg);
      } finally {
        setTimeout(() => setIsProcessingScan(false), 2000);
      }
    }
  };

  const dashboardStats = useMemo(() => {
    const upcomingBookings = bookings.filter(b => 
      new Date(b.date) >= new Date(new Date().setHours(0,0,0,0)) && b.status === 'confirmed'
    );
    return {
      places: {
        total: places.length,
        approved: places.filter(p => p.status === 'approved').length,
        pending: places.filter(p => p.status === 'pending').length,
      },
      bookings: {
        upcoming: upcomingBookings.length,
        checkIns: bookings.filter(b => b.status === 'completed').length,
        noShows: bookings.filter(b => b.status === 'no-show').length,
      }
    }
  }, [places, bookings]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-brand-cream"><Loader2 className="h-12 w-12 animate-spin text-brand-orange"/></div>;
  if (user.status === 'pending_verification') return <PendingVerification onLogout={logout} />;
  if (user.status === 'rejected') return <div className="min-h-screen flex items-center justify-center bg-brand-cream"><Card className="w-full max-w-md p-6 text-center border-2 border-red-200"><XCircle className="h-12 w-12 text-red-500 mx-auto mb-4"/><h2 className="text-xl font-bold">Account Rejected</h2><Button onClick={logout} variant="outline" className="mt-4">Logout</Button></Card></div>;

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="w-full bg-brand-burgundy shadow-md sticky top-0 z-20">
        <div className="p-4 flex justify-between items-center max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3">
              <Image src="/logo-mark.png" alt="Spot2Go Logo" width={40} height={40} className="object-contain"/>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-brand-cream">Owner Dashboard</h1>
                <p className="text-xs md:text-sm text-brand-yellow">Welcome, {user?.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
               <Button onClick={() => setIsScannerOpen(true)} className="bg-brand-yellow text-brand-burgundy hover:bg-yellow-400 font-semibold">
                <QrCode className="h-5 w-5 mr-2" /> <span className="hidden md:inline">Scan Ticket</span>
              </Button>
              <Button onClick={() => { setEditingPlace(null); setIsAddPlaceOpen(true); }} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-cream font-semibold">
                <PlusCircle className="h-5 w-5 mr-2" /> <span className="hidden md:inline">Add New Spot</span>
              </Button>
              <Button onClick={logout} variant="outline" size="icon" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-screen-xl mx-auto">
        <StatsOverview stats={dashboardStats} />

        <Tabs defaultValue="places" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-brand-cream/50 border-2 border-brand-yellow">
                <TabsTrigger value="places" className="text-brand-burgundy data-[state=active]:bg-brand-orange data-[state=active]:text-brand-cream">My Places</TabsTrigger>
                <TabsTrigger value="bookings" className="text-brand-burgundy data-[state=active]:bg-brand-orange data-[state=active]:text-brand-cream">Manage Bookings ({bookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="places" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 text-brand-burgundy">Your Submitted Places</h2>
              {isLoading ? <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div> : 
              places.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {places.map((place) => (
                    <Card key={place.id} className="border-2 border-brand-yellow bg-white overflow-hidden shadow-lg flex flex-col">
                      <ImageWithFallback src={place.images?.[0] || ''} alt={place.name} className="w-full h-40 object-cover"/>
                      <CardContent className="p-4 flex-grow">
                          <div className="flex justify-between items-start"><h3 className="font-bold text-lg text-brand-burgundy">{place.name}</h3><StatusBadge status={place.status}/></div>
                          <p className="text-sm text-brand-orange flex items-center gap-1 mt-1"><MapPin className="h-4 w-4"/>{place.location.address}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 mt-auto flex items-center gap-2">
                          {place.type === 'cafe' && (
                            <Button onClick={async () => {
                                try { const res = await getOwnerPlaceById(place.id); setManagingPlace(res.data); } 
                                catch { toast.error("Could not load place details."); }
                            }} className="flex-1 bg-brand-burgundy text-white"><Utensils className="h-4 w-4 mr-2" />Menu</Button>
                          )}
                          <Button onClick={() => { setEditingPlace(place); setIsAddPlaceOpen(true); }} variant="outline" className="flex-1 border-brand-orange text-brand-orange"><Edit className="h-4 w-4 mr-2" />Edit</Button>
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

            <TabsContent value="bookings" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 text-brand-burgundy">Customer Bookings</h2>
              {isLoading ? <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div> : 
               bookings.length > 0 ? (
                <Card className="border-2 border-brand-yellow bg-white shadow-lg">
                    <CardContent className="p-0 overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-brand-cream">
                          <TableRow>
                            <TableHead className="text-brand-burgundy">Customer</TableHead>
                            <TableHead className="text-brand-burgundy">Place</TableHead>
                            <TableHead className="text-brand-burgundy">Details</TableHead>
                            <TableHead className="text-brand-burgundy">Status</TableHead>
                            <TableHead className="text-brand-burgundy text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium text-brand-burgundy">
                                {/* CRITICAL FIX: Added Optional Chaining and Fallbacks */}
                                <div className="flex flex-col">
                                  <span>{booking.user?.name || 'Unknown User'}</span>
                                  <span className="text-xs text-gray-500">{booking.ticketId}</span>
                                  <span className="text-xs text-brand-orange flex items-center gap-1 mt-1"><Mail className="h-3 w-3"/>{booking.user?.email || 'No Email'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-700">{booking.place?.name}</TableCell>
                              <TableCell className="text-gray-700">
                                <div>{new Date(booking.date).toLocaleDateString()}</div>
                                <div className="text-xs">{booking.startTime.slice(0,5)} - {booking.endTime.slice(0,5)}</div>
                                <div className="text-xs font-medium">{booking.partySize || 1} Guests</div>
                              </TableCell>
                              <TableCell><StatusBadge status={booking.status}/></TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={booking.status !== 'confirmed'} onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}><CheckCircle className="h-4 w-4"/></Button>
                                    <Button size="sm" variant="outline" className="border-red-500 text-red-500" disabled={booking.status !== 'confirmed'} onClick={() => handleUpdateBookingStatus(booking.id, 'no-show')}><XCircle className="h-4 w-4"/></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                </Card>
              ) : (
                <p className="text-center text-brand-orange p-12">You have no bookings yet.</p>
              )}
            </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAddPlaceOpen} onOpenChange={setIsAddPlaceOpen}>
        <DialogContent className="sm:max-w-[700px] bg-brand-cream border-brand-orange border-2">
          <AddPlaceWizard onSuccess={() => { fetchData(); setIsAddPlaceOpen(false); setEditingPlace(null); }} initialData={editingPlace} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!managingPlace} onOpenChange={() => setManagingPlace(null)}>
        <DialogContent className="sm:max-w-[700px] bg-brand-cream border-brand-orange border-2">
          <DialogHeader><DialogTitle className="text-2xl text-brand-burgundy">Manage Menu</DialogTitle><DialogDescription>Menu items for {managingPlace?.name}</DialogDescription></DialogHeader>
          {managingPlace && <ManageMenu place={managingPlace} onMenuItemAdded={() => { if(managingPlace) getOwnerPlaceById(managingPlace.id).then(res => setManagingPlace(res.data)); fetchData(); }} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md bg-black border-brand-orange border-2 text-white p-6">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white"><Scan className="h-6 w-6 text-brand-orange"/> Scan Ticket QR</DialogTitle>
                <DialogDescription className="text-gray-400">Point camera at ticket QR.</DialogDescription>
            </DialogHeader>
            <div className="w-full h-[350px] bg-black relative overflow-hidden rounded-lg border border-gray-700">
               {cameraError && <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4"><AlertTriangle className="h-12 w-12 text-red-500 mb-4"/><p>{cameraError}</p></div>}
               {mountScanner && !cameraError && <Scanner onScan={handleScan} onError={(err) => console.error(err)} constraints={{ facingMode: 'environment' }} components={{ onOff: true, torch: false }} styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }} />}
               {!mountScanner && !cameraError && <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 text-brand-orange animate-spin"/></div>}
            </div>
            <div className="text-center text-sm text-gray-400 mt-2 h-6">{isProcessingScan ? <span className="text-brand-orange font-medium">Verifying Ticket...</span> : "Waiting for code..."}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}