import { StudyPlace, TimeSlot } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, MapPin, Calendar, Clock, Download, User as UserIcon, Users } from 'lucide-react';
import QRCode from 'react-qr-code';

interface ConfirmationScreenProps {
  place: StudyPlace;
  slot: TimeSlot;
  ticketId: string;
  onGoHome: () => void;
  partySize?: number; // Optional party size prop
}

export function ConfirmationScreen({ place, slot, ticketId, onGoHome, partySize }: ConfirmationScreenProps) {
  const handleCalendarDownload = () => {
    // Create an .ics calendar file
    const event = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${place.name} - Study Session
LOCATION:${place.location?.address || ''}
DTSTART:${slot.date.replace(/-/g, '')}T${slot.startTime.replace(/:/g, '')}00
DTEND:${slot.date.replace(/-/g, '')}T${slot.endTime?.replace(/:/g, '') || slot.startTime.replace(/:/g, '')}00
DESCRIPTION:Booking ID: ${ticketId}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([event], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spot2go-booking-${ticketId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex items-center justify-center"
      style={{ backgroundColor: '#FFF8DC' }}
    >
      <Card className="w-full max-w-lg bg-white shadow-2xl animate-in fade-in duration-500"
        style={{ borderWidth: '2px', borderColor: '#DC6B19' }}
      >
        <CardHeader className="text-center items-center space-y-4">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold pt-4" style={{ color: '#6C0345' }}>
            Booking Confirmed!
          </CardTitle>
          
          <CardDescription style={{ color: '#DC6B19' }}>
            Your spot is reserved. Show this QR code at the counter.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code */}
          <div 
            className="p-4 bg-white rounded-lg shadow-inner mx-auto" 
            style={{ 
              borderWidth: '4px', 
              borderColor: '#6C0345',
              maxWidth: '200px',
              width: '100%'
            }}
          >
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={ticketId}
              viewBox="0 0 256 256"
              fgColor="#6C0345"
            />
          </div>

          {/* Ticket ID */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#DC6B19' }}>
              Ticket ID
            </p>
            <p className="font-bold text-lg tracking-wider" style={{ color: '#6C0345' }}>
              {ticketId}
            </p>
          </div>

          {/* Information Card */}
          <Card style={{ backgroundColor: '#FFF8DC80', borderColor: '#F4D06F' }}>
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              {/* Place Image */}
              {place.images && place.images[0] && (
                <img
                  src={place.images[0]}
                  alt={place.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  style={{ borderWidth: '2px', borderColor: '#F4D06F' }}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23F4D06F" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%236C0345"%3E📚%3C/text%3E%3C/svg%3E';
                  }}
                />
              )}
              
              <div className="flex-1">
                <CardTitle className="text-lg" style={{ color: '#6C0345' }}>
                  {place.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1" style={{ color: '#DC6B19' }}>
                  <MapPin className="h-4 w-4" />
                  {place.location?.address || 'Location not specified'}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent 
              className="grid grid-cols-2 gap-4 border-t pt-4" 
              style={{ borderColor: '#F4D06F', color: '#6C0345' }}
            >
              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" style={{ color: '#DC6B19' }} />
                <div>
                  <p className="text-xs opacity-70">Date</p>
                  <p className="font-semibold">{slot.date}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" style={{ color: '#DC6B19' }} />
                <div>
                  <p className="text-xs opacity-70">Time</p>
                  <p className="font-semibold">
                    {slot.startTime?.slice(0, 5)}
                    {slot.endTime && ` - ${slot.endTime.slice(0, 5)}`}
                  </p>
                </div>
              </div>

              {/* Party Size (if provided) */}
              {partySize && (
                <div className="flex items-center gap-2 col-span-2">
                  <Users className="h-5 w-5" style={{ color: '#DC6B19' }} />
                  <div>
                    <p className="text-xs opacity-70">Party Size</p>
                    <p className="font-semibold">
                      {partySize} {partySize > 1 ? 'People' : 'Person'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar Download Button */}
          <Button 
            onClick={handleCalendarDownload}
            variant="outline" 
            className="w-full h-12 hover:opacity-80 transition-opacity"
            style={{ 
              color: '#6C0345', 
              borderColor: '#DC6B19',
              backgroundColor: 'transparent'
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Add to Calendar (.ics)
          </Button>

          {/* Back to Home Button */}
          <Button 
            onClick={onGoHome}
            className="w-full h-12 text-lg font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#DC6B19' }}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}