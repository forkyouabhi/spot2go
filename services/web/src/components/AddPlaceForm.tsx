"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { addPlace, updateOwnerPlace } from "../lib/api";
import { StudyPlace } from "../types";
import { PlusCircle, Loader2, Wifi, Coffee, ParkingCircle, Plug, Users, Save } from "lucide-react";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const AMENITIES = [
  { label: "Wi-Fi", icon: <Wifi className="h-4 w-4 mr-1" /> },
  { label: "Coffee", icon: <Coffee className="h-4 w-4 mr-1" /> },
  { label: "Parking", icon: <ParkingCircle className="h-4 w-4 mr-1" /> },
  { label: "Outlets", icon: <Plug className="h-4 w-4 mr-1" /> },
  { label: "Group Study", icon: <Users className="h-4 w-4 mr-1" /> },
];

interface AddPlaceFormProps {
  onSuccess: () => void;
  initialData?: StudyPlace | null; // Prop for pre-filling the form in edit mode
}

export function AddPlaceForm({ onSuccess, initialData }: AddPlaceFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setType(initialData.type || "");
      setDescription(initialData.description || "");
      setAddress(initialData.location?.address || "");
      setAmenities(initialData.amenities || []);
      setLocation(
        initialData.location && typeof initialData.location.lat === "number" && typeof initialData.location.lng === "number"
          ? { lat: initialData.location.lat, lng: initialData.location.lng }
          : null
      );
      setExistingImages(initialData.images || []);
    }
  }, [initialData]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !location) {
      toast.error("Spot Type and Location are required.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("description", description);
    formData.append("location", JSON.stringify({ address, lat: location.lat, lng: location.lng }));
    formData.append("amenities", amenities.join(','));
    
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      if (isEditMode && initialData) {
        await updateOwnerPlace(initialData.id, formData);
        toast.success("Place updated and re-submitted for approval!");
      } else {
        await addPlace(formData);
        toast.success("New spot submitted for approval!");
      }
      onSuccess();
    } catch (error) {
      const errorMessage = isEditMode ? "Failed to update spot." : "Failed to add new spot.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" style={{ color: "#6C0345" }}>Spot Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., The Grind Coffee House" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type" style={{ color: "#6C0345" }}>Spot Type</Label>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cafe">Cafe</SelectItem>
            <SelectItem value="library">Library</SelectItem>
            <SelectItem value="coworking">Co-working Space</SelectItem>
            <SelectItem value="university">University</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" style={{ color: "#6C0345" }}>Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your study spot..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images" style={{ color: "#6C0345" }}>
          {isEditMode ? "Upload New Images (optional, will replace old ones)" : "Upload Images (up to 5)"}
        </Label>
        <Input id="images" type="file" multiple accept="image/*" onChange={handleImagesChange} />
        
        {isEditMode && existingImages.length > 0 && images.length === 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-600 mb-2">Current Images:</p>
            <div className="grid grid-cols-3 gap-4">
              {existingImages.map((url, index) => (
                <img key={index} src={url} alt="existing preview" className="w-full h-24 object-cover rounded-lg border-2 border-brand-yellow" />
              ))}
            </div>
          </div>
        )}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {images.map((file, index) => (
              <img key={index} src={URL.createObjectURL(file)} alt={`new preview ${index}`} className="w-full h-24 object-cover rounded-lg border-2 border-brand-yellow" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label style={{ color: "#6C0345" }}>Amenities</Label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <Button key={a.label} type="button" size="sm" variant={amenities.includes(a.label) ? "default" : "outline"} onClick={() => handleAmenityToggle(a.label)} className={`transition-all ${amenities.includes(a.label) ? 'bg-brand-orange text-brand-cream' : ''}`}>
              {a.icon}
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label style={{ color: "#6C0345" }}>Pick Location on Map</Label>
        <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-brand-orange">
          <MapPicker location={location} setLocation={setLocation} setAddress={setAddress} />
        </div>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address will be auto-filled from map..." className="mt-2" />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-semibold bg-brand-orange hover:bg-brand-orange/90 text-brand-cream">
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isEditMode ? <><Save className="h-5 w-5 mr-2" /> Update & Re-submit</> : <><PlusCircle className="h-5 w-5 mr-2" /> Submit for Approval</>)}
      </Button>
    </form>
  );
}