import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signIn(email, password);

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
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2 text-[#00000b]">Welcome</h1>
          <p className="mb-6 text-gray-600">
            Sign in to your CF Company account
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-semibold bg-[#1a1a2e] hover:bg-[#0f0f1e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign in"}
            </button>
          </form>

          {/* SOCIAL */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="border p-3 rounded-xl">Google</button>
            <button className="border p-3 rounded-xl">Apple</button>
          </div>

          {/* Sign up link */}
          <div className="text-center mt-6">
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
};

export default LoginPage;
