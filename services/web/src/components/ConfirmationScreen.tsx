import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Calendar, Clock, MapPin, Download } from "lucide-react";
import { StudyPlace, TimeSlot } from '../types';
import { toast } from "sonner";

interface ConfirmationScreenProps {
  place: StudyPlace;
  slot: TimeSlot;
  ticketId: string;
  onGoHome: () => void;
}

export function ConfirmationScreen({ place, slot, ticketId, onGoHome }: ConfirmationScreenProps) {
  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF or iCal file
    toast.info('E-ticket download functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Success Icon and Message */}
        <div>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-brand-burgundy">Booking Confirmed!</h1>
          <p className="text-brand-orange mt-2">Your study spot has been successfully reserved.</p>
        </div>

        {/* E-Ticket Card */}
        <Card className="text-left border-2 border-brand-orange shadow-lg">
          <CardHeader className="text-center bg-brand-cream rounded-t-lg">
            <CardTitle className="text-brand-burgundy">E-Ticket</CardTitle>
            <Badge variant="outline" className="mx-auto border-brand-yellow bg-white text-brand-burgundy">
              {ticketId}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="text-center">
              <h3 className="font-semibold text-xl text-brand-burgundy">{place.name}</h3>
              <p className="text-sm text-gray-600">{place.location.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center border-t border-b border-brand-yellow py-4">
              <div className="space-y-1">
                <Calendar className="h-5 w-5 text-brand-orange mx-auto" />
                <p className="text-sm font-medium text-brand-burgundy">Date</p>
                <p className="text-sm text-gray-600">{new Date(slot.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <Clock className="h-5 w-5 text-brand-orange mx-auto" />
                <p className="text-sm font-medium text-brand-burgundy">Time</p>
                <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Show this ticket upon arrival</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleDownloadTicket}
            variant="outline" 
            className="w-full border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-cream"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download E-Ticket
          </Button>
          
          <Button 
            onClick={onGoHome}
            className="w-full bg-brand-burgundy text-brand-cream hover:bg-brand-burgundy/90" 
            size="lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}