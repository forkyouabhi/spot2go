export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateJoined: string; // This will be mapped from createdAt in the token
  avatar?: string;
  provider?: 'google' | 'apple' | 'email';
  role: 'customer' | 'owner' | 'admin';
  createdAt: string; // Keep this to align with the token from the backend
}

export interface UserSettings {
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    bookingReminders: boolean;
    promotionalEmails: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showBookingHistory: boolean;
    allowLocationTracking: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    distanceUnit: 'km' | 'miles';
  };
}

// This interface now matches the backend model precisely.
export interface StudyPlace {
  id: string;
  name: string;
  type: 'cafe' | 'library' | 'coworking' | 'university';
  amenities: string[];
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  // Optional fields that may not always be present from the API
  distance?: string;
  rating?: number;
  image?: string;
  pricePerHour?: number;
  availableSlots?: TimeSlot[];
  reviews?: Review[];
  description?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  id: string;
  placeId: string;
  placeName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  ticketId: string;
}

export type Screen = 'splash' | 'login' | 'signup' | 'home' | 'place-details' | 'booking' | 'account' | 'confirmation' | 'settings';

