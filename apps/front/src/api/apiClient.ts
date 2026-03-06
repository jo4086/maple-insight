import axios from 'axios';

export const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  baseURL: import.meta.env.VITE_API_URL || 'http://172.30.1.85:8001',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});
