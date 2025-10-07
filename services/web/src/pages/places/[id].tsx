import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPlaceById } from '../../lib/api';
import { StudyPlace } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { MapPin, Star, Loader2, Phone, Bookmark, Calendar, Info, VenetianMask, Utensils, MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';

const StaticMap = dynamic(() => import('../../components/StaticMap').then(mod => mod.StaticMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg"><Loader2 className="h-6 w-6 animate-spin"/></div>
});

export default function PlaceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [place, setPlace] = useState<StudyPlace | null>(null);

  useEffect(() => {
    if (id && isAuthenticated) {
      const fetchPlace = async () => {
        try {
          const response = await getPlaceById(id as string);
          setPlace(response.data);
        } catch (error) {
          toast.error("Could not load place details.");
          router.push('/');
        }
      };
      fetchPlace();
    }
  }, [id, isAuthenticated, router]);

  if (authLoading || !place) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream"><Loader2 className="h-12 w-12 animate-spin text-brand-orange"/></div>;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
       <header className="p-4 bg-white border-b sticky top-0 z-20">
         <div className="max-w-screen-xl mx-auto flex justify-between items-center">
            <Button variant="ghost" onClick={() => router.push('/')} className="text-brand-burgundy hover:bg-brand-cream">
                ← Back to all places
            </Button>
            {/* You can add a user profile icon or other nav items here */}
         </div>
       </header>
       
       <main className="max-w-screen-xl mx-auto p-4 md:p-8">
        {/* Photo Header Grid */}
        <div className="h-48 md:h-80 w-full grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden mb-6">
            <div className="col-span-4 md:col-span-3 row-span-2">
                <ImageWithFallback src={place.images?.[0] || ''} alt={place.name} className="w-full h-full object-cover" />
            </div>
            <ImageWithFallback src={place.images?.[1] || ''} alt={place.name} className="w-full h-full object-cover hidden md:block" />
            <div className="relative hidden md:block">
                <ImageWithFallback src={place.images?.[2] || ''} alt={place.name} className="w-full h-full object-cover" />
                {place.images && place.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg cursor-pointer">
                        +{place.images.length - 3} Photos
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Main Content */}
            <div className="lg:col-span-2">
                <div className="mb-6 bg-white p-6 rounded-lg border-2 border-brand-yellow">
                    <h1 className="text-4xl font-bold text-brand-burgundy">{place.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-brand-orange mt-2">
                        <Badge className="bg-brand-yellow text-brand-burgundy font-semibold">{place.type}</Badge>
                        <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {place.rating || 'New'}</div>
                        <span>${place.pricePerHour || 5}.00 / hour (est.)</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2"><MapPin className="h-4 w-4" />{place.location.address}</p>
                </div>
                
                <Tabs defaultValue="about" className="w-full">
                    <TabsList className="bg-white border"><TabsTrigger value="about">About</TabsTrigger>{place.type === 'cafe' && <TabsTrigger value="menu">Menu</TabsTrigger>}<TabsTrigger value="photos">Photos</TabsTrigger><TabsTrigger value="reviews">Reviews</TabsTrigger></TabsList>
                    <TabsContent value="about" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow">
                        <div className="space-y-6">
                            <h3 className="font-semibold text-xl text-brand-burgundy flex items-center gap-2"><Info />Description</h3>
                            <p className="text-sm text-gray-800">{place.description}</p>
                            <h3 className="font-semibold text-xl text-brand-burgundy flex items-center gap-2"><VenetianMask />Amenities</h3>
                            <div className="flex flex-wrap gap-2">{place.amenities?.map(a=><Badge key={a} variant="outline" className="border-brand-orange text-brand-burgundy">{a}</Badge>)}</div>
                            <div>
                                <h3 className="font-semibold text-xl text-brand-burgundy mb-2 flex items-center gap-2"><MapPin />Location</h3>
                                <div className="h-64 w-full rounded-lg overflow-hidden border-2 border-brand-yellow">
                                    <StaticMap location={place.location} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="menu" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow">{place.menuItems && place.menuItems.length > 0 ? <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader><TableBody>{place.menuItems.map((i,idx)=><TableRow key={idx}><TableCell>{i.name}</TableCell><TableCell className="text-right">${parseFloat(i.price).toFixed(2)}</TableCell></TableRow>)}</TableBody></Table> : <p>No menu available.</p>}</TabsContent>
                    <TabsContent value="photos" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow"><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{place.images?.map((img,idx)=><ImageWithFallback key={idx} src={img} className="w-full h-40 object-cover rounded-md" />)}</div></TabsContent>
                    <TabsContent value="reviews" className="mt-4 p-6 bg-white rounded-lg border-2 border-brand-yellow"><p>Review functionality coming soon!</p></TabsContent>
                </Tabs>
            </div>

            {/* Right/Sticky Booking Widget */}
            <div className="lg:sticky top-24 self-start">
                <Card className="shadow-lg border-2 border-brand-orange">
                    <CardHeader><CardTitle className="text-2xl text-brand-burgundy">Book a Spot</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Date</Label>
                            <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                            <Label>Time</Label>
                            <Input type="time" />
                        </div>
                         <div>
                            <Label>Guests</Label>
                            <Input type="number" defaultValue={1} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" className="w-full bg-brand-orange text-brand-cream text-lg font-bold">Book Now</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
       </main>
    </div>
  );
}