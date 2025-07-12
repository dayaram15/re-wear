import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:5000/api",
    withCredentials: true,
});

// Add request interceptor for debugging and token handling
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('Request:', config.method?.toUpperCase(), config.url);
        
        // Add token from localStorage as Authorization header if available
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default axiosInstance;