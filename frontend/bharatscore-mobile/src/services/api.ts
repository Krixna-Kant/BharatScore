import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - update this to match your backend
const API_BASE_URL = process.env.API_BASE_URL || 'http://10.0.2.2:8000'; // 10.0.2.2 for Android emulator

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('clerk_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access, redirecting to login');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Profile endpoints
  profile: {
    create: (data: any) => api.post('/profile', data),
    get: (clerkUserId: string) => api.get(`/profile?clerk_user_id=${clerkUserId}`),
  },
  
  // Onboarding endpoints
  onboarding: {
    submit: (data: any) => api.post('/onboard', data),
  },
  
  // Score endpoints
  score: {
    get: (clerkUserId: string) => api.get(`/score?clerk_user_id=${clerkUserId}`),
  },
  
  // Applications endpoints
  applications: {
    get: (clerkUserId: string) => api.get(`/applications?clerk_user_id=${clerkUserId}`),
    create: (data: any) => api.post('/applications', data),
  },
};

export default api;
