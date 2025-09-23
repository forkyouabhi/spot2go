import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, MapPin, Star, User, Bookmark, Clock } from "lucide-react";
import { StudyPlace } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomeScreenProps {
  userName: string;
  places: StudyPlace[];
  onPlaceSelect: (place: StudyPlace) => void;
  onNavigate: (screen: 'account') => void;
}

export function HomeScreen({ userName, places, onPlaceSelect, onNavigate }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || place.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8DC' }}>
      {/* Clean Header with Brand Colors */}
      <div 
        className="p-4 shadow-sm"
        style={{ backgroundColor: '#6C0345' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFF8DC' }}>
              Hi, {userName}! 👋
            </h1>
            <p className="text-sm mt-1 opacity-90" style={{ color: '#FFF8DC' }}>
              Find your perfect study spot in Thunder Bay
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('account')}
            className="rounded-xl border-2 hover:bg-white/10"
            style={{ 
              color: '#FFF8DC', 
              borderColor: '#DC6B19'
            }}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                 style={{ color: '#6C0345' }} />
          <Input
            placeholder="Search cafés, libraries, co-working spaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-2 shadow-sm"
            style={{ 
              backgroundColor: '#FFF8DC',
              borderColor: '#DC6B19',
              color: '#6C0345'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {['all', 'cafe', 'library', 'coworking', 'university'].map((filter) => (
            <Button
              key={filter}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className={`whitespace-nowrap rounded-full px-4 py-2 border-2 transition-all ${
                selectedFilter === filter 
                  ? 'shadow-md' 
                  : 'hover:shadow-sm'
              }`}
              style={selectedFilter === filter 
                ? { 
                    backgroundColor: '#F7C566', 
                    color: '#6C0345',
                    borderColor: '#DC6B19'
                  }
                : { 
                    backgroundColor: 'transparent', 
                    color: '#FFF8DC',
                    borderColor: '#DC6B19'
                  }}
            >
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Map Preview */}
      <div className="p-4">
        <Card className="mb-6 border-2 shadow-sm rounded-2xl" 
              style={{ borderColor: '#DC6B19', backgroundColor: '#FFF8DC' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: '#6C0345' }}>Nearby Locations</h3>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" style={{ color: '#DC6B19' }} />
                <span className="text-sm" style={{ color: '#6C0345' }}>Thunder Bay, ON</span>
              </div>
            </div>
            <div 
              className="rounded-xl h-36 flex items-center justify-center border-2"
              style={{ 
                backgroundColor: '#F7C566',
                borderColor: '#DC6B19'
              }}
            >
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2" style={{ color: '#6C0345' }} />
                <p className="font-medium" style={{ color: '#6C0345' }}>Interactive Map</p>
                <p className="text-sm opacity-80" style={{ color: '#6C0345' }}>Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Places List */}
        <div className="space-y-4">
          <h3 className="font-semibold" style={{ color: '#6C0345' }}>Study Spaces Near You</h3>
          {filteredPlaces.map((place) => {
            const typeColors = getTypeColor(place.type);
            return (
              <Card 
                key={place.id} 
                className="cursor-pointer hover:shadow-md transition-all border-2 rounded-2xl" 
                style={{ borderColor: '#DC6B19' }}
                onClick={() => onPlaceSelect(place)}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2"
                         style={{ borderColor: '#F7C566' }}>
                      <ImageWithFallback
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold truncate" style={{ color: '#6C0345' }}>
                            {place.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              className="text-xs px-2 py-1 rounded-full border"
                              style={{ 
                                backgroundColor: typeColors.bg,
                                color: typeColors.text,
                                borderColor: typeColors.border
                              }}
                            >
                              {place.type}
                            </Badge>
                            <span className="text-sm" style={{ color: '#6C0345' }}>
                              {place.distance}
                            </span>
                          </div>
                        </div>
                        
                        <Bookmark className="h-5 w-5" style={{ color: '#DC6B19' }} />
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-current" style={{ color: '#F7C566' }} />
                          <span className="text-sm font-medium" style={{ color: '#6C0345' }}>
                            {place.rating}
                          </span>
                        </div>
                        
                        {place.pricePerHour && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" style={{ color: '#DC6B19' }} />
                            <span className="text-sm font-medium" style={{ color: '#6C0345' }}>
                              ${place.pricePerHour}/hr
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {place.amenities.slice(0, 4).map((amenity) => (
                          <Badge 
                            key={amenity} 
                            variant="outline" 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              borderColor: '#F7C566',
                              color: '#6C0345'
                            }}
                          >
                            {amenity}
                          </Badge>
                        ))}
                        {place.amenities.length > 4 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              borderColor: '#DC6B19',
                              color: '#6C0345'
                            }}
                          >
                            +{place.amenities.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}