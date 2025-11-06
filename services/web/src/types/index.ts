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
  id: string;
  name: string;
  email: string;
  phone?: string; 
  dateJoined: string;
  avatar?: string;
  provider?: 'google' | 'apple' | 'email';
  role: 'customer' | 'owner' | 'admin';
  status: 'active' | 'pending_verification' | 'rejected';
  createdAt: string;
  created_at?: string; 
  businessLocation?: string;
  settings?: UserSettings; 
}

export interface MenuItem {
  id: number;
  name: string;
  price: string;
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
  images?: string[];
  description?: string;
  menuItems?: MenuItem[];
  reservable?: boolean;
  reservableHours?: {
    start: string;
    end: string;
  };
  maxCapacity?: number; // <-- NEW
  distance?: string;
  rating?: number;
  pricePerHour?: number;
  availableSlots?: TimeSlot[]; 
  reviews?: Review[];
  created_at: string;
  owner?: Partial<User>;
}

// --- MODIFIED: TimeSlot now has remainingCapacity ---
export interface TimeSlot {
  date: string;
  startTime: string;
  remainingCapacity: number; // <-- CHANGED from 'available: boolean'
}
// --- END MODIFICATION ---

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  user?: Partial<User>; 
  created_at?: string; 
  place?: Partial<StudyPlace>;
}

export interface Booking {
  id: string;
  placeId: string;
  placeName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration?: number;
  partySize?: number; // <-- NEW
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
  ticketId: string;  
  place?: StudyPlace;
  user?: User;
  reviewed?: boolean;
}

export type Screen = 'splash' | 'login' | 'signup' | 'home' | 'place-details' | 'booking' | 'account' | 'confirmation' | 'settings';