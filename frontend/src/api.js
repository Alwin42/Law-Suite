import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        // Check if there is a token in storage
        const token = localStorage.getItem('access_token');
        if (token) {
            // If found, attach it to the header: Authorization: Bearer <token>
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// --- ADVOCATE AUTH ---
export const loginUser = (credentials) => api.post('login/', credentials);
export const registerAdvocate = (userData) => api.post('register/advocate/', userData);

// --- CLIENT AUTH ---
export const registerClient = (userData) => api.post('register/client/', userData);
export const requestOTP = (email) => api.post('auth/otp/request/', { email });
export const verifyOTP = (data) => api.post('auth/otp/verify/', data);

// --- DATA FETCHING ---
export const getActiveAdvocates = () => api.get('advocates/active/');

export default api;