import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyEmail from "./pages/VerifyEmail";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf5f0]">
        <div className="w-8 h-8 border-4 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    const redirectMap: Record<string, string> = {
      client: "/dashboard",
      admin: "/admin",
      restaurateur: "/owner",
    };
    return <Navigate to={redirectMap[profile.role] || "/"} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf5f0]">
        <div className="w-8 h-8 border-4 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          user && profile ? (
            <Navigate
              to={
                profile.role === "admin"
                  ? "/admin"
                  : profile.role === "restaurateur"
                    ? "/owner"
                    : "/dashboard"
              }
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/signup"
        element={
          user && profile ? (
            <Navigate
              to={
                profile.role === "admin"
                  ? "/admin"
                  : profile.role === "restaurateur"
                    ? "/owner"
                    : "/dashboard"
              }
              replace
            />
          ) : (
            <SignupPage />
          )
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={["restaurateur"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
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
