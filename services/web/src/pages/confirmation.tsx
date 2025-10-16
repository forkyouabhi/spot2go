import { useRouter } from 'next/router';
import { ConfirmationScreen } from '../components/ConfirmationScreen';
import { StudyPlace, TimeSlot } from '../types';
import { Loader2 } from 'lucide-react';
import Head from 'next/head';

export default function ConfirmationPage() {
  const router = useRouter();
  const { query } = router;

  // Since we are passing data via query, we construct mock objects
  // for the ConfirmationScreen component.
  const mockPlace: Partial<StudyPlace> = {
    name: query.placeName as string,
    location: { address: query.placeAddress as string },
  };

  const mockSlot: Partial<TimeSlot> = {
    date: query.date as string,
    startTime: query.startTime as string,
    endTime: query.endTime as string,
  };
  
  const ticketId = query.ticketId as string;

  if (!query.placeName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 className="h-12 w-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Spot2Go | Booking Confirmed</title>
      </Head>
      <ConfirmationScreen
        place={mockPlace as StudyPlace}
        slot={mockSlot as TimeSlot}
        ticketId={ticketId}
        onGoHome={() => router.push('/')}
      />
    </>
  );
}