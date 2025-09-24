"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { addPlace } from "../lib/api";
import { PlusCircle, Loader2, Wifi, Coffee, ParkingCircle, Plug, Users } from "lucide-react";

// Dynamically import the Leaflet map component
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

// Amenity options
const AMENITIES = [
  { label: "Wi-Fi", icon: <Wifi className="h-4 w-4 mr-1" /> },
  { label: "Coffee", icon: <Coffee className="h-4 w-4 mr-1" /> },
  { label: "Parking", icon: <ParkingCircle className="h-4 w-4 mr-1" /> },
  { label: "Outlets", icon: <Plug className="h-4 w-4 mr-1" /> },
  { label: "Group Study", icon: <Users className="h-4 w-4 mr-1" /> },
];

interface AddPlaceFormProps {
  onPlaceAdded: () => void;
}

export function AddPlaceForm({ onPlaceAdded }: AddPlaceFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return toast.error("Please select a spot type.");
    if (!location) return toast.error("Please select a location on the map.");
    setLoading(true);

    try {
      // For demo: convert images to object URLs (replace with actual upload logic)
      const imageUrls = images.map((file) => URL.createObjectURL(file));

      await addPlace({
        name,
        type,
        location: { address, lat: location.lat, lng: location.lng },
        amenities,
        images: imageUrls,
      });

      toast.success("New spot submitted for approval!");
      setName("");
      setType("");
      setAddress("");
      setImages([]);
      setAmenities([]);
      setLocation(null);
      onPlaceAdded();
    } catch (error) {
      toast.error("Failed to add new spot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2 rounded-2xl mb-4" style={{ borderColor: "#DC6B19", backgroundColor: "#FFF8DC" }}>
      <CardHeader>
        <CardTitle className="text-2xl" style={{ color: "#6C0345" }}>
          Add a New Study Spot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Spot Name */}
          <div className="space-y-2">
            <Label htmlFor="name" style={{ color: "#6C0345" }}>
              Spot Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Grind Coffee House"
              required
              className="rounded-xl border-2"
              style={{ borderColor: "#DC6B19", backgroundColor: "#fff" }}
            />
          </div>

          {/* Spot Type */}
          <div className="space-y-2">
            <Label htmlFor="type" style={{ color: "#6C0345" }}>
              Spot Type
            </Label>
            <Select onValueChange={setType} value={type}>
              <SelectTrigger className="rounded-xl border-2" style={{ borderColor: "#DC6B19", backgroundColor: "#fff" }}>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cafe">Cafe</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="coworking">Co-working Space</SelectItem>
                <SelectItem value="university">University</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" style={{ color: "#6C0345" }}>
              Address (Optional)
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              className="rounded-xl border-2"
              style={{ borderColor: "#DC6B19", backgroundColor: "#fff" }}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images" style={{ color: "#6C0345" }}>
              Upload Images
            </Label>
            <Input
              id="images"
              type="file"
              multiple
              onChange={handleImagesChange}
              className="rounded-xl border-2"
              style={{ borderColor: "#DC6B19", backgroundColor: "#fff" }}
            />
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label style={{ color: "#6C0345" }}>Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <Button
                  key={a.label}
                  type="button"
                  size="sm"
                  variant={amenities.includes(a.label) ? "default" : "outline"}
                  className="flex items-center gap-1 rounded-xl"
                  onClick={() => handleAmenityToggle(a.label)}
                >
                  {a.icon}
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Map Picker */}
          <div className="space-y-2">
            <Label style={{ color: "#6C0345" }}>Pick Location on Map</Label>
            <div className="relative h-64 w-full rounded-xl overflow-hidden border-2" style={{ borderColor: "#DC6B19" }}>
  <MapPicker location={location} setLocation={setLocation} setAddress={setAddress} />
</div>

          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: "#DC6B19", color: "#FFF8DC" }}
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <PlusCircle className="h-6 w-6" />}
            Submit for Approval
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
