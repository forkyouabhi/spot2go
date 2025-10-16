export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateJoined: string;
  avatar?: string;
  provider?: 'google' | 'apple' | 'email';
  role: 'customer' | 'owner' | 'admin';
  createdAt: string;
  // This is sometimes included from the token, good to have for compatibility
  created_at?: string; 
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

// NEW: Interface for menu items
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
  menuItems?: MenuItem[]; // ADDED: menuItems property
  reservable?: boolean;
  reservableHours?: {
    start: string;
    end: string;
  };
  // Optional fields that may not always be present from the API
  distance?: string;
  rating?: number;
  pricePerHour?: number;
  availableSlots?: TimeSlot[];
  reviews?: Review[];
  created_at: string; // From the database
  owner?: Partial<User>; // For admin dashboard
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