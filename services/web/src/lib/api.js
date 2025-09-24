import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Auth Endpoints ---
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// --- User Endpoints ---
export const updateUser = (userId, profileData) => api.put(`/users/${userId}`, profileData);
export const updateUserPassword = (userId, passwordData) => api.put(`/users/${userId}/password`, passwordData);

// --- Customer Endpoints ---
export const getPlaces = () => api.get('/customers/places');
export const getPlaceById = (placeId) => api.get(`/customers/places/${placeId}`);
export const getUserBookings = () => api.get('/customers/bookings');

// --- Owner Endpoints ---
export const addPlace = (placeData) => api.post('/owners/places', placeData);
export const getOwnerPlaces = () => api.get('/owners/places');

// --- Admin Endpoints ---
export const getPendingPlaces = () => api.get('/admin/places/pending');
export const approvePlace = (placeId) => api.put(`/admin/places/${placeId}/status`, { status: 'approved' });
export const rejectPlace = (placeId) => api.put(`/admin/places/${placeId}/status`, { status: 'rejected' });


export default api;

