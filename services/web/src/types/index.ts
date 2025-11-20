// services/web/src/types/index.ts

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

export interface User {
  id: string | number; // Allow both for flexibility (DB is number, Forms are string)
  name: string;
  email: string;
  phone?: string; 
  dateJoined?: string;
  avatar?: string;
  provider?: 'google' | 'apple' | 'email';
  role: 'customer' | 'owner' | 'admin';
  status: 'active' | 'pending_verification' | 'rejected';
  
  // Timestamps
  createdAt?: string;
  created_at?: string; 
  
  // Owner specific
  businessLocation?: string;
  
  // Settings
  settings?: UserSettings;
  emailVerified?: boolean;
}

export interface MenuItem {
  id: string | number;
  name: string;
  // Fixed: Allow string for inputs, number for calculations
  price: string | number; 
  placeId?: string | number;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime?: string;
  remainingCapacity: number; 
}

export interface Review {
  id: string | number;
  rating: number;
  comment: string;
  userId: string | number;
  placeId?: string | number;
  
  userName?: string; // Optional legacy field
  date?: string;
  created_at?: string; 
  
  // Relations
  user?: Partial<User>; 
  place?: Partial<StudyPlace>;
}

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
  
  // Details
  images?: string[];
  description?: string;
  menuItems?: MenuItem[];
  reservable?: boolean;
  reservableHours?: {
    start: string;
    end: string;
  };
  
  // Capacity & Stats
  maxCapacity?: number;
  distance?: string | number;
  rating?: number | string;
  pricePerHour?: number;
  reviewCount?: number;
  
  // Relations
  availableSlots?: TimeSlot[];
  reviews?: Review[];
  owner?: Partial<User>;
  
  created_at?: string;
  isOpen?: boolean; 
}

export interface Booking {
  id: string ;
  placeId: string | number;
  placeName?: string; // Optional legacy
  
  date: string;
  startTime: string;
  endTime: string;
  duration?: number;
  partySize?: number;
  
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
  ticketId: string;  
  
  place?: StudyPlace;
  user?: User;
  reviewed?: boolean;
}

export type Screen = 'splash' | 'login' | 'signup' | 'home' | 'place-details' | 'booking' | 'account' | 'confirmation' | 'settings';