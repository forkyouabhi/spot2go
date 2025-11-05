// services/web/src/components/AddPlaceWizard.tsx
"use client";

import { useState, useEffect, ReactElement } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Card } from "./ui/card";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { toast } from "sonner";
import { addPlace, updateOwnerPlace } from "../lib/api";
import { StudyPlace } from "../types";
import {
  Loader2,
  Wifi,
  Coffee,
  ParkingCircle,
  Plug,
  Users,
  Clock,
  UploadCloud,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import React from "react";

// Dynamically import the MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const AMENITIES: { label: string; icon: ReactElement }[] = [
  { label: "Wi-Fi", icon: <Wifi className="h-5 w-5" /> },
  { label: "Coffee", icon: <Coffee className="h-5 w-5" /> },
  { label: "Parking", icon: <ParkingCircle className="h-5 w-5" /> },
  { label: "Outlets", icon: <Plug className="h-5 w-5" /> },
  { label: "Group Study", icon: <Users className="h-5 w-5" /> },
];

interface AddPlaceWizardProps {
  onSuccess: () => void;
  initialData?: StudyPlace | null;
}

export function AddPlaceWizard({ onSuccess, initialData }: AddPlaceWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;

  // --- Form State ---
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [address, setAddress] = useState("");
  const [reservable, setReservable] = useState(false);
  const [reservableHours, setReservableHours] = useState({
    start: "09:00",
    end: "17:00",
  });

  // --- Populate form if in edit mode ---
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setType(initialData.type || "");
      setDescription(initialData.description || "");
      setAddress(initialData.location?.address || "");
      setAmenities(initialData.amenities || []);
      setLocation(
        initialData.location?.lat && initialData.location?.lng
          ? { lat: initialData.location.lat, lng: initialData.location.lng }
          : null
      );
      setExistingImages(initialData.images || []);
      setImagePreviews(initialData.images || []); // Show existing images as previews
      setReservable(initialData.reservable || false);
      if (initialData.reservableHours) {
        setReservableHours(initialData.reservableHours);
      }
    }
  }, [initialData]);

  // --- Event Handlers ---
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5); // Limit to 5
      setImages(files);
      
      // Clean up old object URLs
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 && !isEditMode) {
      toast.error("At least one image is required.");
      setStep(2); // Go back to image step
      return;
    }
    if (!type) {
      toast.error("Spot Type is required.");
      setStep(1); // Go back to basics step
      return;
    }
    if (!location) {
      toast.error("Location is required.");
      return; // Stay on step 3
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("description", description);
    formData.append(
      "location",
      JSON.stringify({ address, lat: location.lat, lng: location.lng })
    );
    formData.append("amenities", amenities.join(","));
    formData.append("reservable", String(reservable));
    if (reservable) {
      formData.append("reservableHours", JSON.stringify(reservableHours));
    }
    images.forEach((image) => formData.append("images", image));

    try {
      if (isEditMode && initialData) {
        await updateOwnerPlace(initialData.id, formData);
        toast.success("Place updated and re-submitted!");
      } else {
        await addPlace(formData);
        toast.success("New spot submitted for approval!");
      }
      onSuccess();
    } catch (error) {
      const err = error as any;
      const errorMessage =
        err.response?.data?.error ||
        (isEditMode ? "Failed to update spot." : "Failed to add new spot.");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <DialogHeader className="p-6">
        <DialogTitle className="text-2xl text-brand-burgundy">
          Add Your Spot (Step 1 of 3)
        </DialogTitle>
        <DialogDescription className="text-brand-orange">
          Let's start with the basics. What is your spot called?
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 px-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-brand-burgundy font-semibold">
            Spot Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., The Grind Coffee House"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-brand-burgundy font-semibold">
            Spot Type
          </Label>
          <Select onValueChange={setType} value={type}>
            <SelectTrigger className="h-11">
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

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-brand-burgundy font-semibold"
          >
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what makes your spot special, its vibe, and why students would love it..."
            className="min-h-[120px]"
          />
        </div>
      </div>
      <DialogFooter className="p-6 pt-0">
        <Button
          onClick={() => setStep(2)}
          disabled={!name || !type || !description}
          className="bg-brand-orange text-brand-cream hover:bg-brand-orange/90 h-11 text-base"
        >
          Next: Details & Photos
        </Button>
      </DialogFooter>
    </>
  );

  const renderStep2 = () => (
    <>
      <DialogHeader className="p-6">
        <DialogTitle className="text-2xl text-brand-burgundy">
          Details & Photos (Step 2 of 3)
        </DialogTitle>
        <DialogDescription className="text-brand-orange">
          Showcase your space and list its key features.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 px-6 py-4">
        <div className="space-y-2">
          <Label className="text-brand-burgundy font-semibold">
            {isEditMode ? "Upload New Images (optional)" : "Upload Images (up to 5)"}
          </Label>
          <label
            htmlFor="images"
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-brand-yellow border-dashed rounded-xl cursor-pointer bg-white hover:bg-brand-cream/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-2 text-brand-orange" />
              <p className="mb-2 text-sm text-brand-burgundy">
                <span className="font-semibold">Click to upload</span> or drag and
                drop
              </p>
              <p className="text-xs text-brand-orange">
                PNG, JPG, or JPEG
              </p>
            </div>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className="hidden"
            />
          </label>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-brand-yellow"
                  />
                  <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-brand-burgundy font-semibold">
            Amenities
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMENITIES.map((a) => (
              <Button
                key={a.label}
                type="button"
                variant={
                  amenities.includes(a.label) ? "default" : "outline"
                }
                onClick={() => handleAmenityToggle(a.label)}
                className={`h-auto py-3 flex-col gap-2 transition-all shadow-sm ${
                  amenities.includes(a.label)
                    ? "bg-brand-orange text-brand-cream border-brand-orange shadow-lg"
                    : "border-brand-yellow text-brand-burgundy bg-white hover:bg-brand-yellow/50"
                }`}
              >
                {React.cloneElement(a.icon, {
                  className: `h-5 w-5 ${
                    amenities.includes(a.label)
                      ? "text-brand-cream"
                      : "text-brand-orange"
                  }`,
                })}
                <span className="font-medium">{a.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter className="justify-between p-6 pt-0">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="h-11 text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          className="bg-brand-orange text-brand-cream hover:bg-brand-orange/90 h-11 text-base"
        >
          Next: Location & Hours
        </Button>
      </DialogFooter>
    </>
  );

  const renderStep3 = () => (
    <>
      <DialogHeader className="p-6">
        <DialogTitle className="text-2xl text-brand-burgundy">
          Location & Hours (Step 3 of 3)
        </DialogTitle>
        <DialogDescription className="text-brand-orange">
          Where is your spot and when is it open for booking?
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 px-6 py-4">
        <div className="space-y-2">
          <Label
            htmlFor="address"
            className="text-brand-burgundy font-semibold"
          >
            Pick Location on Map
          </Label>
          <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-brand-orange z-0">
            <MapPicker
              location={location}
              setLocation={setLocation}
              setAddress={setAddress}
            />
          </div>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address will be auto-filled from map..."
            className="mt-2 h-11"
          />
        </div>

        <Card className="border-2 border-brand-orange bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="reservable"
              className="flex flex-col gap-0.5"
            >
              <span className="text-brand-burgundy font-semibold">
                Enable Reservations
              </span>
              <span className="text-xs text-brand-orange">
                Allow users to book this spot directly
              </span>
            </Label>
            <Switch
              id="reservable"
              checked={reservable}
              onCheckedChange={setReservable}
            />
          </div>

          {reservable && (
            <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-brand-yellow">
              <div>
                <Label
                  htmlFor="startTime"
                  className="text-brand-burgundy flex items-center gap-1 mb-1"
                >
                  <Clock className="h-4 w-4" />
                  Opening Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={reservableHours.start}
                  onChange={(e) =>
                    setReservableHours((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="h-11"
                />
              </div>
              <div>
                <Label
                  htmlFor="endTime"
                  className="text-brand-burgundy flex items-center gap-1 mb-1"
                >
                  <Clock className="h-4 w-4" />
                  Closing Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={reservableHours.end}
                  onChange={(e) =>
                    setReservableHours((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="h-11"
                />
              </div>
            </div>
          )}
        </Card>
      </div>
      <DialogFooter className="justify-between p-6 pt-0">
        <Button
          variant="outline"
          onClick={() => setStep(2)}
          className="h-11 text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !location}
          className="w-full max-w-[240px] h-12 text-lg font-semibold bg-brand-burgundy hover:bg-brand-burgundy/90 text-brand-cream"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isEditMode ? (
            "Update & Re-submit"
          ) : (
            "Submit for Approval"
          )}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <div className="max-h-[calc(90vh-4rem)] overflow-y-auto">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}