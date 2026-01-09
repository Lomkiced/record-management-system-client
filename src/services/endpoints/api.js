import axios from 'axios';

// --- STRATEGY: CENTRALIZED CONFIGURATION ---
const API_URL = "http://localhost:5000/api";
const TOKEN_KEY = 'dost_token'; // Matches your Contexts

// 1. Create Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (The Security Gatekeeper)
// Automatically attaches the token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (The Error Handler)
// Catches 401 errors (Expired Session) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized.");
      // Optional: Redirect logic here
    }
    return Promise.reject(error);
  }
);

/* * ======================================================================================
 * API ENDPOINTS
 * Organized by Module for Scalability
 * ====================================================================================== */

// --- AUTHENTICATION ---
export const loginUser = async (credentials) => {
  // Points to the new Auth Route
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// --- RECORDS MANAGEMENT (The Core) ---

export const getRecords = async (params = {}) => {
  const response = await api.get('/records', { params });
  return response.data;
};

// Forced multipart/form-data for file uploads
export const createRecord = async (formData) => {
  const response = await api.post('/records', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });
  return response.data;
};

export const updateRecord = async (id, formData) => {
  const response = await api.put(`/records/${id}`, formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });
  return response.data;
};

export const archiveRecord = async (id) => {
    const response = await api.put(`/records/${id}/archive`);
    return response.data;
};

export const restoreRecord = async (id) => {
    const response = await api.put(`/records/${id}/restore`);
    return response.data;
};

export const deleteRecord = async (id) => {
  const response = await api.delete(`/records/${id}`);
  return response.data;
};

// --- CODEX (Classification Rules) ---
export const getCategories = async () => {
    const response = await api.get('/codex/categories'); 
    return response.data;
};

export const addCategory = async (data) => {
    const response = await api.post('/codex/categories', data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/codex/categories/${id}`);
    return response.data;
};

export const getTypes = async () => {
    const response = await api.get('/codex/types');
    return response.data;
};

export const addType = async (data) => {
    const response = await api.post('/codex/types', data);
    return response.data;
};

export const deleteType = async (id) => {
    const response = await api.delete(`/codex/types/${id}`);
    return response.data;
};

// --- USER PROFILE & SETTINGS ---
export const getUserProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/profile/password', passwordData);
  return response.data;
};

// --- SYSTEM ADMIN & DASHBOARD ---
export const getStats = async () => {
  const response = await api.get('/dashboard/stats'); 
  return response.data;
};

export const getLogs = async (params = {}) => {
  const response = await api.get('/admin/logs', { params });
  return response.data;
};

// --- USER MANAGEMENT (Crucial for Admin Panel) ---
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/users/${id}/status`, { status });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// --- BACKUP & RESTORE ---
export const downloadBackup = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}/backup`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('Backup failed');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `dost_backup_${Date.now()}.sql`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default api;