import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { ArrowLeft, Clock, Calendar as CalendarIcon } from "lucide-react";
import { StudyPlace, TimeSlot } from '../types';

interface BookingScreenProps {
  place: StudyPlace;
  onBack: () => void;
  onConfirmBooking: (place: StudyPlace, slot: TimeSlot) => void;
}

export function BookingScreen({ place, onBack, onConfirmBooking }: BookingScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const availableSlotsForDate = place.availableSlots.filter(
    slot => slot.date === formatDate(selectedDate) && slot.available
  );

  const handleBooking = () => {
    if (selectedSlot) {
      onConfirmBooking(place, selectedSlot);
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
                  setSelectedSlot(null);
                }
              }}
              disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
              className="rounded-xl border-2"
              style={{ borderColor: '#F7C566' }}
            />
          </CardContent>
        </Card>

        {/* Time Slot Selection */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-scale-in"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" style={{ color: '#6C0345' }}>
              <Clock className="h-5 w-5" style={{ color: '#DC6B19' }} />
              <span>Available Times</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableSlotsForDate.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {availableSlotsForDate.map((slot, index) => (
                  <Button
                    key={slot.id}
                    className={`h-auto p-4 flex flex-col items-center rounded-xl border-2 transition-button animate-fade-in-up ${
                      selectedSlot?.id === slot.id ? 'shadow-lg transform scale-105' : ''
                    }`}
                    style={selectedSlot?.id === slot.id 
                      ? {
                          backgroundColor: '#DC6B19',
                          color: '#FFF8DC',
                          borderColor: '#6C0345',
                          animationDelay: `${index * 0.1}s`
                        }
                      : {
                          backgroundColor: '#F7C566',
                          color: '#6C0345',
                          borderColor: '#DC6B19',
                          animationDelay: `${index * 0.1}s`
                        }
                    }
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <span className="font-semibold">{slot.startTime}</span>
                    <span className="text-xs opacity-80">to {slot.endTime}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-3" style={{ color: '#DC6B19' }} />
                <p className="font-medium" style={{ color: '#6C0345' }}>
                  No available slots for this date
                </p>
                <p className="text-sm mt-1" style={{ color: '#6C0345', opacity: 0.7 }}>
                  Please select a different date
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Summary */}
        {selectedSlot && (
          <Card 
            className="border-2 rounded-2xl shadow-lg animate-slide-in-right"
            style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#6C0345' }}>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl"
                   style={{ backgroundColor: '#F7C566' }}>
                <span style={{ color: '#6C0345' }}>Location:</span>
                <span className="font-semibold" style={{ color: '#6C0345' }}>
                  {place.name}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl"
                   style={{ backgroundColor: '#F7C566' }}>
                <span style={{ color: '#6C0345' }}>Date:</span>
                <span className="font-semibold" style={{ color: '#6C0345' }}>
                  {selectedDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl"
                   style={{ backgroundColor: '#F7C566' }}>
                <span style={{ color: '#6C0345' }}>Time:</span>
                <span className="font-semibold" style={{ color: '#6C0345' }}>
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </span>
              </div>
              {place.pricePerHour && (
                <div className="flex justify-between items-center p-3 rounded-xl border-t-2"
                     style={{ 
                       backgroundColor: '#DC6B19',
                       borderColor: '#6C0345'
                     }}>
                  <span className="font-bold" style={{ color: '#FFF8DC' }}>Total:</span>
                  <span className="font-bold text-lg" style={{ color: '#FFF8DC' }}>
                    ${place.pricePerHour * 2} {/* Assuming 2-hour slot */}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Confirm Booking Button */}
        <div className="sticky bottom-4">
          <Button 
            onClick={handleBooking}
            disabled={!selectedSlot}
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
            {selectedSlot ? '🎯 Confirm Booking' : '⏰ Select a Time Slot'}
          </Button>
        </div>
      </div>
    </div>
  );
}