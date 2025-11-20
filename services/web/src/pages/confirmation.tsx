// services/web/src/pages/confirmation.tsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, MapPin, Calendar, Clock, Download, User as UserIcon, Users, DollarSign } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useEffect, useState } from 'react';
import { getBookingByTicketId } from '../lib/api';
import { Booking } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

// Extend Booking to include amount if needed
interface ExtendedBooking extends Booking {
  amount?: string | number;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { ticketId } = router.query;

  const [booking, setBooking] = useState<ExtendedBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; 
    if (!user) {
      router.replace('/login');
      return;
    }
    
    if (user?.role && user.role !== 'customer') {
      toast.error("Owners cannot view booking confirmations.");
      router.replace(user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard');
      return;
    }
    
    if (ticketId && typeof ticketId === 'string') {
      const fetchBooking = async () => {
        setLoading(true);
        try {
          const response = await getBookingByTicketId(ticketId);
          setBooking(response.data.booking || response.data); // Robust handling
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
      toast.error("Invalid booking link.");
      router.push('/');
    }
  }, [ticketId, router, user, authLoading]);

  const handleCalendarDownload = () => {
    if (booking) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      window.open(`${apiUrl}/bookings/${booking.id}/calendar?token=${localStorage.getItem('token')}`);
    }
  };

  if (authLoading || loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8DC]">
        <Loader2 className="h-12 w-12 animate-spin text-[#DC6B19]" />
      </div>
    );
  }
  
  const { place, user: customer, date, startTime, endTime, partySize, amount } = booking; 
  
  // Safely format amount
  const formattedAmount = amount && Number(amount) > 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' }).format(Number(amount))
    : null;

  return (
    <>
      <Head>
        <title>Spot2Go | Booking Confirmed</title>
      </Head>
      <div className="min-h-screen bg-[#FFF8DC] p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-lg bg-white border-2 border-[#DC6B19] shadow-2xl animate-in fade-in duration-500">
          <CardHeader className="text-center items-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#6C0345] pt-4">Booking Confirmed!</CardTitle>
            <CardDescription className="text-[#DC6B19]">
              Your spot is reserved. Show this QR code at the counter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* QR Code */}
            <div className="p-4 bg-white rounded-lg border-4 border-[#6C0345] shadow-inner" style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={booking.ticketId || ''}
                viewBox={`0 0 256 256`}
              />
            </div>
            <div className="text-center">
              <p className="font-bold text-[#6C0345] text-lg tracking-wider font-mono">{booking.ticketId}</p>
            </div>

            {/* Information Card */}
            <Card className="bg-[#FFF8DC]/50 border-[#F7C566]">
              <CardHeader className="flex flex-row items-center gap-4">
                <ImageWithFallback
                  src={place?.images?.[0] || ''}
                  alt={place?.name || 'Study Spot'}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-[#F7C566]"
                />
                <div>
                  <CardTitle className="text-lg text-[#6C0345]">{place?.name}</CardTitle>
                  <CardDescription className="text-[#DC6B19] flex items-center gap-2 pt-1">
                    <MapPin className="h-4 w-4" /> {place?.location?.address}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-[#6C0345] border-t border-[#F7C566] pt-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-[#DC6B19]" />
                  <div>
                    <p className="text-xs text-gray-500">Booked By</p>
                    <p className="font-semibold">{customer?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#DC6B19]" />
                  <div>
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="font-semibold">{partySize || 1} {partySize && partySize > 1 ? 'People' : 'Person'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#DC6B19]" />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-semibold">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#DC6B19]" />
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="font-semibold">{startTime?.slice(0, 5)} - {endTime?.slice(0, 5)}</p>
                  </div>
                </div>
                {formattedAmount && (
                     <div className="flex items-center gap-2 col-span-2 border-t border-[#F7C566]/30 pt-2 mt-2">
                         <DollarSign className="h-5 w-5 text-[#DC6B19]" />
                         <div>
                             <p className="text-xs text-gray-500">Total Paid</p>
                             <p className="font-bold text-green-600">{formattedAmount}</p>
                         </div>
                     </div>
                )}
              </CardContent>
            </Card>
            <Button 
              onClick={handleCalendarDownload}
              variant="outline" 
              className="w-full h-12 text-[#6C0345] border-[#DC6B19] hover:bg-[#F7C566]/20">
              <Download className="h-4 w-4 mr-2" />
              Add to Calendar (.ics)
            </Button>
            <Link href="/" passHref>
              <Button className="w-full h-12 text-lg font-semibold bg-[#DC6B19] text-white hover:bg-[#c25e15]">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}