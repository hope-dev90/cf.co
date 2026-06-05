import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Loader2, Store } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type UserRole = "client" | "restaurant_owner";

interface RoleOption {
  id: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "client",
    label: "Food Lover",
    description: "Order from your favorite restaurants",
    icon: <User className="w-6 h-6" />,
  },
  {
    id: "restaurant_owner",
    label: "Restaurant Owner",
    description: "List your restaurant and manage orders",
    icon: <Store className="w-6 h-6" />,
  },
];

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    try {
      await signUp(email, password, fullName, selectedRole);
      // After signup, redirect to verify email with email in state
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fef8f3]">
      {/* RIGHT */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-[#1a1a2e] text-white items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1200&fit=crop"
          alt="CF Company Welcome"
          className="w-full h-full object-cover"
        />
      </div>

      {/* LEFT */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2 text-[#00000b]">
            Join CF Company
          </h1>
          <p className="mb-6 text-gray-600">
            Create your account and get started
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* FULL NAME */}
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl"
              required
            />

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl"
              required
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className="p-4 rounded-xl border-2 transition-all text-center"
                  style={{
                    borderColor:
                      selectedRole === role.id ? "#e8722a" : "#e0e0e8",
                    backgroundColor:
                      selectedRole === role.id ? "#fff5f0" : "#f9f9fc",
                  }}
                >
                  <div
                    className="flex justify-center mb-3"
                    style={{
                      color: selectedRole === role.id ? "#e8722a" : "#4a4a68",
                    }}
                  >
                    {role.icon}
                  </div>
                  <h3 className="font-semibold mb-1 text-[#1a1a2e]">
                    {role.label}
                  </h3>
                  <p className="text-xs text-[#4a4a68]">{role.description}</p>
                </button>
              ))}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading || !selectedRole}
              className="w-full py-4 rounded-xl text-white font-semibold bg-[#1a1a2e] hover:bg-[#0f0f1e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* SOCIAL */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="border p-3 rounded-xl">Google</button>
            <button className="border p-3 rounded-xl">Apple</button>
          </div>

          {/* Sign in link */}
          <div className="text-center mt-6">
            <span className="text-[#4a4a68]">Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-[#1a1a2e] hover:text-[#e8722a] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
