// services/web/src/lib/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to automatically attach the token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
export const requestPasswordReset = (emailData) => api.post('/auth/request-password-reset', emailData);
export const resetPassword = (resetData) => api.post('/auth/reset-password', resetData);

// --- User Endpoints ---
export const updateUser = (userId, profileData) => api.put(`/users/${userId}`, profileData);
export const updateUserPassword = (userId, passwordData) => api.put(`/users/${userId}/password`, passwordData);
export const updateUserSettings = (userId, settings) => api.put(`/users/${userId}/settings`, { settings });

// --- Customer Endpoints ---
export const getPlaces = () => api.get('/customers/places');
export const getPlaceById = (placeId) => api.get(`/customers/places/${placeId}`);
export const getUserBookings = () => api.get('/customers/bookings');
export const createBooking = (bookingData) => api.post('/customers/bookings', bookingData);

// --- Owner Endpoints ---
export const addPlace = (placeData) => api.post('/owners/places', placeData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getOwnerPlaces = () => api.get('/owners/places');
export const getOwnerPlaceById = (placeId) => api.get(`/owners/places/${placeId}`);
export const updateOwnerPlace = (placeId, placeData) => api.put(`/owners/places/${placeId}`, placeData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const addMenuItem = (placeId, menuItemData) => api.post(`/owners/places/${placeId}/menu`, menuItemData);
export const addBundle = (placeId, bundleData) => api.post(`/owners/places/${placeId}/bundles`, bundleData);


// --- Admin Endpoints ---
export const getPendingPlaces = () => api.get('/admin/places/pending');
export const approvePlace = (placeId) => api.put(`/admin/places/${placeId}/status`, { status: 'approved' });
export const rejectPlace = (placeId) => api.put(`/admin/places/${placeId}/status`, { status: 'rejected' });
export const getAdminPlaceStats = () => api.get('/admin/places/stats');

// NEW Admin Owner Management Endpoints
export const getPendingOwners = () => api.get('/admin/owners/pending');
export const updateOwnerStatus = (userId, status) => api.put(`/admin/owners/${userId}/status`, { status });


export default api;