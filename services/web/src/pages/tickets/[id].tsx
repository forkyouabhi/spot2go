// services/web/src/pages/tickets/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getBookingByTicketId } from '../../lib/api';
import { Booking } from '../../types';
import { Card, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle2, DollarSign, Download } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import Head from 'next/head';
import { toast } from 'sonner';
import QRCode from 'react-qr-code'; 

// FIX: Use Omit to prevent Type Error when overriding properties
interface TicketData extends Omit<Booking, 'place' | 'user'> {
    amount?: number;
    partySize?: number;
    place?: {
        name: string;
        location: { address: string };
        images?: string[]; // Make images optional or ensure they exist
    };
    user?: {
        name: string;
        email: string;
    };
}

export default function TicketPage() {
  const router = useRouter();
  // Use 'id' if your file is named [id].tsx, or 'ticketId' if named [ticketId].tsx
  const { id, ticketId } = router.query; 
  const queryId = id || ticketId; // Handle both cases safely

  const [booking, setBooking] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!queryId) return;

    const fetchTicket = async () => {
      try {
        const response = await getBookingByTicketId(queryId as string);
        setBooking(response.data.booking || response.data);
      } catch (error) {
        console.error(error);
        toast.error("Ticket not found or invalid.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [queryId]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8DC]">
            <Loader2 className="h-12 w-12 animate-spin text-[#DC6B19]" />
        </div>
    );
  }

  if (!booking) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8DC] p-4">
              <h2 className="text-xl font-bold text-[#6C0345] mb-2">Ticket Not Found</h2>
              <Button onClick={() => router.push('/')} variant="outline">Return Home</Button>
          </div>
      );
  }

  const handleDownload = () => {
      toast.success("Download started...");
      // Implement actual PDF download logic here if needed
  };

  return (
    <div className="min-h-screen bg-[#FFF8DC] p-4 md:p-8 flex justify-center items-center">
      <Head>
        <title>Ticket {booking.ticketId} | Spot2Go</title>
      </Head>

      <Card className="w-full max-w-md bg-white shadow-2xl border-0 overflow-hidden rounded-3xl relative animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Decorative Header */}
         <div className="h-32 bg-[#6C0345] relative">
             <div className="absolute inset-0 bg-black/10"></div>
             <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="absolute top-4 left-4 text-white hover:bg-white/20 rounded-full z-10"
             >
                 <ArrowLeft className="h-6 w-6" />
             </Button>
             
             {/* QR Code Container */}
             <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                 <div className="bg-white p-3 rounded-2xl shadow-xl">
                    {booking.ticketId && <QRCode value={booking.ticketId} size={100} />}
                 </div>
             </div>
         </div>

         <div className="pt-16 pb-8 px-6 text-center">
             <h1 className="text-2xl font-bold text-[#6C0345] mb-1">{booking.place?.name || 'Unknown Place'}</h1>
             <p className="text-gray-500 text-sm flex justify-center items-center gap-1">
                 <MapPin className="h-3 w-3" /> {booking.place?.location?.address || 'Address not available'}
             </p>

             {/* Ticket Info Grid */}
             <div className="my-6 border-t border-b border-dashed border-gray-200 py-6 space-y-4">
                 <div className="flex justify-between items-center">
                     <span className="text-gray-500 text-sm flex items-center gap-2">
                         <Calendar className="h-4 w-4 text-[#DC6B19]" /> Date
                     </span>
                     <span className="font-bold text-[#6C0345]">{booking.date}</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-gray-500 text-sm flex items-center gap-2">
                         <Clock className="h-4 w-4 text-[#DC6B19]" /> Time
                     </span>
                     <span className="font-bold text-[#6C0345]">{booking.startTime} - {booking.endTime}</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-gray-500 text-sm flex items-center gap-2">
                         <Users className="h-4 w-4 text-[#DC6B19]" /> Party Size
                     </span>
                     <span className="font-bold text-[#6C0345]">{booking.partySize || 1} Person(s)</span>
                 </div>
                 {booking.amount && Number(booking.amount) > 0 && (
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-[#DC6B19]" /> Total Paid
                        </span>
                        <span className="font-bold text-green-600">
                            ${Number(booking.amount).toFixed(2)}
                        </span>
                     </div>
                 )}
             </div>

             <div className="space-y-2">
                 <p className="text-xs text-gray-400 uppercase tracking-widest">Ticket ID</p>
                 <p className="font-mono text-xl font-bold text-[#DC6B19] tracking-wider">{booking.ticketId}</p>
             </div>
             
             <div className="mt-6 flex justify-center">
                 <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-1 text-sm">
                     <CheckCircle2 className="h-4 w-4 mr-2" /> {booking.status?.toUpperCase()}
                 </Badge>
             </div>
         </div>
         
         <CardFooter className="bg-gray-50 p-4 flex flex-col gap-3">
             <Button 
                onClick={handleDownload}
                variant="outline" 
                className="w-full border-[#DC6B19] text-[#DC6B19] hover:bg-[#DC6B19] hover:text-white"
             >
                 <Download className="h-4 w-4 mr-2" /> Save Ticket
             </Button>
             <p className="text-center text-xs text-gray-400">
                 Present this QR code at the venue to check in.
             </p>
         </CardFooter>
      </Card>
    </div>
  );
}