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

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API
export const authApi = {
  register: (name: string, email: string, password: string, role: string) => 
    apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
    
  login: (email: string, password: string) => 
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  verifyEmail: (email: string, otp: string) => 
    apiClient('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
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
  getById: (id: string) => apiClient(`/restaurants/${id}`, { method: 'GET' }),
  getMy: () => apiClient('/restaurants/my', { method: 'GET' }),
  create: (data: any) => apiClient('/restaurants', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiClient(`/restaurants/${id}`, { method: 'DELETE' }),
};

// Orders API
export const orderApi = {
  create: (data: any) => apiClient('/restaurants/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMy: () => apiClient('/restaurants/orders/my', { method: 'GET' }),
  getById: (id: string) => apiClient(`/restaurants/orders/${id}`, { method: 'GET' }),
  getByRestaurant: (restaurantId: string, status?: string) => {
    const url = status 
      ? `/restaurants/${restaurantId}/orders?status=${status}` 
      : `/restaurants/${restaurantId}/orders`;
    return apiClient(url, { method: 'GET' });
  },
  updateStatus: (id: string, status: string) => 
    apiClient(`/restaurants/orders/${id}/status`, { 
      method: 'PATCH', 
      body: JSON.stringify({ status }) 
    }),
};
