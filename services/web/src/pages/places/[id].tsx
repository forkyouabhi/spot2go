// services/web/src/pages/places/[id].tsx
import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { getPlaceById, createBooking } from '../../lib/api';
import { StudyPlace, Review, TimeSlot } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar } from "../../components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ImageCarouselModal } from '../../components/ImageCarouselModal';
import { MapPin, Star, Loader2, Info, Utensils, MessageSquare, ArrowLeft, Navigation, Clock, Calendar as CalendarIcon, Hourglass, Users } from 'lucide-react'; // <-- IMPORTED Users
import dynamic from 'next/dynamic';
import { Label } from '../../components/ui/label';
import Image from 'next/image'; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const StaticMap = dynamic(() => import('../../components/StaticMap').then(mod => mod.StaticMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg"><Loader2 className="h-6 w-6 animate-spin"/></div>
});

const ReviewCard = ({ review }: { review: Review }) => {
  // ... (unchanged)
  const userName = review.user?.name || review.userName;
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';
  
  return (
    <Card className="bg-white border-brand-yellow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-brand-burgundy text-brand-cream rounded-full h-8 w-8 flex items-center justify-center font-semibold">
            {userInitial}
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-brand-burgundy">{userName}</CardTitle>
            <p className="text-xs text-brand-orange">{new Date(review.date || review.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">{review.comment}</p>
      </CardContent>
    </Card>
  );
};

// --- MODIFIED: BookingWidget ---
const BookingWidget = ({ place, onConfirmBooking, isBooking }: { place: StudyPlace, onConfirmBooking: (slot: TimeSlot, duration: number, partySize: number) => void, isBooking: boolean }) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [duration, setDuration] = useState(1);
    const [partySize, setPartySize] = useState(1);
    
    // --- FIX 1: Cap the max capacity for the dropdown at 6 ---
    const maxCapacity = Math.min(place.maxCapacity || 1, 6);
    // --- END FIX 1 ---

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // --- FIX 2: Helper to check if a date is today ---
    const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    };
    // --- END FIX 2 ---

    const slotsForDate = useMemo(() => {
      return place.availableSlots?.filter(
        slot => selectedDate && slot.date === formatDate(selectedDate)
      ) || [];
    }, [place.availableSlots, selectedDate]);

    // Filter start times based on selected duration AND party size
    const availableStartTimes = useMemo(() => {
      const durationInSlots = duration * 2; // 1 hour = 2 slots

      // --- FIX 3: Get current time if today ---
      let now = null;
      if (selectedDate && isToday(selectedDate)) {
        const d = new Date();
        now = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      }
      // --- END FIX 3 ---
      
      return slotsForDate.filter((slot, index) => {
        // --- FIX 4: Filter out past times ---
        if (now && slot.startTime <= now) {
          return false;
        }
        // --- END FIX 4 ---

        // Check if this slot meets party size
        if (slot.remainingCapacity < partySize) return false;

        // Check if subsequent slots for the duration are all available
        let canBook = true;
        for (let i = 0; i < durationInSlots; i++) {
          const nextSlot = slotsForDate[index + i];
          // Check if slot exists and has enough capacity
          if (!nextSlot || nextSlot.remainingCapacity < partySize) {
            canBook = false;
            break;
          }
        }
        return canBook;
      });
    }, [slotsForDate, duration, partySize, selectedDate]); // <-- Re-run when selectedDate changes

    useEffect(() => {
        setSelectedSlot(null);
    }, [selectedDate, duration, partySize]);

    // Generate options for party size select
    const partySizeOptions = Array.from({ length: maxCapacity }, (_, i) => i + 1);

    return (
        <Card className="shadow-lg border-2 border-brand-orange bg-white">
            <CardHeader>
                <CardTitle className="text-2xl text-brand-burgundy">Book a Spot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="font-medium text-brand-burgundy mb-2 flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-brand-orange" />Select Date</Label>
                    <div className="flex justify-center">
                      <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                          className="rounded-xl border-2 p-0 bg-brand-cream inline-block"
                          style={{ borderColor: '#F7C566' }}
                      />
                    </div>
                </div>

                {/* --- Party Size & Duration Row --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium text-brand-burgundy mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-brand-orange" />Party Size</Label>
                    <Select value={partySize.toString()} onValueChange={(val) => setPartySize(Number(val))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {partySizeOptions.map(size => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} {size > 1 ? 'People' : 'Person'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-medium text-brand-burgundy mb-2 flex items-center gap-2"><Hourglass className="h-4 w-4 text-brand-orange" />Duration</Label>
                    <Select value={duration.toString()} onValueChange={(val) => setDuration(Number(val))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Hour</SelectItem>
                        <SelectItem value="1.5">1.5 Hours</SelectItem>
                        <SelectItem value="2">2 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* --- END: Party Size & Duration Row --- */}


                <div>
                    <Label className="font-medium text-brand-burgundy mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-brand-orange" />Available Start Times</Label>
                    {availableStartTimes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {availableStartTimes.map((slot) => (
                            <Button
                                key={slot.startTime}
                                variant="outline"
                                className={`h-10 p-2 flex items-center justify-center rounded-xl border-2 transition-transform ${selectedSlot?.startTime === slot.startTime ? 'shadow-lg scale-105' : ''}`}
                                style={selectedSlot?.startTime === slot.startTime
                                ? { backgroundColor: '#DC6B19', color: '#FFF8DC', borderColor: '#6C0345' }
                                : { backgroundColor: '#F7C566', color: '#6C0345', borderColor: '#DC6B19' }}
                                onClick={() => setSelectedSlot(slot)}
                            >
                                <span className="font-semibold text-sm">{slot.startTime}</span>
                            </Button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-brand-orange py-4">No slots available for this date, duration, and party size.</p>
                    )}
                </div>
                 <Button
                    onClick={() => selectedSlot && onConfirmBooking(selectedSlot, duration, partySize)}
                    disabled={!selectedSlot || isBooking}
                    size="lg" className="w-full h-12 text-lg font-bold bg-brand-orange text-brand-cream"
                >
                   {isBooking ? <Loader2 className="h-6 w-6 animate-spin" /> : (selectedSlot ? 'Confirm Booking' : 'Select a Start Time')}
                </Button>
            </CardContent>
        </Card>
    );
};
// --- END MODIFICATION ---

export default function PlaceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [place, setPlace] = useState<StudyPlace | null>(null);
  // ... (rest of state remains unchanged)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const mobileBookingSectionRef = useRef<HTMLDivElement>(null);
  const [isBookingWidgetVisible, setIsBookingWidgetVisible] = useState(false);

  useEffect(() => {
    // ... (intersection observer unchanged)
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBookingWidgetVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const currentRef = mobileBookingSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    // ... (auth/role checks unchanged)
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role && user.role !== 'customer') {
      toast.error("Owners cannot browse places. Redirecting to your dashboard.");
      router.replace(user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard');
      return;
    }

    if (id && isAuthenticated) {
      const fetchPlace = async () => {
        try {
          const response = await getPlaceById(id as string);
          setPlace(response.data);
        } catch (error) {
          toast.error("Could not load place details.");
          router.push('/');
        }
      };
      fetchPlace();
    }
  }, [id, isAuthenticated, authLoading, router, user]);

  const handleGetDirections = () => {
    // ... (unchanged)
    if (!place?.location?.lat || !place?.location?.lng) {
      toast.error("Location data is not available for directions.");
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // --- MODIFIED: Handle Confirm Booking ---
  const handleConfirmBooking = async (slot: TimeSlot, duration: number, partySize: number) => {
    if (!place || !user) return;
    setIsBooking(true);
    try {
        const bookingData = {
            placeId: place.id,
            userId: user.id,
            date: slot.date,
            startTime: slot.startTime,
            duration: duration,
            partySize: partySize, // <-- Pass partySize
            amount: place.pricePerHour ? place.pricePerHour * duration * partySize : 0, // <-- Update amount
        };

        const response = await createBooking(bookingData);
        const { booking } = response.data;

        toast.success("Booking confirmed!");

        router.push(`/confirmation?ticketId=${booking.ticketId}`);
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || "Booking failed. Please try again.";
        toast.error(errorMessage);
        if (id) {
           const updatedResponse = await getPlaceById(id as string);
           setPlace(updatedResponse.data);
        }
    } finally {
        setIsBooking(false);
    }
  };
  // --- END MODIFICATION ---

  const hasReservations = place?.reservable && place?.availableSlots && place.availableSlots.length > 0;

  if (authLoading || !place) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream"><Loader2 className="h-12 w-12 animate-spin text-brand-orange"/></div>;
  }

  return (
    <>
      <Head>
        <title>Spot2Go | {place.name}</title>
      </Head>
      {/* ... (rest of the JSX remains unchanged) ... */}
       {place.images && <ImageCarouselModal images={place.images} open={isModalOpen} onOpenChange={setIsModalOpen} />}

      <div className="min-h-screen bg-brand-cream">
         <header className="p-4 bg-brand-burgundy border-b sticky top-0 z-30 shadow-md">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center">
              <div onClick={() => router.push('/')} className="flex items-center gap-3 cursor-pointer">
                <Image 
                  src="/logo-mark.png" 
                  alt="Spot2Go Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
                <h1 className="text-xl font-bold text-brand-cream hidden sm:block">Spot2Go</h1>
              </div>
              <Button variant="ghost" onClick={() => router.push('/')} className="text-brand-cream hover:bg-brand-cream/10 border-brand-orange border">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to places
              </Button>
           </div>
         </header>

         <main className="max-w-screen-xl mx-auto p-4 md:p-8 pb-24">
          <div
            className="h-48 md:h-80 w-full grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden mb-6 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
              <div className="col-span-4 md:col-span-3 row-span-2">
                  <ImageWithFallback src={place.images?.[0] || ''} alt={place.name} className="w-full h-full object-cover" />
              </div>
              <ImageWithFallback src={place.images?.[1] || ''} alt={place.name} className="w-full h-full object-cover hidden md:block" />
              <div className="relative hidden md:block">
                  <ImageWithFallback src={place.images?.[2] || ''} alt={place.name} className="w-full h-full object-cover" />
                  {place.images && place.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                          +{place.images.length - 3} Photos
                      </div>
                  )}
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                  <div className="mb-6 bg-white p-6 rounded-lg border-2 border-brand-yellow">
                      <h1 className="text-4xl font-bold text-brand-burgundy">{place.name}</h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-orange mt-2">
                          <Badge className="bg-brand-yellow text-brand-burgundy font-semibold">{place.type}</Badge>
                          <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {place.rating || 'New'} ({place.reviews?.length || 0} reviews)</div>
                          {place.pricePerHour && place.pricePerHour > 0 && <span>${place.pricePerHour}.00 / hour (est.)</span>}
                      </div>
                      <div className="flex flex-wrap justify-between items-center mt-4">
                        <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin className="h-4 w-4" />{place.location.address}</p>
                        <Button onClick={handleGetDirections} variant="outline" size="sm" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream mt-2 sm:mt-0">
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                  </div>

                  <Tabs defaultValue="about" className="w-full">
                      <TabsList className="bg-white border"><TabsTrigger value="about"><Info className="h-4 w-4 mr-2"/>About</TabsTrigger>{place.menuItems && place.menuItems.length > 0 && <TabsTrigger value="menu"><Utensils className="h-4 w-4 mr-2"/>Menu</TabsTrigger>}<TabsTrigger value="reviews"><MessageSquare className="h-4 w-4 mr-2"/>Reviews ({place.reviews?.length || 0})</TabsTrigger></TabsList>
                      <TabsContent value="about" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow">
                          <div className="space-y-6">
                              <h3 className="font-semibold text-xl text-brand-burgundy flex items-center gap-2"><Info />Description</h3>
                              <p className="text-sm text-gray-800">{place.description || 'No description available.'}</p>
                              <h3 className="font-semibold text-xl text-brand-burgundy flex items-center gap-2">Amenities</h3>
                              <div className="flex flex-wrap gap-2">{place.amenities?.map(a=><Badge key={a} variant="outline" className="border-brand-orange text-brand-burgundy">{a}</Badge>)}</div>
                              <div>
                                  <h3 className="font-semibold text-xl text-brand-burgundy mb-2 flex items-center gap-2"><MapPin />Location</h3>
                                  <div className="h-64 w-full rounded-lg overflow-hidden border-2 border-brand-yellow z-0 relative">
                                      <StaticMap location={place.location} />
                                  </div>
                              </div>
                          </div>
                      </TabsContent>
                      <TabsContent value="menu" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow">{place.menuItems && place.menuItems.length > 0 ? <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader><TableBody>{place.menuItems.map((i,idx)=><TableRow key={idx}><TableCell>{i.name}</TableCell><TableCell className="text-right">${parseFloat(i.price).toFixed(2)}</TableCell></TableRow>)}</TableBody></Table> : <p>No menu available.</p>}</TabsContent>
                      <TabsContent value="reviews" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow">
                        <div className="space-y-4">
                          {place.reviews && place.reviews.length > 0 ? (
                            place.reviews.map(review => <ReviewCard key={review.id} review={review} />)
                          ) : (
                            <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to leave one!</p>
                          )}
                        </div>
                      </TabsContent>
                  </Tabs>
              </div>

              {hasReservations && (
                <div className="hidden lg:block lg:sticky top-24 self-start">
                    <BookingWidget place={place} onConfirmBooking={handleConfirmBooking} isBooking={isBooking} />
                </div>
              )}
          </div>

           {hasReservations && (
                <div ref={mobileBookingSectionRef} id="booking-section" className="lg:hidden pt-8">
                     <BookingWidget place={place} onConfirmBooking={handleConfirmBooking} isBooking={isBooking} />
                </div>
            )}
         </main>

         {hasReservations && !isBookingWidgetVisible && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t-2 z-20" style={{borderColor: '#F7C566'}}>
                <Button
                    onClick={() => mobileBookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full max-w-screen-xl mx-auto h-14 rounded-2xl font-semibold text-lg shadow-xl"
                    style={{ backgroundColor: '#DC6B19', color: '#FFF8DC' }}
                    size="lg"
                >
                    Book Now
                </Button>
            </div>
         )}

      </div>
    </>
  );
}