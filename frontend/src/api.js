// src/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- SIMPLIFIED INTERCEPTOR ---
api.interceptors.request.use(
    (config) => {
        // 1. Get the token
        const token = localStorage.getItem('access_token');
        
        // 2. ALWAYS attach it if it exists. 
        //  let the Backend decide if it's needed or not.
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- API CALLS  ---
export const loginUser = (credentials) => api.post('login/', credentials);
export const registerAdvocate = (userData) => api.post('register/advocate/', userData);
export const registerClient = (userData) => api.post('register/client/', userData);
export const requestOTP = (email) => api.post('auth/otp/request/', { email });
export const verifyOTP = (data) => api.post('auth/otp/verify/', data);
export const getActiveAdvocates = () => api.get('advocates/active/');

// New endpoints for fetching user-specific data
export const getUserProfile = () => api.get('user/profile/');
export const getClientCases = () => api.get('client/cases/');
export const getClientHearings = () => api.get('client/hearings/');
export const getClientPayments = () => api.get('client/payments/');
export const getAdvocateAppointments = () => api.get('advocate/appointments/');
export const bookAppointment = (data) => api.post('appointments/book/', data);
export const updateAppointmentStatus = (id, data) => api.patch(`appointments/${id}/status/`, data);
export const getAdvocateHearings = () => api.get('advocate/hearings/');
export const updateCaseDetails = (id, data) => api.patch(`cases/${id}/`, data); 
export default api;