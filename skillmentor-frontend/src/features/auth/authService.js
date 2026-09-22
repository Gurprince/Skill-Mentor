// src/features/auth/authService.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/auth`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Important for sending cookies with cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials) => {
  try {
    console.log('Login request:', credentials);
    const res = await api.post('/api/auth/login', credentials);
    console.log('Login response:', res.data);
    return res.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Login failed';
    console.error('Login error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: errorMessage
    });
    throw errorMessage;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('Registration request:', userData);
    const res = await api.post('/api/auth/register', userData);
    console.log('Registration response:', res.data);
    return res.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
    console.error('Registration error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: errorMessage
    });
    throw errorMessage;
  }
};
