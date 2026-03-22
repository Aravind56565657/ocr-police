import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor to format errors seamlessly
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const customError = new Error(
            error.response?.data?.message || error.message || 'An unknown error occurred'
        );
        customError.status = error.response?.status;
        customError.data = error.response?.data;
        return Promise.reject(customError);
    }
);

// File uploads need a special interceptor or custom function if using multipart
export const uploadFile = (endpoint, formData, onUploadProgress) => {
    return api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
    });
};

export default api;
