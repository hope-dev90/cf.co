const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API client
const apiClient = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  let data: { message?: string; [key: string]: unknown } = {};
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return {};
  }
  
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Auth API
export const authApi = {
  register: (name: string, email: string, password: string, role: string) => 
    apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email: normalizeEmail(email), password, role }),
    }),
    
  login: (email: string, password: string) => 
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizeEmail(email), password }),
    }),
    
  googleLogin: (credential: string, role?: string) => 
    apiClient('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, role }),
    }),
  
  verifyEmail: (email: string, otp: string) => 
    apiClient('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resendOtp: (email: string) =>
    apiClient('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    
  forgotPassword: (email: string) => 
    apiClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    
  resetPassword: (email: string, otp: string, newPassword: string) => 
    apiClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),
    
  getProfile: () => 
    apiClient('/auth/profile', {
      method: 'GET',
    }),
    
  getUsers: () => 
    apiClient('/auth/users', {
      method: 'GET',
    }),
};

// Restaurants API
export const restaurantApi = {
  getAll: () => apiClient('/restaurants', { method: 'GET' }),
  getById: (id: string | number) => apiClient(`/restaurants/${id}`, { method: 'GET' }),
  getMy: () => apiClient('/restaurants/my', { method: 'GET' }),
  create: (data: Record<string, unknown>) => apiClient('/restaurants', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string | number, data: Record<string, unknown>) => apiClient(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string | number) => apiClient(`/restaurants/${id}`, { method: 'DELETE' }),
  getMenu: (restaurantId: string | number) =>
    apiClient(`/restaurants/${restaurantId}/menu`, { method: 'GET' }),
  getTables: (restaurantId: string | number) =>
    apiClient(`/restaurants/${restaurantId}/tables`, { method: 'GET' }),
  getTableAvailability: (restaurantId: string | number, date: string) =>
    apiClient(`/restaurants/${restaurantId}/tables/availability/${date}`, { method: 'GET' }),
  reserveTable: (availabilityId: number, data: Record<string, unknown>) =>
    apiClient(`/restaurants/tables/availability/${availabilityId}/reserve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Orders API
export const orderApi = {
  create: (data: Record<string, unknown>) => apiClient('/restaurants/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMy: () => apiClient('/restaurants/orders/my', { method: 'GET' }),
  getById: (id: string | number) => apiClient(`/restaurants/orders/${id}`, { method: 'GET' }),
  getByRestaurant: (restaurantId: string | number, status?: string) => {
    const url = status
      ? `/restaurants/${restaurantId}/orders?status=${status}`
      : `/restaurants/${restaurantId}/orders`;
    return apiClient(url, { method: 'GET' });
  },
  updateStatus: (id: string | number, status: string) =>
    apiClient(`/restaurants/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
