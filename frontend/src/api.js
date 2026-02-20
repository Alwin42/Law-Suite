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
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Auth & Onboarding ---
export const loginUser = (credentials) => api.post('login/', credentials);
export const registerAdvocate = (userData) => api.post('register/advocate/', userData);
export const registerClient = (userData) => api.post('register/client/', userData);
export const requestOTP = (email) => api.post('auth/otp/request/', { email });
export const verifyOTP = (data) => api.post('auth/otp/verify/', data);
export const getActiveAdvocates = () => api.get('advocates/active/');

// --- Dashboards & Data ---
export const getUserProfile = () => api.get('user/profile/');
export const getAdvocateAppointments = () => api.get('advocate/appointments/');
export const updateAppointmentStatus = (id, data) => api.patch(`appointments/${id}/status/`, data);
export const bookAppointment = (data) => api.post('appointments/book/', data);
export const getAdvocateHearings = () => api.get('advocate/hearings/');
export const updateCaseDetails = (id, data) => api.patch(`cases/${id}/`, data);

// --- Templates & Documents ---
export const getTemplates = () => api.get('templates/');
export const deleteTemplate = (id) => api.delete(`templates/${id}/`);
export const uploadTemplate = (formData) => api.post('templates/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const getDocuments = () => api.get('documents/');
export const getCaseDocuments = (caseId) => api.get(`cases/${caseId}/documents/`);
export const uploadDocument = (formData) => api.post('documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

// --- NEW: Client Management ---
export const getClientDetails = (id) => api.get(`clients/${id}/`);
export const getAdvocateClientCases = (id) => api.get(`clients/${id}/cases/`);
export const getClientPayments = (id) => api.get(`clients/${id}/payments/`);
export const addClientPayment = (id, data) => api.post(`clients/${id}/payments/`, data);

// --- Client Portal (For later) ---
export const getClientCases = () => api.get('client/cases/');
export const getClientHearings = () => api.get('client/hearings/');

export default api;