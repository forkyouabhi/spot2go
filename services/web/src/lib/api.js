import axios from 'axios';

// Read the backend API URL from the environment variable, with a fallback for local development.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create a pre-configured instance of axios.
// All API requests will originate from this instance.
const api = axios.create({
  baseURL: API_URL,
});

/**
 * A critical function that adds the user's JWT to the headers of all subsequent API requests.
 * This is how the backend knows the user is authenticated.
 * @param {string | null} token The JWT received from the server after login.
 */
export const setAuthToken = (token) => {
  if (token) {
    // If a token is provided, add it to the Authorization header.
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // If no token is provided (e.g., on logout), remove the header.
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Authentication Endpoints ---
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);


// --- Customer-Facing Endpoints ---
export const getPlaces = () => api.get('/customers/places');
export const getPlaceById = (id) => api.get(`/customers/places/${id}`); // Example for a future details page
export const createBooking = (bookingData) => api.post('/customers/bookings', bookingData);
export const getUserBookings = () => api.get('/customers/bookings');

// --- Owner-Facing Endpoints (for future use) ---
export const getOwnerPlaces = () => api.get('/owners/places');
export const createPlace = (placeData) => api.post('/owners/places', placeData);


export default api;

