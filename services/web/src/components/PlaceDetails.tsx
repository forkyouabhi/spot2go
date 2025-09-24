import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, MapPin, Star, Wifi } from "lucide-react";
import { StudyPlace } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PlaceDetailsProps {
  place: StudyPlace;
  onBack: () => void;
  onBookNow: (place: StudyPlace) => void;
}

export function PlaceDetails({ place, onBack, onBookNow }: PlaceDetailsProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8DC' }}>
      <div 
        className="p-4 shadow-sm flex items-center space-x-3 sticky top-0 z-10"
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
        <h1 className="font-semibold text-lg truncate" style={{ color: '#FFF8DC' }}>
          {place.name}
        </h1>
      </div>

      <div className="h-48 w-full">
        <ImageWithFallback
          src={place.image || "https://images.unsplash.com/photo-1562727226-fbcc78ac89e9?w=1080"}
          alt={place.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 space-y-6 pb-24">
        <Card className="border-2 rounded-2xl shadow-lg" style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}>
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: '#6C0345' }}>{place.name}</CardTitle>
            <div className="flex items-center space-x-4 text-sm" style={{ color: '#DC6B19' }}>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{place.location.address}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-current text-yellow-500" />
                <span>{place.rating || 'N/A'}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p style={{ color: '#6C0345' }}>{place.description}</p>
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl shadow-lg" style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}>
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: '#6C0345' }}>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {place.amenities?.map(amenity => (
              <Badge key={amenity} variant="outline" className="text-base" style={{ borderColor: '#F7C566', color: '#6C0345' }}>
                <Wifi className="h-4 w-4 mr-2" />
                {amenity}
              </Badge>
            ))}
          </CardContent>
        </Card>
        
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t-2" style={{borderColor: '#F7C566'}}>
        <Button
          onClick={() => onBookNow(place)}
          className="w-full h-14 rounded-2xl font-semibold text-lg shadow-xl transition-button transform hover:scale-[1.02]"
          style={{ backgroundColor: '#DC6B19', color: '#FFF8DC' }}
          size="lg"
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}
