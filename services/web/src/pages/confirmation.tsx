// services/web/src/pages/confirmation.tsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, MapPin, Calendar, Clock, Download, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useEffect, useState } from 'react';
import { getBookingByTicketId } from '../lib/api';
import { Booking } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

export default function ConfirmationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { ticketId } = router.query;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for user to be loaded
    if (!user) {
      router.replace('/login');
      return;
    }
    
    if (ticketId && typeof ticketId === 'string') {
      const fetchBooking = async () => {
        setLoading(true);
        try {
          const response = await getBookingByTicketId(ticketId);
          setBooking(response.data);
        } catch (error) {
          console.error("Failed to fetch booking", error);
          toast.error("Could not find that booking.");
          router.push('/');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    } else if (router.isReady && !ticketId) {
      // If the page is loaded without a ticketId
      toast.error("Invalid booking link.");
      router.push('/');
    }
  }, [ticketId, router, user, authLoading]);

  // Handler for the "Add to Calendar" button
  const handleCalendarDownload = () => {
    if (booking) {
      // Use the API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      // This links directly to the API endpoint
      window.open(`${apiUrl}/bookings/${booking.id}/calendar?token=${localStorage.getItem('token')}`);
    }
  };

  if (authLoading || loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 className="h-12 w-12 animate-spin text-brand-orange" />
      </div>
    );
  }
  
  // We now have the full booking object!
  const { place, user: customer, date, startTime, endTime } = booking;

  return (
    <>
      <Head>
        <title>Spot2Go | Booking Confirmed</title>
      </Head>
      <div className="min-h-screen bg-brand-cream p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-lg bg-white border-2 border-brand-orange shadow-2xl animate-scale-in">
          <CardHeader className="text-center items-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-brand-burgundy pt-4">Booking Confirmed!</CardTitle>
            <CardDescription className="text-brand-orange">
              Your spot is reserved. Show this QR code at the counter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* QR Code */}
            <div className="p-4 bg-white rounded-lg border-4 border-brand-burgundy shadow-inner" style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={ticketId as string}
                viewBox={`0 0 256 256`}
              />
            </div>
            <div className="text-center">
              <p className="font-bold text-brand-burgundy text-lg tracking-wider">{ticketId}</p>
            </div>

            {/* Information Card */}
            <Card className="bg-brand-cream/50 border-brand-yellow">
              <CardHeader className="flex flex-row items-center gap-4">
                {/* THIS IS THE FIX FOR THE BUILD ERROR */}
                <ImageWithFallback
                  src={place?.images?.[0] || ''}
                  alt={place?.name || 'Study Spot'}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-brand-yellow"
                />
                <div>
                  <CardTitle className="text-lg text-brand-burgundy">{place?.name}</CardTitle>
                  <CardDescription className="text-brand-orange flex items-center gap-2 pt-1">
                    <MapPin className="h-4 w-4" /> {place?.location.address}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-brand-burgundy border-t border-brand-yellow pt-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-brand-orange" />
                  <div>
                    <p className="text-xs">Booked By</p>
                    <p className="font-semibold">{customer?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-orange" />
                  <div>
                    <p className="text-xs">Date</p>
                    <p className="font-semibold">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Clock className="h-5 w-5 text-brand-orange" />
                  <div>
                    <p className="text-xs">Time</p>
                    <p className="font-semibold">{startTime?.slice(0, 5)} - {endTime?.slice(0, 5)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Button 
              onClick={handleCalendarDownload}
              variant="outline" 
              className="w-full h-12 text-brand-burgundy border-brand-orange hover:bg-brand-yellow/50">
              <Download className="h-4 w-4 mr-2" />
              Add to Calendar (.ics)
            </Button>
            <Link href="/" passHref>
              <Button className="w-full h-12 text-lg font-semibold bg-brand-orange text-brand-cream">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}