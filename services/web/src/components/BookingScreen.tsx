// services/web/src/components/BookingScreen.tsx
import { useState, useMemo, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { ArrowLeft, Clock, Calendar as CalendarIcon, Hourglass, Loader2, Users } from "lucide-react"; // <-- IMPORTED Users
import { StudyPlace, TimeSlot } from '../types';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from 'sonner';
import { createBooking } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

interface BookingScreenProps {
  place: StudyPlace;
  onBack: () => void;
}

export function BookingScreen({ place, onBack }: BookingScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState(1); // Default 1 hour
  const [partySize, setPartySize] = useState(1); // <-- NEW: Party size state
  const [isBooking, setIsBooking] = useState(false);
  
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

  const handleBooking = async () => {
    if (!selectedSlot || !user || !selectedDate) {
      toast.error("Please select a date, duration, and time slot.");
      return;
    }
    
    setIsBooking(true);
    try {
        const bookingData = {
            placeId: place.id,
            userId: user.id,
            date: formatDate(selectedDate),
            startTime: selectedSlot.startTime,
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
    } finally {
        setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8DC' }}>
      {/* Header */}
      <div 
        className="shadow-sm p-4 flex items-center space-x-3"
        style={{ backgroundColor: '#6C0345' }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="rounded-xl border-2 transition-button"
          style={{
            color: '#FFF8DC',
            borderColor: '#DC6B19',
            backgroundColor: 'transparent'
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold" style={{ color: '#FFF8DC' }}>Book a Spot</h1>
          <p className="text-sm" style={{ color: '#F7C566' }}>{place.name}</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Date Selection */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-fade-in-up"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" style={{ color: '#6C0345' }}>
              <CalendarIcon className="h-5 w-5" style={{ color: '#DC6B19' }} />
              <span>Select Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                }
              }}
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // <-- Corrected disable logic
              className="rounded-xl border-2"
              style={{ borderColor: '#F7C566' }}
            />
          </CardContent>
        </Card>

        {/* --- MODIFIED: Duration & Party Size Selectors --- */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-fade-in-up"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" style={{ color: '#6C0345' }}>
              <Hourglass className="h-5 w-5" style={{ color: '#DC6B19' }} />
              <span>Select Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium text-brand-burgundy mb-2 flex items-center gap-2"><Users className="h-4 w-4" />Party Size</Label>
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
              <Label className="font-medium text-brand-burgundy mb-2 flex items-center gap-2"><Hourglass className="h-4 w-4" />Duration</Label>
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
          </CardContent>
        </Card>
        {/* --- END MODIFICATION --- */}


        {/* Time Slot Selection */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-scale-in"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" style={{ color: '#6C0345' }}>
              <Clock className="h-5 w-5" style={{ color: '#DC6B19' }} />
              <span>Available Start Times</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableStartTimes.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {availableStartTimes.map((slot, index) => (
                  <Button
                    key={slot.startTime}
                    variant="outline"
                    className={`h-10 p-2 flex items-center justify-center rounded-xl border-2 transition-transform ${
                      selectedSlot?.startTime === slot.startTime ? 'shadow-lg scale-105' : ''
                    }`}
                    style={selectedSlot?.startTime === slot.startTime
                      ? {
                          backgroundColor: '#DC6B19',
                          color: '#FFF8DC',
                          borderColor: '#6C0345',
                        }
                      : {
                          backgroundColor: '#F7C566',
                          color: '#6C0345',
                          borderColor: '#DC6B19',
                        }
                    }
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <span className="font-semibold text-sm">{slot.startTime}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-3" style={{ color: '#DC6B19' }} />
                <p className="font-medium" style={{ color: '#6C0345' }}>
                  No available slots for this date/duration/party size
                </p>
                <p className="text-sm mt-1" style={{ color: '#6C0345', opacity: 0.7 }}>
                  Please select a different option
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm Booking Button */}
        <div className="sticky bottom-4">
          <Button 
            onClick={handleBooking}
            disabled={!selectedSlot || isBooking}
            className={`w-full h-14 rounded-2xl font-semibold text-lg shadow-xl transition-button transform ${
              selectedSlot ? 'hover:scale-[1.02] animate-button-pulse' : 'opacity-60'
            }`}
            style={selectedSlot 
              ? {
                  backgroundColor: '#DC6B19',
                  color: '#FFF8DC'
                }
              : {
                  backgroundColor: '#DC6B19',
                  color: '#FFF8DC'
                }
            }
            size="lg"
          >
            {isBooking ? <Loader2 className="h-6 w-6 animate-spin" /> : (selectedSlot ? '🎯 Confirm Booking' : '⏰ Select a Start Time')}
          </Button>
        </div>
      </div>
    </div>
  );
}