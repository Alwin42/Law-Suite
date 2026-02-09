import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginUser = (credentials) => api.post('login/', credentials);
export const registerUser = (userData) => api.post('register/', userData);

export default api;