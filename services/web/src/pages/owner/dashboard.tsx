// services/web/src/pages/owner/dashboard.tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOwnerPlaces, getOwnerPlaceById, getOwnerBookings, updateBookingStatus, checkInByTicket } from '../../lib/api';
import { AddPlaceWizard } from '../../components/AddPlaceWizard';
import { ManageMenu } from '../../components/ManageMenu';
import { toast } from 'sonner';
import { StudyPlace, Booking } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import QrScanner from 'react-qr-scanner';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2, 
  LogOut, 
  Utensils, 
  Edit, 
  MapPin, 
  Loader2, 
  Mail,
  Calendar,
  User as UserIcon,
  BarChart,
  CalendarCheck,
  CalendarDays,
  Check,
  Phone,
  QrCode
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import Image from 'next/image';

const PendingVerification = () => (
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
  const [dataLoading, setDataLoading] = useState(true);
  
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [managingPlace, setManagingPlace] = useState<StudyPlace | null>(null);
  const [editingPlace, setEditingPlace] = useState<StudyPlace | null>(null);
  const [checkingInBooking, setCheckingInBooking] = useState<string | null>(null);

  // State for QR Scanner Modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'owner' || user?.status !== 'active') return;
    setDataLoading(true);
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
      setDataLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'owner') {
        router.replace('/');
      } else if (user.status === 'active') {
        fetchData();
      }
    }
  }, [isAuthenticated, loading, user, router, fetchData]);

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
    fetchData(); // Refreshes places AND bookings
    setIsAddPlaceOpen(false);
    setEditingPlace(null);
  };

  const handleMenuItemAdded = () => {
    if (managingPlace) {
      handleOpenManageModal(managingPlace);
    }
    fetchData();
  };

  const handleCheckIn = async (bookingId: string) => {
    setCheckingInBooking(bookingId);
    try {
      await updateBookingStatus(bookingId, 'completed');
      toast.success('Customer checked in successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to check in customer.');
    } finally {
      setCheckingInBooking(null);
    }
  };
  
  // New Handler for QR Code Scan
  const handleScan = async (data: { text: string } | null) => {
    if (data && !scannerLoading) {
      setScannerLoading(true);
      setScannerError(null);
      try {
        const ticketId = data.text;
        const response = await checkInByTicket(ticketId);
        
        toast.success(response.data.message || 'Check-in successful!');
        setIsScannerOpen(false); // Close modal on success
        fetchData(); // Refresh all data
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Scan failed. Invalid QR code.';
        setScannerError(errorMessage); // Show error in the modal
        toast.error(errorMessage);
      } finally {
        setScannerLoading(false);
      }
    }
  };

  const handleScanError = (err: any) => {
    console.error(err);
    setScannerError("Could not access camera. Please check permissions.");
  };

  const placeStats = useMemo(() => ({
    total: places.length,
    approved: places.filter(p => p.status === 'approved').length,
    pending: places.filter(p => p.status === 'pending').length,
  }), [places]);

  const bookingStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const week = startOfWeek.getTime();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let dayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    for (const booking of bookings) {
      // API sends date as 'YYYY-MM-DD'. Parse this correctly, avoiding timezone shifts.
      const bookingDate = new Date(booking.date + 'T00:00:00').getTime();
      
      if (bookingDate >= startOfMonth) {
        monthCount++;
        if (bookingDate >= week) {
          weekCount++;
          if (bookingDate === today) {
            dayCount++;
          }
        }
      }
    }
    return { day: dayCount, week: weekCount, month: monthCount };
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(b => b.status === 'confirmed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bookings]);

  const pastBookings = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'confirmed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings]);
  
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

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'no-show':
        return <Badge variant="secondary">No-Show</Badge>;
      default:
        return <Badge className="bg-amber-500 text-white">{status}</Badge>;
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream"><Loader2 className="h-12 w-12 animate-spin text-brand-orange"/></div>;
  }

  if (user.status === 'pending_verification') {
    return <PendingVerification />;
  }

  if (user.status === 'rejected') {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4 text-center text-brand-burgundy">Your account application was rejected. Please contact support.</div>;
  }

  // Returns the start time for a booking, or "N/A" if not available
  function bAttribution(b: Booking): React.ReactNode {
    return b.startTime?.slice(0, 5) || "N/A";
  }

  return (
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Row 1: Place Stats */}
          <Card className="border-2 border-brand-orange bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Total Places</CardTitle><Building2 className="h-5 w-5 text-brand-orange" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : placeStats.total}</div></CardContent></Card>
          <Card className="border-2 border-green-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Approved</CardTitle><CheckCircle className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : placeStats.approved}</div></CardContent></Card>
          <Card className="border-2 border-amber-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Pending Review</CardTitle><Clock className="h-5 w-5 text-amber-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : placeStats.pending}</div></CardContent></Card>
          
          {/* Row 2: Booking Stats */}
          <Card className="border-2 border-blue-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Bookings (This Month)</CardTitle><CalendarDays className="h-5 w-5 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : bookingStats.month}</div></CardContent></Card>
          <Card className="border-2 border-blue-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Bookings (This Week)</CardTitle><CalendarCheck className="h-5 w-5 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : bookingStats.week}</div></CardContent></Card>
          <Card className="border-2 border-blue-500 bg-white shadow-lg"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-burgundy">Bookings (Today)</CardTitle><BarChart className="h-5 w-5 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-brand-burgundy">{dataLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : bookingStats.day}</div></CardContent></Card>
        </div>

        {/* Tabs for "My Places" and "Bookings" */}
        <Tabs defaultValue="places" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-brand-cream/50 border-2 border-brand-yellow">
            <TabsTrigger value="places" className="text-brand-burgundy data-[state=active]:bg-brand-orange data-[state=active]:text-brand-cream">
              My Places ({places.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-brand-burgundy data-[state=active]:bg-brand-orange data-[state=active]:text-brand-cream">
              All Bookings ({bookings.length})
            </TabsTrigger>
          </TabsList>

          {/* My Places Tab Content */}
          <TabsContent value="places" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-brand-burgundy">Your Submitted Places</h2>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
              </div>
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

          {/* Bookings Tab Content */}
          <TabsContent value="bookings" className="mt-6 space-y-6">
            <Card className="border-2 rounded-2xl shadow-lg border-brand-yellow bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-brand-burgundy flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-orange"/>Upcoming Bookings
                </CardTitle>
                <Button 
                  className="bg-brand-burgundy text-brand-cream hover:bg-brand-burgundy/90"
                  onClick={() => {
                    setIsScannerOpen(true);
                    setScannerError(null);
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan Check-in
                </Button>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map(b => (
                      <div key={b.id} className="p-4 rounded-lg border-2 border-brand-orange bg-brand-cream">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                          
                          <div className="space-y-1">
                            <h4 className="font-semibold text-brand-burgundy">{b.place?.name}</h4>
                            <p className="text-sm text-brand-burgundy/80 flex items-center gap-2"><UserIcon className="h-4 w-4"/>{b.user?.name}</p>
                            <p className="text-sm text-brand-burgundy/80 flex items-center gap-2"><Mail className="h-4 w-4"/>{b.user?.email}</p>
                            {b.user?.phone && (
                              <p className="text-sm text-brand-burgundy/80 flex items-center gap-2"><Phone className="h-4 w-4"/>{b.user.phone}</p>
                            )}
                          </div>
                          
                          <Badge className="bg-brand-yellow text-brand-burgundy mt-2 sm:mt-0 flex-shrink-0">{b.ticketId}</Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 mt-2">
                          <div className="flex items-center gap-4 text-sm text-brand-burgundy">
                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {b.date}</span>
                           <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {bAttribution(b) || "N/A"} - {b.endTime?.slice(0, 5) || 'N/A'}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                            disabled={checkingInBooking === b.id}
                            onClick={() => handleCheckIn(b.id)}
                          >
                            {checkingInBooking === b.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><Check className="h-4 w-4 mr-2" /> Mark as Completed</>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-brand-orange py-4">No upcoming bookings.</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-2 rounded-2xl shadow-lg border-brand-yellow bg-white">
              <CardHeader>
                <CardTitle className="text-brand-burgundy flex items-center gap-2"><Clock className="h-5 w-5 text-brand-orange"/>Past Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
                  </div>
                ) : pastBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pastBookings.map(b => (
                      <div key={b.id} className="p-4 rounded-lg border border-brand-yellow bg-brand-cream/50 opacity-80">
                        <div className="flex justify-between items-start">
                          
                          <div className="space-y-1">
                            <h4 className="font-semibold text-brand-burgundy">{b.place?.name}</h4>
                            <p className="text-sm text-brand-burgundy/80 flex items-center gap-2"><UserIcon className="h-4 w-4"/>{b.user?.name}</p>
                            <p className="text-sm text-brand-burgundy/80 flex items-center gap-2"><Mail className="h-4 w-4"/>{b.user?.email}</p>
                            {b.user?.phone && (
                              <p className="text-sm text-brand-burgundy/80 flex items-center gap-2"><Phone className="h-4 w-4"/>{b.user.phone}</p>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {getBookingStatusBadge(b.status)}
                            <Badge variant="outline" className="border-brand-orange text-brand-burgundy">{b.ticketId}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-brand-burg गड्ढt-burgundy mt-2">
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {b.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {b.startTime?.slice(0, 5) || 'N/A'} - {b.endTime?.slice(0, 5) || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-brand-orange py-4">No past bookings.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- Dialogs --- */}
      <Dialog open={isAddPlaceOpen} onOpenChange={(isOpen) => { setIsAddPlaceOpen(isOpen); if (!isOpen) setEditingPlace(null); }}>
        <DialogContent className="sm:max-w-[600px] bg-brand-cream border-brand-orange border-2 p-0">
          <AddPlaceWizard onSuccess={handleSuccess} initialData={editingPlace} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!managingPlace} onOpenChange={() => setManagingPlace(null)}>
        <DialogContent className="sm:max-w-[700px] bg-brand-cream border-brand-orange border-2">
          <DialogHeader><DialogTitle className="text-2xl text-brand-burgundy">Manage Menu for {managingPlace?.name}</DialogTitle><DialogDescription className="text-brand-orange">Add or view items on your cafe's menu.</DialogDescription></DialogHeader>
          {managingPlace && <ManageMenu place={managingPlace} onMenuItemAdded={handleMenuItemAdded} />}
        </DialogContent>
      </Dialog>

      {/* --- NEW: QR Code Scanner Modal --- */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="bg-brand-cream border-brand-orange border-2">
          <DialogHeader>
            <DialogTitle className="text-brand-burgundy">Scan Customer's QR Code</DialogTitle>
            <DialogDescription className="text-brand-orange">
              Hold the customer's QR code up to the camera to check them in.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 rounded-lg overflow-hidden border-2 border-brand-orange">
            {isScannerOpen && ( // Only render scanner if modal is open to activate camera
              <QrScanner
                delay={300}
                onError={handleScanError}
                onScan={handleScan}
                style={{ width: '100%' }}
                constraints={{
                  video: { facingMode: "environment" } // Use back camera
                }}
              />
            )}
          </div>
          {scannerLoading && (
            <div className="flex items-center justify-center text-brand-burgundy">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Verifying ticket...
            </div>
          )}
          {scannerError && (
            <p className="text-center font-semibold text-red-600">{scannerError}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}