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
    async (error) => {
        let errorMessage = error.message || 'An unknown error occurred';

        // Critical: If responseType was 'blob', the error data is also a Blob.
        // We need to parse it to see the actual JSON error message from the server.
        if (error.response?.data instanceof Blob && error.response.data.type === 'application/json') {
            try {
                const text = await error.response.data.text();
                const json = JSON.parse(text);
                errorMessage = json.message || errorMessage;
            } catch (e) {
                console.error('Failed to parse error blob', e);
            }
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        const customError = new Error(errorMessage);
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
