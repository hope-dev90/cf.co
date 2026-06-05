import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Loader2, Store } from "lucide-react";
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

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    <div className="min-h-screen flex bg-white">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#faf5f0] to-[#f5ede4] overflow-hidden">
        <img
          src="/image.png"
          alt="CF Company Welcome"
          className="w-full h-full object-contain max-h-screen"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">
              Join CF Company,
            </h1>
            <p className="text-[#4a4a68]">
              Create your account and get started
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-base font-semibold text-[#1a1a2e] mb-3"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#e0e0e8] bg-[#f9f9fc] text-[#1a1a2e] placeholder-[#b0b0c8] transition-all focus:outline-none focus:border-[#e8722a] focus:bg-white"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-[#1a1a2e] mb-3"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#e0e0e8] bg-[#f9f9fc] text-[#1a1a2e] placeholder-[#b0b0c8] transition-all focus:outline-none focus:border-[#e8722a] focus:bg-white"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-[#1a1a2e] mb-3"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#e0e0e8] bg-[#f9f9fc] text-[#1a1a2e] placeholder-[#b0b0c8] transition-all focus:outline-none focus:border-[#e8722a] focus:bg-white"
                required
              />
              <p className="text-xs mt-2 text-[#4a4a68]">
                Must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-base font-semibold text-[#1a1a2e] mb-3"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#e0e0e8] bg-[#f9f9fc] text-[#1a1a2e] placeholder-[#b0b0c8] transition-all focus:outline-none focus:border-[#e8722a] focus:bg-white"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <label className="block text-base font-semibold text-[#1a1a2e] mb-4">
                I am a...
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {!selectedRole && (
                <p className="text-xs mt-2 text-red-600">
                  Please select a role to continue
                </p>
              )}
            </div>

            {/* Create Account button */}
            <button
              type="submit"
              disabled={loading || !selectedRole}
              className="w-full mt-8 py-3 rounded-lg bg-[#1a1a2e] hover:bg-[#0f0f1e] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e0e0e8]"></div>
          </div>

          {/* Sign in link */}
          <div className="text-center">
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
}
