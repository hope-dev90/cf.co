import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signIn(email, password);
      // Redirect will be handled by App.tsx through auth state
      navigate(email === "owner@example.com" ? "/owner" : "/dashboard");
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
            <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">Welcome,</h1>
            <p className="text-[#4a4a68]">Sign in to your CF Company account</p>
          </div>

          {/* Demo Info */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Demo Accounts:</p>
            <p className="text-xs text-blue-600 mt-1">
              Food Lover: user@example.com
            </p>
            <p className="text-xs text-blue-600">Owner: owner@example.com</p>
            <p className="text-xs text-blue-600">Password: password123</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
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
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 rounded-lg bg-[#1a1a2e] hover:bg-[#0f0f1e] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Signing in..." : "Signup"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e0e0e8]"></div>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <span className="text-[#4a4a68]">Don't have an account? </span>
            <Link
              to="/signup"
              className="font-semibold text-[#1a1a2e] hover:text-[#e8722a] transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
