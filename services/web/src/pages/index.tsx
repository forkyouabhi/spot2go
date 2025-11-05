// services/web/src/pages/index.tsx
import { useEffect, useState, MouseEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPlaces } from '../lib/api';
import { toast } from 'sonner';
import { StudyPlace } from '../types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Search, Building2, Loader2, Bookmark, Star, Clock, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LandingPage } from '../components/LandingPage';
import Head from 'next/head';

const PLACE_TYPES = ['All', 'cafe', 'library', 'coworking', 'university'];

export default function HomePage() {
  const { user, isAuthenticated, loading: authLoading, bookmarks, addBookmark, removeBookmark } = useAuth();
  const router = useRouter();
  const [allPlaces, setAllPlaces] = useState<StudyPlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<StudyPlace[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const fetchPlaces = async () => {
        setDataLoading(true);
        try {
          const response = await getPlaces();
          // Add mock rating/distance if not present
          const placesWithMocks = response.data.map((place: StudyPlace) => ({
            ...place,
            // In a real app, the API would return this. We mock it for now.
            rating: place.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
            distance: place.distance || (Math.random() * 2 + 0.3).toFixed(1) + ' km'
          }));
          setAllPlaces(placesWithMocks);
          setFilteredPlaces(placesWithMocks);
        } catch (error) {
          toast.error('Could not fetch study spots.');
          console.error("API Error:", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchPlaces();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    let currentFiltered = allPlaces;
    if (selectedType !== 'All') {
      currentFiltered = currentFiltered.filter(p => p.type.toLowerCase() === selectedType.toLowerCase());
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(p =>
        p.name.toLowerCase().includes(lower) || p.location?.address.toLowerCase().includes(lower)
      );
    }
    setFilteredPlaces(currentFiltered);
  }, [allPlaces, selectedType, searchTerm]);
  
  const handleBookmarkToggle = (e: MouseEvent, placeId: string) => {
    e.preventDefault(); // Stop the Link from navigating
    e.stopPropagation(); // Stop click from bubbling up
    if (bookmarks.includes(placeId)) {
      removeBookmark(placeId);
    } else {
      addBookmark(placeId);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 className="h-12 w-12 animate-spin text-brand-orange"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }
  
  return (
    <>
      <Head>
        <title>Spot2Go | Home</title>
      </Head>
      <div className="min-h-screen bg-brand-cream">
        
        {/* --- HEADER (NO LONGER STICKY) --- */}
        <header className="bg-brand-burgundy text-brand-cream p-4 shadow-md">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold">Hi, {user?.name || 'Guest'} 👋</h1>
                <p className="text-brand-yellow">Find your perfect study spot in Thunder Bay</p>
              </div>
               <Button variant="outline" onClick={() => router.push('/account')} className="bg-transparent border-brand-orange text-brand-cream hover:bg-brand-orange hover:text-brand-cream">
                  <Building2 className="h-4 w-4 mr-2" /> My Account
               </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              {/* --- FIX 1: Added text-brand-burgundy --- */}
              <Input 
                type="text" 
                placeholder="Search by name or address..." 
                className="w-full pl-10 text-brand-burgundy" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </header>

        {/* --- STICKY PILL NAVBAR --- */}
        <nav className="sticky top-0 z-10 bg-brand-burgundy/95 backdrop-blur-sm shadow-md">
          {/* --- FIX 2: Slimmer padding --- */}
          <div className="max-w-screen-xl mx-auto px-4 py-3"> 
            <div className="flex flex-wrap gap-2">
              {PLACE_TYPES.map(type => (
                <Button 
                  key={type} 
                  variant={selectedType === type ? 'default' : 'outline'} 
                  onClick={() => setSelectedType(type)} 
                  className={`${
                    selectedType === type 
                      ? 'bg-brand-orange text-brand-cream' 
                      : 'border-brand-orange text-brand-orange hover:bg-brand-orange/10'
                  } rounded-full`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </nav>

        <main className="p-4 md:p-8 max-w-screen-xl mx-auto">
          <section>
            <h2 className="text-2xl font-semibold text-brand-burgundy mb-4">Available Spaces ({filteredPlaces.length})</h2>
              
              {/* --- NEW CARD DESIGN --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataLoading ? (
                    <div className="col-span-full flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-orange"/>
                    </div>
                ) : filteredPlaces.length === 0 ? (
                  <p className="col-span-full text-center text-brand-orange">
                    No spots found matching your criteria.
                  </p>
                ) : filteredPlaces.map(place => {
                  const isBookmarked = bookmarks.includes(place.id.toString());
                  const ownerInitial = place.owner?.name?.charAt(0)?.toUpperCase() || 'S';

                  return (
                    <Link href={`/places/${place.id}`} key={place.id} legacyBehavior>
                      <a className="block transition-all hover:-translate-y-1">
                        <Card className="border-2 border-brand-yellow bg-white overflow-hidden flex flex-col h-full shadow-lg hover:shadow-xl">
                          
                          <div className="relative">
                            <ImageWithFallback 
                              src={place.images?.[0] || ''} 
                              alt={place.name} 
                              className="w-full h-48 object-cover" 
                            />
                            <Badge className="absolute top-3 right-3 bg-brand-yellow text-brand-burgundy capitalize shadow-md border border-brand-orange/50">
                              {place.type}
                            </Badge>
                            <Button 
                              size="icon" 
                              className={`absolute top-3 left-3 rounded-full h-9 w-9 shadow-md ${
                                isBookmarked 
                                ? 'bg-brand-orange text-brand-cream' 
                                : 'bg-white/80 text-brand-burgundy backdrop-blur-sm'
                              }`}
                              onClick={(e) => handleBookmarkToggle(e, place.id)}
                            >
                              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                            </Button>
                          </div>

                          <CardContent className="p-4 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-brand-burgundy mb-1">{place.name}</h3>
                            <div className="flex items-center space-x-4 text-sm mb-2">
                              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                <Star className="h-4 w-4 fill-amber-500" /> {place.rating}
                              </span>
                              <span className="text-brand-orange font-medium">
                                {place.distance}
                              </span>
                              {place.pricePerHour > 0 && (
                                <span className="flex items-center gap-1 text-brand-burgundy font-semibold">
                                  <Clock className="h-4 w-4" /> ${place.pricePerHour}/hr
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                              {place.description || 'No description available.'}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {place.amenities?.slice(0, 4).map(amenity => (
                                <Badge key={amenity} variant="outline" className="border-brand-yellow text-brand-burgundy">
                                  {amenity}
                                </Badge>
                              ))}
                              {place.amenities && place.amenities.length > 4 && (
                                <Badge variant="outline" className="border-brand-yellow text-brand-burgundy">
                                  +{place.amenities.length - 4}
                                </Badge>
                              )}
                            </div>
                          </CardContent>

                          <div className="p-4 pt-2 mt-auto flex items-center justify-between text-brand-orange font-semibold">
                            <span>View Details</span>
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </div>
                        </Card>
                      </a>
                    </Link>
                  )
                })}
              </div>
          </section>
        </main>
      </div>
    </>
  );
}