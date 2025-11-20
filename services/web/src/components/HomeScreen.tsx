import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StudyPlace } from '../types'; // FIXED: Importing StudyPlace
import InteractiveMap from './InteractiveMap';
import { 
  MapPin, 
  Search, 
  Star, 
  Zap, 
  Wifi, 
  Coffee, 
  Map as MapIcon, 
  List 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface HomeScreenProps {
  places: StudyPlace[];
  userLocation: { lat: number; lng: number } | null;
}

const FILTERS = [
  { id: 'open', label: 'Open Now', icon: Zap },
  { id: 'quiet', label: 'Quiet', icon: null },
  { id: 'wifi', label: 'Fast Wifi', icon: Wifi },
  { id: 'coffee', label: 'Good Coffee', icon: Coffee },
  { id: 'power', label: 'Power Outlets', icon: null },
];

export default function HomeScreen({ places, userLocation }: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredPlaces = useMemo(() => {
    if (!places) return [];
    return places.filter(place => {
      const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            place.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilters = activeFilters.every(filterId => {
        if (filterId === 'open') return true; 
        return place.amenities?.some(a => a.toLowerCase().includes(filterId));
      });

      return matchesSearch && matchesFilters;
    });
  }, [places, searchQuery, activeFilters]);

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-brand-cream/80 backdrop-blur-md border-b border-brand-burgundy/5">
        <div className="pt-safe px-4 pb-3">
          <div className="flex items-center justify-between mb-3 mt-2">
            <h1 className="text-2xl font-bold text-brand-burgundy tracking-tight">
              Spot2Go
            </h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="text-brand-burgundy hover:bg-brand-burgundy/10 rounded-full"
            >
              {viewMode === 'list' ? <MapIcon className="w-5 h-5 mr-2" /> : <List className="w-5 h-5 mr-2" />}
              {viewMode === 'list' ? 'Map' : 'List'}
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-burgundy/50" />
            <Input 
              placeholder="Search cafes, libraries..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/80 border-none shadow-sm focus-visible:ring-brand-orange h-11 rounded-xl text-base"
            />
          </div>
        </div>

        {/* Filter Scroll */}
        <div className="px-4 pb-3 overflow-x-auto no-scrollbar flex gap-2">
          {FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${isActive 
                    ? 'bg-brand-burgundy text-white shadow-md scale-105' 
                    : 'bg-white text-brand-burgundy border border-gray-100 shadow-sm hover:bg-gray-50'}
                `}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {filter.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-4 bottom-nav-spacing">
        {viewMode === 'map' ? (
          <div className="h-[70vh] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
             <InteractiveMap 
               places={filteredPlaces} 
               selectedPlaceId={null} 
               userLocation={userLocation} 
             />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PlaceCard({ place }: { place: StudyPlace }) {
  return (
    <Link href={`/places/${place.id}`} className="block group">
      <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden rounded-3xl bg-white h-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-brand-burgundy flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-brand-orange text-brand-orange" />
            {place.rating ? Number(place.rating).toFixed(1) : "New"}
          </div>
          
          {place.images && place.images.length > 0 ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img 
               src={place.images[0]} 
               alt={place.name}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Coffee className="w-12 h-12" />
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-1">
              {place.name}
            </h3>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm mb-4 gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{place.location?.address || "Thunder Bay"}</span>
            {place.distance && (
              <span className="text-brand-orange font-medium ml-1">• {place.distance} km</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {place.type && (
              <Badge variant="secondary" className="bg-brand-cream text-brand-burgundy hover:bg-brand-cream/80 font-normal capitalize">
                {place.type}
              </Badge>
            )}
            {place.reservable && (
              <Badge variant="outline" className="border-brand-orange text-brand-orange">
                Reservable
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}