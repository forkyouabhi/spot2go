import { StudyPlace } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { User, Calendar, Check, X, ImageIcon, Utensils, Info, VenetianMask, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import dynamic from 'next/dynamic';

// FIX: Dynamically import the map component to prevent SSR issues
const StaticMap = dynamic(() => import('./StaticMap').then(mod => mod.StaticMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg"><p>Loading map...</p></div>
});


interface PendingPlaceCardProps {
  place: StudyPlace;
  onApprove: () => void;
  onReject: () => void;
}

export function PendingPlaceCard({ place, onApprove, onReject }: PendingPlaceCardProps) {
  return (
    <Card className="w-full shadow-lg overflow-hidden border-2 border-brand-yellow bg-white transition-shadow hover:shadow-xl">
      <CardHeader className="bg-brand-cream border-b-2 border-brand-yellow p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-brand-burgundy">{place.name}</CardTitle>
            <CardDescription className="text-xs text-brand-orange flex items-center gap-2 pt-1">
              <User className="h-4 w-4" /> Submitted by {place.owner?.name || 'N/A'} ({place.owner?.email || 'N/A'})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-burgundy font-medium">
            <Calendar className="h-4 w-4" />
            <span>{new Date(place.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Images and Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-brand-burgundy flex items-center"><ImageIcon className="h-4 w-4 mr-2 text-brand-orange"/>Images</h3>
            {place.images && place.images.length > 0 ? (
              <Carousel className="w-full rounded-lg overflow-hidden border border-brand-yellow">
                <CarouselContent>
                  {place.images.map((imgUrl, index) => (
                    <CarouselItem key={index}>
                      <ImageWithFallback src={imgUrl} alt={`Place image ${index + 1}`} className="w-full h-48 object-cover" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 h-6 w-6 bg-white/70 hover:bg-white text-brand-burgundy" />
                <CarouselNext className="right-2 h-6 w-6 bg-white/70 hover:bg-white text-brand-burgundy" />
              </Carousel>
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg border border-brand-yellow">
                <p className="text-xs text-gray-500">No images uploaded</p>
              </div>
            )}
          </div>
           <div>
            <h3 className="font-semibold text-sm mb-2 text-brand-burgundy flex items-center"><Info className="h-4 w-4 mr-2 text-brand-orange"/>Details</h3>
            <div className="space-y-2 text-sm p-3 border rounded-lg bg-white">
                <p><strong className="text-brand-burgundy">Type:</strong> <Badge className="bg-brand-yellow text-brand-burgundy">{place.type}</Badge></p>
                <p><strong className="text-brand-burgundy">Description:</strong> <span className="text-gray-600">{place.description || 'N/A'}</span></p>
            </div>
          </div>
        </div>

        {/* Right Side: Location, Amenities, and Menu */}
        <div className="space-y-4">
           <div>
            <h3 className="font-semibold text-sm mb-2 text-brand-burgundy flex items-center"><MapPin className="h-4 w-4 mr-2 text-brand-orange"/>Location</h3>
             <div className="h-40 w-full rounded-lg overflow-hidden border-2 border-brand-yellow">
                <StaticMap location={place.location} />
             </div>
             <p className="text-xs text-gray-600 mt-1">{place.location.address}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2 text-brand-burgundy flex items-center"><VenetianMask className="h-4 w-4 mr-2 text-brand-orange"/>Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {place.amenities && place.amenities.length > 0 ? (
                place.amenities.map(amenity => <Badge key={amenity} variant="outline" className="border-brand-orange text-brand-burgundy">{amenity}</Badge>)
              ) : (
                <p className="text-xs text-gray-500">No amenities listed.</p>
              )}
            </div>
          </div>
           {place.type === 'cafe' && place.menuItems && place.menuItems.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 text-brand-burgundy flex items-center"><Utensils className="h-4 w-4 mr-2 text-brand-orange"/>Menu</h3>
              <div className="border rounded-lg max-h-32 overflow-y-auto">
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader><TableBody>{place.menuItems.map((item, index) => (<TableRow key={index}><TableCell className="font-medium py-1">{item.name}</TableCell><TableCell className="text-right py-1">${parseFloat(item.price).toFixed(2)}</TableCell></TableRow>))}</TableBody></Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-brand-cream border-t-2 border-brand-yellow p-4 flex justify-end gap-2">
        {/* FIX: Explicitly setting button colors for visibility */}
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={onReject}>
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={onApprove}>
          <Check className="h-4 w-4 mr-2" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}