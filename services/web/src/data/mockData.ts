import {
  StudyPlace,
  User,
  Booking,
  UserSettings,
} from "../types";

export const mockUser: User = {
  id: "1",
  name: "Abhi",
  email: "hello@abhijeet.app",
  phone: "+1 (807) 555-0123",
  dateJoined: "2024-03-15",
  provider: "email",
  role: "customer",
  status: "active",
  createdAt: "2024-03-15T10:00:00Z",
};

export const mockUserSettings: UserSettings = {
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    bookingReminders: true,
    promotionalEmails: false,
  },
  privacy: {
    profileVisibility: "public",
    showBookingHistory: true,
    allowLocationTracking: true,
  },
  preferences: {
    theme: "system",
    language: "en",
    currency: "CAD",
    distanceUnit: "km",
  },
};

export const mockPlaces: StudyPlace[] = [
  {
    id: "1",
    name: "Brew & Study Cafe",
    type: "cafe",
    status: 'approved',
    created_at: "2024-01-01T12:00:00Z",
    distance: "0.3 km",
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1562727226-fbcc78ac89e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwc3R1ZHklMjBzcGFjZXxlbnwxfHx8fDE3NTg1NzMwMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    amenities: [
      "Wi-Fi",
      "Power Outlets",
      "Coffee",
      "Quiet Area",
    ],
    description:
      "A cozy cafe perfect for studying with excellent coffee and reliable Wi-Fi.",
    location: {
      address: "123 College St, Thunder Bay",
    },
    pricePerHour: 5,
    availableSlots: [
      { id: "1", date: "2025-09-23", startTime: "09:00", endTime: "11:00", available: true },
      { id: "2", date: "2025-09-23", startTime: "13:00", endTime: "15:00", available: true },
      { id: "3", date: "2025-09-24", startTime: "10:00", endTime: "12:00", available: true },
    ],
    reviews: [
      { id: "1", userId: "2", userName: "Sarah M.", rating: 5, comment: "Perfect spot for studying! Great coffee and very quiet.", date: "2025-09-20" },
      { id: "2", userId: "3", userName: "Mike T.", rating: 4, comment: "Good atmosphere, but can get busy during exam season.", date: "2025-09-18" },
    ],
  },
  {
    id: "2",
    name: "Thunder Bay Public Library",
    type: "library",
    status: 'approved',
    created_at: "2024-01-02T12:00:00Z",
    distance: "0.8 km",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1629553997821-b21270f19bd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwcmVhZGluZyUyMHJvb218ZW58MXx8fHwxNzU4NTcxMDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    amenities: [ "Wi-Fi", "Power Outlets", "Printing", "Silent Study Rooms", "Books" ],
    description: "Modern library with dedicated study spaces and extensive resources.",
    location: {
      address: "456 Library Ave, Thunder Bay",
    },
    availableSlots: [
      { id: "4", date: "2025-09-23", startTime: "08:00", endTime: "20:00", available: true },
      { id: "5", date: "2025-09-24", startTime: "08:00", endTime: "20:00", available: true },
    ],
    reviews: [
      { id: "3", userId: "4", userName: "Emma L.", rating: 5, comment: "Excellent facilities and always quiet. Perfect for serious studying.", date: "2025-09-19" },
    ],
  },
  {
    id: "3",
    name: "WorkHub Co-working",
    type: "coworking",
    status: 'approved',
    created_at: "2024-01-03T12:00:00Z",
    distance: "1.2 km",
    rating: 4.3,
    images: [
      "https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBzcGFjZSUyMG1vZGVybnxlbnwxfHx8fDE3NTg1NzMwMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    amenities: [ "Wi-Fi", "Power Outlets", "Meeting Rooms", "Coffee", "Printing" ],
    description: "Modern co-working space with flexible seating and professional atmosphere.",
    location: {
      address: "789 Business Blvd, Thunder Bay",
    },
    pricePerHour: 12,
    availableSlots: [
      { id: "6", date: "2025-09-23", startTime: "09:00", endTime: "17:00", available: true },
      { id: "7", date: "2025-09-24", startTime: "09:00", endTime: "17:00", available: true },
    ],
    reviews: [
      { id: "4", userId: "5", userName: "David R.", rating: 4, comment: "Great for professional work. A bit pricey but worth it.", date: "2025-09-17" },
    ],
  },
  {
    id: "4",
    name: "Lakehead University Study Hall",
    type: "university",
    status: 'approved',
    created_at: "2024-01-04T12:00:00Z",
    distance: "2.1 km",
    rating: 4.2,
    images: [
      "https://images.unsplash.com/photo-1567562227343-a72d22e187c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwc3R1ZHl8ZW58MXx8fHwxNzU4NTczMDEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ],
    amenities: [ "Wi-Fi", "Power Outlets", "Student Resources", "Group Study Rooms" ],
    description: "University study hall open to the public with great facilities.",
    location: {
      address: "955 Oliver Rd, Thunder Bay",
    },
    availableSlots: [
      { id: "8", date: "2025-09-23", startTime: "07:00", endTime: "23:00", available: true },
      { id: "9", date: "2025-09-24", startTime: "07:00", endTime: "23:00", available: true },
    ],
    reviews: [
      { id: "5", userId: "6", userName: "Jessica K.", rating: 4, comment: "Good facilities, but can get crowded during exam periods.", date: "2025-09-16" },
    ],
  },
];

export const mockBookings: Booking[] = [
  {
    id: "1",
    placeId: "1",
    placeName: "Brew & Study Cafe",
    date: "2025-09-25",
    startTime: "14:00",
    endTime: "16:00",
    status: "confirmed",
    ticketId: "SPOT2GO-001",
  },
  {
    id: "2",
    placeId: "2",
    placeName: "Thunder Bay Public Library",
    date: "2025-09-26",
    startTime: "10:00",
    endTime: "12:00",
    status: "confirmed",
    ticketId: "SPOT2GO-002",
  },
];