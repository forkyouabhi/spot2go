import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Calendar, Clock, MapPin, Download } from "lucide-react";
import { StudyPlace, TimeSlot } from '../types';

interface ConfirmationScreenProps {
  place: StudyPlace;
  slot: TimeSlot;
  ticketId: string;
  onGoHome: () => void;
}

export function ConfirmationScreen({ place, slot, ticketId, onGoHome }: ConfirmationScreenProps) {
  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    alert('E-ticket would be downloaded in a real implementation');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl text-green-700">Booking Confirmed!</h1>
          <p className="text-gray-600 mt-2">Your study spot has been reserved</p>
        </div>

        {/* E-Ticket */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>E-Ticket</CardTitle>
            <Badge variant="outline" className="mx-auto">
              {ticketId}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium">{place.name}</h3>
              <p className="text-sm text-gray-600">{place.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <Calendar className="h-5 w-5 text-gray-400 mx-auto" />
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-gray-600">{slot.date}</p>
              </div>
              <div className="space-y-1">
                <Clock className="h-5 w-5 text-gray-400 mx-auto" />
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Show this ticket when you arrive</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleDownloadTicket}
            variant="outline" 
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download E-Ticket
          </Button>
          
          <Button 
            onClick={onGoHome}
            className="w-full" 
            size="lg"
          >
            Back to Home
          </Button>
        </div>

        {/* Important Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Please arrive on time for your reservation</li>
              <li>• Show this e-ticket to staff upon arrival</li>
              <li>• Cancellations must be made 2 hours in advance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}