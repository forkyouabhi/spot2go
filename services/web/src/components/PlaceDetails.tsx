import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Star, MapPin, Clock, Wifi, Zap, Bookmark, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { StudyPlace } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PlaceDetailsProps {
  place: StudyPlace;
  onBack: () => void;
  onBookNow: (place: StudyPlace) => void;
}

export function PlaceDetails({ place, onBack, onBookNow }: PlaceDetailsProps) {
  const [showReviews, setShowReviews] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cafe': 
        return { bg: '#FFF8DC', text: '#DC6B19', border: '#F7C566' };
      case 'library': 
        return { bg: '#FFF8DC', text: '#6C0345', border: '#DC6B19' };
      case 'coworking': 
        return { bg: '#F7C566', text: '#6C0345', border: '#DC6B19' };
      case 'university': 
        return { bg: '#DC6B19', text: '#FFF8DC', border: '#6C0345' };
      default: 
        return { bg: '#FFF8DC', text: '#6C0345', border: '#F7C566' };
    }
  };

  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('wi-fi')) return <Wifi className="h-4 w-4" />;
    if (amenity.toLowerCase().includes('power') || amenity.toLowerCase().includes('outlet')) return <Zap className="h-4 w-4" />;
    if (amenity.toLowerCase().includes('coffee')) return <span className="text-amber-600">☕</span>;
    return <span className="text-gray-400">•</span>;
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
        <h1 className="font-semibold" style={{ color: '#FFF8DC' }}>Place Details</h1>
        <div className="flex-1" />
        <Button 
          variant="ghost" 
          size="sm"
          className="rounded-xl border-2 transition-button"
          style={{
            color: '#F7C566',
            borderColor: '#DC6B19',
            backgroundColor: 'transparent'
          }}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Image */}
        <div className="w-full h-48 rounded-2xl overflow-hidden border-2 animate-fade-in-up"
             style={{ borderColor: '#DC6B19' }}>
          <ImageWithFallback
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover transition-smooth"
          />
        </div>

        {/* Basic Info */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-scale-in"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#6C0345' }}>
                  {place.name}
                </h2>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge 
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{ 
                      backgroundColor: getTypeColor(place.type).bg,
                      color: getTypeColor(place.type).text,
                      borderColor: getTypeColor(place.type).border
                    }}
                  >
                    {place.type}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" style={{ color: '#DC6B19' }} />
                    <span className="text-sm font-medium" style={{ color: '#6C0345' }}>
                      {place.distance}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="h-5 w-5 fill-current" style={{ color: '#F7C566' }} />
                  <span className="font-semibold" style={{ color: '#6C0345' }}>
                    {place.rating}
                  </span>
                </div>
                {place.pricePerHour && (
                  <p className="text-sm font-medium" style={{ color: '#DC6B19' }}>
                    ${place.pricePerHour}/hour
                  </p>
                )}
              </div>
            </div>

            <p className="mb-4 leading-relaxed" style={{ color: '#6C0345' }}>
              {place.description}
            </p>
            
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4" style={{ color: '#DC6B19' }} />
              <span style={{ color: '#6C0345' }}>{place.address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-slide-in-right"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardHeader>
            <CardTitle style={{ color: '#6C0345' }}>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 gap-4">
              {place.amenities.map((amenity, index) => (
                <div 
                  key={amenity} 
                  className="flex items-center space-x-3 p-3 rounded-xl border-2 transition-smooth hover:shadow-md"
                  style={{ 
                    borderColor: '#F7C566',
                    backgroundColor: '#F7C566',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div style={{ color: '#6C0345' }}>
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#6C0345' }}>
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-fade-in-up overflow-hidden"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center border-2"
                  style={{ 
                    backgroundColor: '#F7C566',
                    borderColor: '#DC6B19'
                  }}
                >
                  <MessageCircle className="h-4 w-4" style={{ color: '#6C0345' }} />
                </div>
                <CardTitle style={{ color: '#6C0345' }}>
                  Reviews ({place.reviews.length})
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReviews(!showReviews)}
                className="rounded-xl transition-button p-2 hover:shadow-md"
                style={{
                  backgroundColor: showReviews ? '#F7C566' : 'transparent',
                  borderColor: '#DC6B19',
                  color: '#6C0345'
                }}
              >
                <span className="text-sm font-medium mr-2">
                  {showReviews ? 'Hide' : 'Show'}
                </span>
                {showReviews ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {!showReviews && (
            <CardContent className="p-6 pt-0">
              <div 
                className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-button hover:shadow-md"
                style={{ 
                  borderColor: '#F7C566',
                  backgroundColor: 'rgba(247, 197, 102, 0.1)'
                }}
                onClick={() => setShowReviews(true)}
              >
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-5 w-5 fill-current" style={{ color: '#F7C566' }} />
                    <span className="font-semibold text-lg" style={{ color: '#6C0345' }}>
                      {place.rating}
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#DC6B19' }}>
                    Tap to read {place.reviews.length} reviews
                  </p>
                </div>
              </div>
            </CardContent>
          )}

          {showReviews && (
            <CardContent className="p-6 pt-0">
              <div 
                className="space-y-4 animate-fade-in-up"
                style={{ animationDuration: '0.4s' }}
              >
                {place.reviews.map((review, index) => (
                  <div 
                    key={review.id} 
                    className="border-b-2 last:border-b-0 pb-4 last:pb-0 animate-fade-in-up"
                    style={{ 
                      borderColor: '#F7C566',
                      animationDelay: `${index * 0.1}s`,
                      animationDuration: '0.5s'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                          style={{ 
                            backgroundColor: '#F7C566',
                            borderColor: '#DC6B19'
                          }}
                        >
                          <span className="text-sm font-semibold" style={{ color: '#6C0345' }}>
                            {review.userName[0]}
                          </span>
                        </div>
                        <span className="font-semibold" style={{ color: '#6C0345' }}>
                          {review.userName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-current" style={{ color: '#F7C566' }} />
                        <span className="font-medium" style={{ color: '#6C0345' }}>
                          {review.rating}
                        </span>
                      </div>
                    </div>
                    <p className="mb-2 leading-relaxed" style={{ color: '#6C0345' }}>
                      {review.comment}
                    </p>
                    <p className="text-xs" style={{ color: '#DC6B19' }}>
                      {review.date}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Availability Preview */}
        <Card 
          className="border-2 rounded-2xl shadow-lg animate-scale-in"
          style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}
        >
          <CardHeader>
            <CardTitle style={{ color: '#6C0345' }}>Today's Availability</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-3">
              {place.availableSlots.slice(0, 2).map((slot, index) => (
                <div 
                  key={slot.id} 
                  className="flex items-center justify-between p-4 rounded-xl border-2 transition-smooth animate-fade-in-up"
                  style={{ 
                    backgroundColor: '#F7C566',
                    borderColor: '#DC6B19',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5" style={{ color: '#6C0345' }} />
                    <span className="font-medium" style={{ color: '#6C0345' }}>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <Badge 
                    className="px-3 py-1 rounded-full border-2"
                    style={{ 
                      backgroundColor: '#6C0345',
                      color: '#FFF8DC',
                      borderColor: '#DC6B19'
                    }}
                  >
                    Available
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Book Now Button */}
        <div className="sticky bottom-4 animate-button-pulse">
          <Button 
            onClick={() => onBookNow(place)} 
            className="w-full h-14 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-button transform hover:scale-[1.02]" 
            style={{
              backgroundColor: '#DC6B19',
              color: '#FFF8DC'
            }}
            size="lg"
          >
            🎯 Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}