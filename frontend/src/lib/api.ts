type Role = "client" | "restaurateur" | "admin";

interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface ApiWaiter {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  restaurant_id: number;
  staff_role?: "waiter" | "manager" | "security" | "chef" | "cashier";
  task?: string;
  task_done?: boolean;
  photo_url?: string;
  status?: "active" | "inactive" | "on_leave";
  created_at: string;
  updated_at: string;
}

interface ApiResponse<_T = unknown> {
  success: boolean;
  message?: string;
  [key: string]: unknown;
  user?: ApiUser;
  token?: string;
  restaurants?: ApiRestaurant[];
  restaurant?: ApiRestaurant;
  menuItems?: ApiMenuItem[];
  menuItem?: ApiMenuItem;
  tables?: ApiTable[];
  table?: ApiTable;
  availability?: ApiTableAvailability[];
  orders?: ApiOrder[];
  order?: ApiOrder;
  users?: ApiUser[];
  waiters?: ApiWaiter[];
  waiter?: ApiWaiter;
}

interface ApiRestaurant {
  id: number;
  name: string;
  description?: string;
  cuisine_type?: string;
  phone?: string;
  email?: string;
  website?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface ApiMenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  is_available: boolean;
  restaurant_id: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface ApiTable {
  id: number;
  table_number: string;
  capacity: number;
  location_description?: string;
  position_x: number;
  position_y: number;
  is_active: boolean;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
}

interface ApiTableAvailability {
  id: number;
  table_id: number;
  user_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "reserved" | "occupied";
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ApiOrderItem {
  id: number;
  order_id: number;
  menu_item_id?: number;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  created_at: string;
}

interface ApiOrder {
  id: number;
  user_id?: number;
  restaurant_id: number;
  table_availability_id?: number;
  customer_name: string;
  customer_phone: string;
  order_type: "dine-in" | "takeaway" | "delivery";
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  total_amount: number;
  payment_method?: string;
  notes?: string;
  delivery_address?: string;
  created_at: string;
  updated_at: string;
  items?: ApiOrderItem[];
}

interface ApiAnalytics {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

interface ApiDailySale {
  date: string;
  orders_count: number;
  revenue: number;
}

interface ApiTopMenuItem {
  id: number;
  name: string;
  image_url?: string;
  total_sold: number;
}

interface ApiOrderStatusCount {
  status: string;
  count: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API client
const apiClient = async <T = unknown>(url: string, options: RequestInit = {}): Promise<T> => {
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

  let data: ApiResponse<T> = {} as ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return {} as T;
  }
  
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data as T;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Auth API
export const authApi = {
  register: (name: string, email: string, password: string, role: string, restaurantData?: Record<string, unknown>) => 
    apiClient<ApiResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        email: normalizeEmail(email), 
        password, 
        role,
        restaurantData 
      }),
    }),
    
  login: (email: string, password: string) => 
    apiClient<{ success: boolean; message: string; token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizeEmail(email), password }),
    }),
    
  googleLogin: (credential: string, role?: string) => 
    apiClient<{ success: boolean; message: string; token: string; user: ApiUser }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, role }),
    }),
  
  verifyEmail: (email: string, otp: string) => 
    apiClient<ApiResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resendOtp: (email: string) =>
    apiClient<ApiResponse>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    
  forgotPassword: (email: string) => 
    apiClient<ApiResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    
  resetPassword: (email: string, otp: string, newPassword: string) => 
    apiClient<ApiResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),
    
  getProfile: () => 
    apiClient<{ success: boolean; user: ApiUser }>('/auth/profile', {
      method: 'GET',
    }),
    
  getUsers: () => 
    apiClient<{ success: boolean; users: ApiUser[] }>('/auth/users', {
      method: 'GET',
    }),
};

// Admin API
export const adminApi = {
  getStats: () =>
    apiClient<{ success: boolean; stats: { total_users: number; total_restaurants: number; total_orders: number; total_revenue: number } }>('/restaurants/admin/stats', { method: 'GET' }),
  getAllOrders: () =>
    apiClient<{ success: boolean; orders: (ApiOrder & { restaurant_name?: string; user_name?: string })[] }>('/restaurants/admin/orders', { method: 'GET' }),
  toggleRestaurantStatus: (id: number, is_active: boolean) =>
    apiClient<{ success: boolean; restaurant: ApiRestaurant & { is_active: boolean } }>(`/restaurants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    }),
  deleteRestaurant: (id: number) =>
    apiClient<{ success: boolean }>(`/restaurants/${id}`, { method: 'DELETE' }),
};

// Upload API (multipart, not JSON)
export const uploadApi = {
  restaurantImage: async (file: File): Promise<string> => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE_URL}/upload/restaurant-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
    return data.url as string;
  },
};

// Restaurants API
export const restaurantApi = {
  getAll: () => apiClient<{ success: boolean; restaurants: ApiRestaurant[] }>('/restaurants', { method: 'GET' }),
  getById: (id: string | number) => apiClient<{ success: boolean; restaurant: ApiRestaurant }>(`/restaurants/${id}`, { method: 'GET' }),
  getMy: () => apiClient<{ success: boolean; restaurants: ApiRestaurant[] }>('/restaurants/my', { method: 'GET' }),
  create: (data: Record<string, unknown>) => apiClient<{ success: boolean; restaurant: ApiRestaurant }>('/restaurants', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string | number, data: Record<string, unknown>) => apiClient<{ success: boolean; restaurant: ApiRestaurant }>(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string | number) => apiClient<{ success: boolean }>(`/restaurants/${id}`, { method: 'DELETE' }),

  addLocation: (restaurantId: string | number, data: Record<string, unknown>) =>
    apiClient<{ success: boolean }>(`/restaurants/${restaurantId}/locations`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Menu Items
  getMenu: (restaurantId: string | number) => apiClient<{ success: boolean; menuItems: ApiMenuItem[] }>(`/restaurants/${restaurantId}/menu`, { method: 'GET' }),
  addMenuItem: (restaurantId: string | number, data: Record<string, unknown>) => 
    apiClient<{ success: boolean; menuItem: ApiMenuItem }>(`/restaurants/${restaurantId}/menu`, { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id: string | number, data: Record<string, unknown>) => 
    apiClient<{ success: boolean; menuItem: ApiMenuItem }>(`/restaurants/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMenuItem: (id: string | number) => 
    apiClient<{ success: boolean }>(`/restaurants/menu/${id}`, { method: 'DELETE' }),
  
  // Tables
  getTables: (restaurantId: string | number) => apiClient<{ success: boolean; tables: ApiTable[] }>(`/restaurants/${restaurantId}/tables`, { method: 'GET' }),
  addTable: (restaurantId: string | number, data: Record<string, unknown>) =>
    apiClient<{ success: boolean; table: ApiTable }>(`/restaurants/${restaurantId}/tables`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTable: (id: string | number, data: Record<string, unknown>) =>
    apiClient<{ success: boolean; table: ApiTable }>(`/restaurants/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTable: (id: string | number) =>
    apiClient<{ success: boolean }>(`/restaurants/tables/${id}`, { method: 'DELETE' }),
  getTableAvailability: (restaurantId: string | number, date: string) =>
    apiClient<{ success: boolean; availability: ApiTableAvailability[] }>(`/restaurants/${restaurantId}/tables/availability/${date}`, { method: 'GET' }),
  reserveTable: (availabilityId: number, data: Record<string, unknown>) =>
    apiClient<{ success: boolean; availability: ApiTableAvailability }>(`/restaurants/tables/availability/${availabilityId}/reserve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Waiters
  getWaiters: (restaurantId: string | number) => apiClient<{ success: boolean; waiters: ApiWaiter[] }>(`/restaurants/${restaurantId}/waiters`, { method: 'GET' }),
  addWaiter: (restaurantId: string | number, data: Record<string, unknown>) =>
    apiClient<{ success: boolean; waiter: ApiWaiter }>(`/restaurants/${restaurantId}/waiters`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateWaiter: (id: string | number, data: Record<string, unknown>) =>
    apiClient<{ success: boolean; waiter: ApiWaiter }>(`/restaurants/waiters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteWaiter: (id: string | number) =>
    apiClient<{ success: boolean }>(`/restaurants/waiters/${id}`, { method: 'DELETE' }),
    
  // Analytics
  getAnalytics: (restaurantId: string | number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const url = `/restaurants/${restaurantId}/analytics${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient<{ success: boolean; analytics: ApiAnalytics }>(url, { method: 'GET' });
  },
  getDailySales: (restaurantId: string | number, startDate: string, endDate: string) => {
    const params = new URLSearchParams({ startDate, endDate });
    return apiClient<{ success: boolean; dailySales: ApiDailySale[] }>(
      `/restaurants/${restaurantId}/analytics/daily-sales?${params.toString()}`,
      { method: 'GET' }
    );
  },
  getTopMenuItems: (restaurantId: string | number, limit?: number) => {
    const params = limit ? new URLSearchParams({ limit: limit.toString() }) : new URLSearchParams();
    const url = `/restaurants/${restaurantId}/analytics/top-items${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient<{ success: boolean; topItems: ApiTopMenuItem[] }>(url, { method: 'GET' });
  },
  getOrdersByStatus: (restaurantId: string | number) => 
    apiClient<{ success: boolean; statusCounts: ApiOrderStatusCount[] }>(`/restaurants/${restaurantId}/analytics/orders-status`, { method: 'GET' }),
};

// Orders API
export const orderApi = {
  create: (data: Record<string, unknown>) => apiClient<{ success: boolean; order: ApiOrder }>('/restaurants/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMy: () => apiClient<{ success: boolean; orders: ApiOrder[] }>('/restaurants/orders/my', { method: 'GET' }),
  getById: (id: string | number) => apiClient<{ success: boolean; order: ApiOrder }>(`/restaurants/orders/${id}`, { method: 'GET' }),
  getByRestaurant: (restaurantId: string | number, status?: string) => {
    const url = status
      ? `/restaurants/${restaurantId}/orders?status=${status}`
      : `/restaurants/${restaurantId}/orders`;
    return apiClient<{ success: boolean; orders: ApiOrder[] }>(url, { method: 'GET' });
  },
  updateStatus: (id: string | number, status: string) =>
    apiClient<{ success: boolean; order: ApiOrder }>(`/restaurants/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export type { 
  ApiRestaurant, 
  ApiMenuItem, 
  ApiTable, 
  ApiTableAvailability, 
  ApiOrder, 
  ApiOrderItem, 
  ApiUser, 
  ApiWaiter, 
  ApiAnalytics, 
  ApiDailySale, 
  ApiTopMenuItem, 
  ApiOrderStatusCount 
};
