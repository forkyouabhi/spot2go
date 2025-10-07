"use client";

import { StudyPlace } from "../types";
import { DialogContent } from "./ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { MapPin, Info, VenetianMask, Utensils, Star, MessageSquare, Loader2, ImageIcon, Phone, Bookmark, Calendar, Building2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";

const StaticMap = dynamic(() => import("./StaticMap").then(mod => mod.StaticMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg"><Loader2 className="h-6 w-6 animate-spin"/></div>
});

interface PlaceDetailModalProps {
  place: StudyPlace;
}

export function PlaceDetailModal({ place }: PlaceDetailModalProps) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const handleReviewSubmit = () => {
    toast.success("Review submitted! (Backend functionality coming soon)");
  };

  const mockReviews = [
    { id: 1, user: "Alice C.", rating: 5, comment: "Amazing place, loved the coffee and quiet corners!", date: "2023-10-26" },
    { id: 2, user: "Bob W.", rating: 4, comment: "Good Wi-Fi and plenty of outlets. Can get a bit busy.", date: "2023-10-20" },
  ];

  return (
    <DialogContent className="sm:max-w-[1000px] h-[95vh] flex flex-col p-0 bg-brand-cream border-2 border-brand-orange">
      {/* Photo Header */}
      <div className="flex-shrink-0 h-48 md:h-64 w-full grid grid-cols-4 grid-rows-2 gap-1">
        <div className="col-span-3 row-span-2">
            <ImageWithFallback src={place.images?.[0] || ''} alt={place.name} className="w-full h-full object-cover" />
        </div>
        <ImageWithFallback src={place.images?.[1] || ''} alt={place.name} className="w-full h-full object-cover" />
        <div className="relative">
            <ImageWithFallback src={place.images?.[2] || ''} alt={place.name} className="w-full h-full object-cover" />
            {place.images && place.images.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                    +{place.images.length - 3}
                </div>
            )}
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto px-6 py-4">
        {/* Main Info */}
        <div className="mb-4">
            <h1 className="text-4xl font-bold text-brand-burgundy">{place.name}</h1>
            <div className="flex items-center gap-4 text-sm text-brand-orange mt-2">
                <Badge className="bg-brand-yellow text-brand-burgundy">{place.type}</Badge>
                <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {place.rating || 'New'}</div>
                <span>${place.pricePerHour || 5}/hour est.</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 flex items-center gap-2"><MapPin className="h-4 w-4" />{place.location.address}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-brand-cream/50 border border-brand-yellow">
            <TabsTrigger value="about">About</TabsTrigger>
            {place.type === 'cafe' && <TabsTrigger value="menu">Menu</TabsTrigger>}
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4">
             <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-brand-burgundy">Description</h3>
                  <p className="text-sm text-gray-700 mt-1">{place.description || 'No description provided.'}</p>
                </div>
                 <div>
                  <h3 className="font-semibold text-lg text-brand-burgundy">Amenities</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {place.amenities?.map(amenity => <Badge key={amenity} variant="outline" className="border-brand-orange text-brand-burgundy">{amenity}</Badge>)}
                  </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-brand-burgundy mb-2">Location</h3>
                    <div className="h-64 w-full rounded-lg overflow-hidden border-2 border-brand-yellow">
                        <StaticMap location={place.location} />
                    </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="mt-4">
            {place.menuItems && place.menuItems.length > 0 ? (
              <div className="border rounded-lg"><Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader><TableBody>{place.menuItems.map((item, i) => <TableRow key={i}><TableCell>{item.name}</TableCell><TableCell className="text-right">${parseFloat(item.price).toFixed(2)}</TableCell></TableRow>)}</TableBody></Table></div>
            ) : <p>No menu information available.</p>}
          </TabsContent>
          
          <TabsContent value="photos" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {place.images?.map((img, index) => (
                    <ImageWithFallback key={index} src={img} alt={`Photo ${index+1}`} className="w-full h-40 object-cover rounded-lg border" />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
             <div className="space-y-4">
              {mockReviews.map(r => <div key={r.id} className="border-b pb-3"><div className="flex items-center justify-between text-sm"><span className="font-semibold">{r.user}</span><span className="flex items-center">{[...Array(r.rating)].map((_, i)=><Star key={i} className="h-3 w-3 fill-brand-yellow text-brand-yellow"/>)}</span></div><p className="text-sm">{r.comment}</p></div>)}
              <div className="pt-4"><h4 className="font-semibold text-brand-burgundy mb-2">Write a Review</h4><Textarea placeholder="Share your experience..." value={reviewText} onChange={e=>setReviewText(e.target.value)} className="mb-2"/><Button onClick={handleReviewSubmit} className="bg-brand-orange text-brand-cream">Submit</Button></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-shrink-0 p-4 border-t bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex gap-2">
            <Button variant="outline"><Phone className="h-4 w-4 mr-2" /> Call</Button>
            <Button variant="outline"><Bookmark className="h-4 w-4 mr-2" /> Bookmark</Button>
        </div>
        <Button size="lg" className="bg-brand-orange text-brand-cream font-bold text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            Book a Spot
        </Button>
      </div>
    </DialogContent>
  );
}