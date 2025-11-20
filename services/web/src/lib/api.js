// services/web/src/lib/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Critical: Allows cookies to be sent/received
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- AUTHENTICATION ---
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout'); // <--- Missing function added
export const verifyEmail = (data) => api.post('/auth/verify-email', data);
export const resendOtp = (data) => api.post('/auth/resend-otp', data);
export const requestPasswordReset = (data) => api.post('/auth/request-password-reset', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const changePassword = (data) => api.post('/auth/change-password', data); // <--- Missing function added

// --- USER PROFILE ---
// Uses '/profile' instead of IDs to be secure and simpler
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (data) => api.put('/users/profile', data); // <--- Missing function added
export const updateUserSettings = (data) => api.put('/users/settings', data); // <--- Missing function added

// --- CUSTOMER / BROWSING ---
export const getPlaces = (lat, lng) => {
  const params = (lat && lng) ? { lat, lng } : {};
  return api.get('/customers/places', { params });
};
export const getPlaceById = (placeId) => api.get(`/customers/places/${placeId}`);

// --- BOOKINGS (Customer) ---
export const createBooking = (data) => api.post('/customers/bookings', data);
export const getUserBookings = () => api.get('/customers/bookings');
export const getBookingByTicketId = (ticketId) => api.get(`/customers/bookings/ticket/${ticketId}`);

// --- BOOKMARKS & REVIEWS ---
export const getUserBookmarks = () => api.get('/customers/bookmarks');
export const getBoookmarkedPlaces = () => api.get('/customers/bookmarks/places');
export const addBookmark = (placeId) => api.post('/customers/bookmarks', { placeId });
export const removeBookmark = (placeId) => api.delete(`/customers/bookmarks/${placeId}`);
export const createReview = (data) => api.post('/customers/reviews', data);
export const getUserReviews = () => api.get('/customers/reviews');

// --- OWNER DASHBOARD ---
export const addPlace = (data) => api.post('/owners/places', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateOwnerPlace = (placeId, data) => api.put(`/owners/places/${placeId}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
}); // <--- Missing function added
export const getOwnerPlaces = () => api.get('/owners/places');
export const getOwnerPlaceById = (placeId) => api.get(`/owners/places/${placeId}`);
export const addMenuItem = (placeId, data) => api.post(`/owners/places/${placeId}/menu`, data);
export const addBundle = (placeId, data) => api.post(`/owners/places/${placeId}/bundles`, data);
export const getOwnerBookings = () => api.get('/owners/bookings');
export const updateBookingStatus = (bookingId, status) => api.put(`/owners/bookings/${bookingId}/status`, { status });
export const checkInByTicket = (ticketId) => api.post('/owners/bookings/check-in', { ticketId });

// --- ADMIN DASHBOARD ---
export const getPendingPlaces = () => api.get('/admin/places/pending');
export const approvePlace = (placeId) => api.put(`/admin/places/${placeId}/status`, { status: 'approved' });
export const rejectPlace = (placeId) => api.put(`/admin/places/${placeId}/status`, { status: 'rejected' });
export const getAdminPlaceStats = () => api.get('/admin/places/stats');
export const getPendingOwners = () => api.get('/admin/owners/pending');
export const updateOwnerStatus = (userId, status) => api.put(`/admin/owners/${userId}/status`, { status });

// --- PAYMENTS ---
export const createPaymentIntent = (amount, currency) => api.post('/payments/create-intent', { amount, currency });

export default api;