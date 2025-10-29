// services/web/src/pages/places/[id].tsx

import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react'; // Import useRef
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
import { MapPin, Star, Loader2, Info, Utensils, MessageSquare, ArrowLeft, Sparkles, Navigation, Clock, Calendar as CalendarIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Label } from '../../components/ui/label';

// Dynamically import maps (remains the same)
const StaticMap = dynamic(() => import('../../components/StaticMap').then(mod => mod.StaticMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg"><Loader2 className="h-6 w-6 animate-spin"/></div>
});

// Review Card Component (remains the same)
const ReviewCard = ({ review }: { review: Review }) => (
  // ... (ReviewCard code remains the same)
    <Card className="bg-white border-brand-yellow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div className="flex items-center gap-3">
        <div className="bg-brand-burgundy text-brand-cream rounded-full h-8 w-8 flex items-center justify-center font-semibold">{review.userName.charAt(0)}</div>
        <div>
          <CardTitle className="text-sm font-semibold text-brand-burgundy">{review.userName}</CardTitle>
          <p className="text-xs text-brand-orange">{new Date(review.date).toLocaleDateString()}</p>
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

// Updated Booking Widget Component (remains the same)
const BookingWidget = ({ place, onConfirmBooking, isBooking }: { place: StudyPlace, onConfirmBooking: (slot: TimeSlot) => void, isBooking: boolean }) => {
    // ... (BookingWidget code remains the same)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const availableSlotsForDate = place.availableSlots?.filter(
        slot => selectedDate && slot.date === formatDate(selectedDate) && slot.available
    ) || [];

    useEffect(() => {
        // Reset selected slot when the date changes
        setSelectedSlot(null);
    }, [selectedDate]);

    return (
        <Card className="shadow-lg border-2 border-brand-orange bg-white">
            <CardHeader>
                <CardTitle className="text-2xl text-brand-burgundy">Book a Spot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="font-medium text-brand-burgundy mb-2 flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-brand-orange" />Select Date</Label>
                    {/* Centering div added */}
                    <div className="flex justify-center">
                      <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // Disable past dates and dates more than 7 days ahead
                          className="rounded-xl border-2 p-0 bg-brand-cream inline-block" // Added inline-block for centering
                          style={{ borderColor: '#F7C566' }}
                      />
                    </div>
                </div>
                <div>
                    <Label className="font-medium text-brand-burgundy mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-brand-orange" />Available Times</Label>
                    {availableSlotsForDate.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {availableSlotsForDate.map((slot) => (
                            <Button
                                key={slot.id}
                                className={`h-auto p-2 flex flex-col items-center rounded-xl border-2 transition-transform ${selectedSlot?.id === slot.id ? 'shadow-lg scale-105' : ''}`}
                                style={selectedSlot?.id === slot.id
                                ? { backgroundColor: '#DC6B19', color: '#FFF8DC', borderColor: '#6C0345' } // Orange background when selected
                                : { backgroundColor: '#F7C566', color: '#6C0345', borderColor: '#DC6B19' }} // Yellow background otherwise
                                onClick={() => setSelectedSlot(slot)}
                            >
                                <span className="font-semibold text-sm">{slot.startTime}</span>
                                <span className="text-xs opacity-80">to {slot.endTime}</span>
                            </Button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-brand-orange py-4">No slots available for this date.</p>
                    )}
                </div>
                 <Button
                    onClick={() => selectedSlot && onConfirmBooking(selectedSlot)}
                    disabled={!selectedSlot || isBooking}
                    size="lg" className="w-full h-12 text-lg font-bold bg-brand-orange text-brand-cream"
                >
                   {isBooking ? <Loader2 className="h-6 w-6 animate-spin" /> : (selectedSlot ? 'Confirm Booking' : 'Select a Slot')}
                </Button>
            </CardContent>
        </Card>
    );
};


// Main Page Component
export default function PlaceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [place, setPlace] = useState<StudyPlace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const mobileBookingSectionRef = useRef<HTMLDivElement>(null);

  // --- MODIFICATION START ---
  // State to track if the booking widget is visible
  const [isBookingWidgetVisible, setIsBookingWidgetVisible] = useState(false);

  // Effect to set up the IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state based on whether the booking widget section is intersecting with the viewport
        setIsBookingWidgetVisible(entry.isIntersecting);
      },
      {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    const currentRef = mobileBookingSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount
  // --- MODIFICATION END ---


  // ... (useEffect for fetching place data remains the same)
    useEffect(() => {
    if (id && isAuthenticated) {
      const fetchPlace = async () => {
        try {
          const response = await getPlaceById(id as string);
          setPlace(response.data);
        } catch (error) {
          toast.error("Could not load place details.");
          router.push('/'); // Redirect if place not found or error
        }
      };
      fetchPlace();
    } else if (!authLoading && !isAuthenticated) {
        router.push('/login'); // Redirect to login if not authenticated
    }
  }, [id, isAuthenticated, authLoading, router]);


  // ... (handleGetDirections remains the same)
  const handleGetDirections = () => {
    if (!place?.location?.lat || !place?.location?.lng) {
      toast.error("Location data is not available for directions.");
      return;
    }
    // Updated Google Maps URL format
    const url = `http://googleusercontent.com/maps.google.com/2{place.location.lat},${place.location.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ... (handleConfirmBooking remains the same)
    const handleConfirmBooking = async (slot: TimeSlot) => {
    if (!place || !user) return; // Ensure place and user are loaded
    setIsBooking(true);
    try {
        // Prepare data for the API call
        const bookingData = {
            placeId: place.id,
            userId: user.id, // Make sure user ID is available
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            amount: place.pricePerHour ? place.pricePerHour * 2 : 0, // Calculate amount, assuming 2hr slots for now
            // Payment logic would go here in a real app
        };

        // Call the API to create the booking
        const response = await createBooking(bookingData);
        const { booking } = response.data; // Get booking details from response

        toast.success("Booking confirmed!");

        // Navigate to confirmation page with details
        router.push({
            pathname: '/confirmation',
            query: {
                placeName: place.name,
                placeAddress: place.location.address,
                date: booking.date,
                startTime: booking.startTime, // Use confirmed booking time
                endTime: booking.endTime,     // Use confirmed booking time
                ticketId: booking.ticketId,   // Use ticket ID from response
            },
        });
    } catch (error: any) {
        // Handle errors (e.g., slot already booked, server error)
        const errorMessage = error.response?.data?.error || "Booking failed. Please try again.";
        toast.error(errorMessage);
        // Optionally, refresh place data to show updated slot availability
        if (id) {
           const updatedResponse = await getPlaceById(id as string);
           setPlace(updatedResponse.data);
        }
    } finally {
        setIsBooking(false); // Reset booking state
    }
  };


  const hasReservations = place?.reservable && place?.availableSlots && place.availableSlots.length > 0;

  if (authLoading || !place) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream"><Loader2 className="h-12 w-12 animate-spin text-brand-orange"/></div>;
  }

  return (
    <>
      <Head>
        <title>Spot2Go | {place.name}</title>
      </Head>
      {place.images && <ImageCarouselModal images={place.images} open={isModalOpen} onOpenChange={setIsModalOpen} />}

      <div className="min-h-screen bg-brand-cream">
         <header className="p-4 bg-brand-burgundy border-b sticky top-0 z-30 shadow-md">
           {/* ... (Header remains the same) ... */}
            <div className="max-w-screen-xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-brand-yellow" />
                <h1 className="text-xl font-bold text-brand-cream hidden sm:block">Spot2Go</h1>
              </div>
              <Button variant="ghost" onClick={() => router.push('/')} className="text-brand-cream hover:bg-brand-cream/10 border-brand-orange border">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to places
              </Button>
           </div>
         </header>

         <main className="max-w-screen-xl mx-auto p-4 md:p-8 pb-24">
          {/* ... (Image Grid remains the same) ... */}
          <div
            className="h-48 md:h-80 w-full grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden mb-6 cursor-pointer"
            onClick={() => setIsModalOpen(true)} // Open modal on click
          >
              <div className="col-span-4 md:col-span-3 row-span-2">
                  <ImageWithFallback src={place.images?.[0] || ''} alt={place.name} className="w-full h-full object-cover" />
              </div>
              <ImageWithFallback src={place.images?.[1] || ''} alt={place.name} className="w-full h-full object-cover hidden md:block" />
              <div className="relative hidden md:block"> {/* Show '+X Photos' overlay */}
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
                  {/* ... (Place Header Info and Tabs remain the same) ... */}
                   {/* Place Header Info */}
                  <div className="mb-6 bg-white p-6 rounded-lg border-2 border-brand-yellow">
                      <h1 className="text-4xl font-bold text-brand-burgundy">{place.name}</h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-orange mt-2">
                          <Badge className="bg-brand-yellow text-brand-burgundy font-semibold">{place.type}</Badge>
                          <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {place.rating || 'New'}</div>
                          {/* Display price if available */}
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

                  {/* Tabs for Details */}
                  <Tabs defaultValue="about" className="w-full">
                      <TabsList className="bg-white border"><TabsTrigger value="about">About</TabsTrigger>{place.menuItems && place.menuItems.length > 0 && <TabsTrigger value="menu">Menu</TabsTrigger>}<TabsTrigger value="reviews">Reviews</TabsTrigger></TabsList>
                      {/* About Tab */}
                      <TabsContent value="about" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow">
                          <div className="space-y-6">
                              <h3 className="font-semibold text-xl text-brand-burgundy flex items-center gap-2"><Info />Description</h3>
                              <p className="text-sm text-gray-800">{place.description || 'No description available.'}</p>
                              <h3 className="font-semibold text-xl text-brand-burgundy flex items-center gap-2">Amenities</h3>
                              <div className="flex flex-wrap gap-2">{place.amenities?.map(a=><Badge key={a} variant="outline" className="border-brand-orange text-brand-burgundy">{a}</Badge>)}</div>
                              <div>
                                  <h3 className="font-semibold text-xl text-brand-burgundy mb-2 flex items-center gap-2"><MapPin />Location</h3>
                                  <div className="h-64 w-full rounded-lg overflow-hidden border-2 border-brand-yellow z-0 relative">
                                      {/* Static Map Component */}
                                      <StaticMap location={place.location} />
                                  </div>
                              </div>
                          </div>
                      </TabsContent>
                      {/* Menu Tab */}
                      <TabsContent value="menu" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow">{place.menuItems && place.menuItems.length > 0 ? <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader><TableBody>{place.menuItems.map((i,idx)=><TableRow key={idx}><TableCell>{i.name}</TableCell><TableCell className="text-right">${parseFloat(i.price).toFixed(2)}</TableCell></TableRow>)}</TableBody></Table> : <p>No menu available.</p>}</TabsContent>
                      {/* Reviews Tab */}
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

              {/* Desktop Booking Widget */}
              {hasReservations && (
                <div className="hidden lg:block lg:sticky top-24 self-start">
                    <BookingWidget place={place} onConfirmBooking={handleConfirmBooking} isBooking={isBooking} />
                </div>
              )}
          </div>

           {/* Mobile Booking Section */}
           {hasReservations && (
                <div ref={mobileBookingSectionRef} id="booking-section" className="lg:hidden pt-8">
                     <BookingWidget place={place} onConfirmBooking={handleConfirmBooking} isBooking={isBooking} />
                </div>
            )}
         </main>

         {/* --- MODIFICATION START --- */}
         {/* Mobile Floating Button - Conditionally render based on widget visibility */}
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
         {/* --- MODIFICATION END --- */}

      </div>
    </>
  );
}