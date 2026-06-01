import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage.js/page";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AdminDashboard from "./pages/AdminDashbaord/admin";
import RestaurateurDashboard from "./pages/RestaurateurDashboard.js/res";
import MenuManagement from "./pages/RestaurateurDashboard.js/menu";
import OrdersDashboard from "./pages/RestaurateurDashboard.js/order";
import StaffManagement from "./pages/RestaurateurDashboard.js/staff";
import UserDashboard from "./pages/userDashbaord/user";
import UserHome from "./pages/userDashbaord/home";
import UserBookings from "./pages/userDashbaord/bookings";
import UserProfile from "./pages/userDashbaord/profile";

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/admin" element={
        <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
      } />

      <Route path="/restaurateur" element={
        <ProtectedRoute roles={["restaurateur", "admin"]}><RestaurateurDashboard /></ProtectedRoute>
      } />
      <Route path="/restaurateur/menu" element={
        <ProtectedRoute roles={["restaurateur", "admin"]}><MenuManagement /></ProtectedRoute>
      } />
      <Route path="/restaurateur/orders" element={
        <ProtectedRoute roles={["restaurateur", "admin"]}><OrdersDashboard /></ProtectedRoute>
      } />
      <Route path="/restaurateur/staff" element={
        <ProtectedRoute roles={["restaurateur", "admin"]}><StaffManagement /></ProtectedRoute>
      } />

      <Route path="/user" element={
        <ProtectedRoute roles={["client", "restaurateur", "admin"]}><UserHome /></ProtectedRoute>
      } />
      <Route path="/user/order" element={
        <ProtectedRoute roles={["client", "restaurateur", "admin"]}><UserDashboard /></ProtectedRoute>
      } />
      <Route path="/user/bookings" element={
        <ProtectedRoute roles={["client", "restaurateur", "admin"]}><UserBookings /></ProtectedRoute>
      } />
      <Route path="/user/profile" element={
        <ProtectedRoute roles={["client", "restaurateur", "admin"]}><UserProfile /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
