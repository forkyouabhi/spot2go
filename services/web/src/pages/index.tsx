import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPlaces } from '../lib/api';
import { toast } from 'sonner';
import { StudyPlace } from '../types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '../components/ui/card';
import { MapPin, Search, Star, Loader2, Building2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { SplashScreen } from '../components/SplashScreen'; // Import SplashScreen

const PLACE_TYPES = ['All', 'cafe', 'library', 'coworking', 'university'];

export default function HomePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allPlaces, setAllPlaces] = useState<StudyPlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<StudyPlace[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  // This useEffect is now solely responsible for fetching data WHEN authenticated
  useEffect(() => {
    // Only run if authentication is complete AND the user is logged in
    if (!authLoading && isAuthenticated) {
      const fetchPlaces = async () => {
        setDataLoading(true);
        try {
          const response = await getPlaces();
          setAllPlaces(response.data);
          setFilteredPlaces(response.data);
        } catch (error) {
          toast.error('Could not fetch study spots.');
          console.error("API Error:", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchPlaces();
    }
  }, [isAuthenticated, authLoading]); // Dependency array ensures this runs when auth state is confirmed

  // This useEffect handles filtering when the source data or filters change
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
  
  // --- RENDER LOGIC ---

  // 1. Show a loading spinner ONLY while the initial authentication check is happening
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream"><Loader2 className="h-12 w-12 animate-spin text-brand-orange"/></div>;
  }

  // 2. If authentication is done and the user is NOT logged in, show the SplashScreen
  if (!isAuthenticated) {
    return <SplashScreen onNavigate={(screen) => router.push(`/${screen}`)} />;
  }
  
  // 3. If the user IS authenticated, show the main dashboard
  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-brand-burgundy text-brand-cream p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">Hi, {user?.name || 'Guest'} 👋</h1>
              <p className="text-brand-yellow">Find your perfect study spot in Thunder Bay</p>
            </div>
             <Button variant="outline" onClick={() => router.push('/account')} className="bg-transparent border-brand-orange text-brand-cream hover:bg-brand-orange">
                <Building2 className="h-4 w-4 mr-2" /> My Account
             </Button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input type="text" placeholder="Search by name or address..." className="w-full pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {PLACE_TYPES.map(type => (
              <Button key={type} variant={selectedType === type ? 'default' : 'outline'} onClick={() => setSelectedType(type)} className={`${selectedType === type ? 'bg-brand-orange text-brand-cream' : 'border-brand-orange text-brand-orange hover:bg-brand-orange/10'} rounded-full`}>{type}</Button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-screen-xl mx-auto">
        <section>
          <h2 className="text-2xl font-semibold text-brand-burgundy mb-4">Available Spaces ({filteredPlaces.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataLoading ? (
                  <p className="col-span-full">Loading places...</p>
              ) : filteredPlaces.map(place => (
                <Link href={`/places/${place.id}`} key={place.id} passHref>
                  <Card className="border-2 border-brand-yellow bg-white overflow-hidden flex flex-col h-full cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1">
                    <ImageWithFallback src={place.images?.[0] || ''} alt={place.name} className="w-full h-48 object-cover" />
                    <CardContent className="p-4 flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-bold text-brand-burgundy">{place.name}</CardTitle>
                        <Badge className="bg-brand-yellow text-brand-burgundy">{place.type}</Badge>
                      </div>
                      <CardDescription className="text-sm text-brand-orange mb-3 flex items-center gap-1"><MapPin className="h-4 w-4" /> {place.location.address}</CardDescription>
                      <p className="text-sm text-gray-700 line-clamp-2">{place.description || 'No description available.'}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 mt-auto">
                       <div className="w-full text-center text-brand-orange font-semibold">View Details →</div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
        </section>
      </main>
    </div>
  );
}