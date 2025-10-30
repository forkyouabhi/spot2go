import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react"; // Replaced Sparkles with MapPin
import { StudyPlace, TimeSlot } from '../types';
import { toast } from "sonner";

// Simple SVG placeholder for a QR code
const QrCode = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 33 33" className="shadow-md rounded-lg bg-white p-1 border border-brand-yellow">
        <path fill="#6C0345" d="M0 0h11v11H0zM4 4h3v3H4zM11 0h11v11H11zM15 4h3v3h-3zM22 0h11v11H22zM26 4h3v3h-3zM0 11h11v11H0zM4 15h3v3H4zM11 11h11v11H11zM22 11h11v11H22zM26 15h3v3h-3zM0 22h11v11H0zM4 26h3v3H4zM11 22h11v11H11zM15 26h3v3h-3zM22 22h11v11H22zM26 26h3v3h-3z"></path>
    </svg>
);

// Apple Wallet SVG icon
const AppleWalletIcon = () => (
  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.36,8.23a3.54,3.54,0,0,0-2.42,1,3.33,3.33,0,0,0-2.32,1,3.14,3.14,0,0,0-2.22-1,3.42,3.42,0,0,0-3.32,2.4H4.25a2.5,2.5,0,0,0,0,5H9.08a3.42,3.42,0,0,0,3.32,2.4,3.14,3.14,0,0,0,2.22-1,3.33,3.33,0,0,0,2.32-1,3.54,3.54,0,0,0,2.42-1H20V10.63h-.25A3.76,3.76,0,0,0,19.36,8.23Zm-1.5,5.27a1,1,0,0,1-1,.7H12.4a1,1,0,0,1-1-.7,1,1,0,0,1,1-.7h4.46A1,1,0,0,1,17.86,13.5Z"/>
  </svg>
);


interface ConfirmationScreenProps {
  place: StudyPlace;
  slot: TimeSlot;
  ticketId: string;
  onGoHome: () => void;
}

export function ConfirmationScreen({ place, slot, ticketId, onGoHome }: ConfirmationScreenProps) {
  const handleAddToWallet = () => {
    toast.info('Apple Wallet pass generation is coming soon!');
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-brand-burgundy">Booking Confirmed!</h1>
          <p className="text-brand-orange mt-2">Your e-ticket is ready. Show this upon arrival.</p>
        </div>

        <Card className="text-left border-2 border-brand-orange shadow-lg w-full">
          <CardHeader className="text-center bg-brand-cream rounded-t-lg p-4">
            <div className="flex items-center justify-center gap-2">
                {/* --- ICON FIX: Replaced Sparkles with MapPin --- */}
                <MapPin className="h-6 w-6 text-brand-orange"/>
                <CardTitle className="text-brand-burgundy">Spot2Go E-Ticket</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="text-center pb-4 border-b border-brand-yellow">
              <h3 className="font-semibold text-xl text-brand-burgundy">{place.name}</h3>
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1"><MapPin className="h-4 w-4" />{place.location?.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center py-4">
              <div className="space-y-1">
                <Calendar className="h-5 w-5 text-brand-orange mx-auto" />
                <p className="text-sm font-medium text-brand-burgundy">Date</p>
                <p className="text-sm text-gray-600">{new Date(slot.date).toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <Clock className="h-5 w-5 text-brand-orange mx-auto" />
                <p className="text-sm font-medium text-brand-burgundy">Time</p>
                <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t border-brand-yellow">
                <QrCode />
                <Badge variant="outline" className="mx-auto border-brand-yellow bg-white text-brand-burgundy font-mono text-lg py-1 px-4">
                    {ticketId}
                </Badge>
            </div>
          </CardContent>
        </Card>
        
        <div className="w-full space-y-3">
            <Button onClick={handleAddToWallet} className="w-full h-12 bg-black text-white hover:bg-gray-800 text-base flex items-center justify-center">
                 <AppleWalletIcon />
                 Add to Apple Wallet
            </Button>
            <Button onClick={onGoHome} className="w-full h-12 bg-brand-burgundy text-brand-cream hover:bg-brand-burgundy/90 text-base">
                Back to Home
            </Button>
        </div>

      </div>
    </div>
  );
}