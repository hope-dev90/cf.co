import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyEmail: (data) => api.post("/auth/verify-email", data),
  resendOtp: (data) => api.post("/auth/resend-otp", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getProfile: () => api.get("/auth/profile"),
  getUsers: () => api.get("/auth/users"),
};

// ── Restaurants ───────────────────────────────────────
export const restaurantAPI = {
  getAll: () => api.get("/restaurants"),
  getMine: () => api.get("/restaurants/my"),
  getById: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post("/restaurants", data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

// ── Menu ──────────────────────────────────────────────
export const menuAPI = {
  getItems: (restaurantId) => api.get(`/restaurants/${restaurantId}/menu`),
  addItem: (restaurantId, data) => api.post(`/restaurants/${restaurantId}/menu`, data),
  updateItem: (id, data) => api.put(`/restaurants/menu/${id}`, data),
  deleteItem: (id) => api.delete(`/restaurants/menu/${id}`),
};

// ── Tables ────────────────────────────────────────────
export const tableAPI = {
  getTables: (restaurantId) => api.get(`/restaurants/${restaurantId}/tables`),
  addTable: (restaurantId, data) => api.post(`/restaurants/${restaurantId}/tables`, data),
  getAvailability: (tableId) => api.get(`/restaurants/tables/${tableId}/availability`),
  reserve: (availabilityId) => api.patch(`/restaurants/tables/availability/${availabilityId}/reserve`),
};

// ── Waiters ───────────────────────────────────────────
export const waiterAPI = {
  getWaiters: (restaurantId) => api.get(`/restaurants/${restaurantId}/waiters`),
  addWaiter: (restaurantId, data) => api.post(`/restaurants/${restaurantId}/waiters`, data),
  updateWaiter: (id, data) => api.put(`/restaurants/waiters/${id}`, data),
  deleteWaiter: (id) => api.delete(`/restaurants/waiters/${id}`),
};

// ── Orders ────────────────────────────────────────────
export const orderAPI = {
  getAll: () => api.get("/orders"),
  create: (data) => api.post("/orders/create", data),
};

export default api;
