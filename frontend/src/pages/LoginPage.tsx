import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

// Check if Google login is enabled
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const IS_GOOGLE_ENABLED =
  GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID");

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading, googleSignIn } = useAuth();

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

  const handleGoogleSuccess = async (response: any) => {
    try {
      await googleSignIn(response.credential);
      navigate("/dashboard");
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  const handleAppleLogin = () => {
    alert("Apple login is coming soon!");
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

          {/* Divider and Social Buttons - only shown if at least one social option is available */}
          {IS_GOOGLE_ENABLED && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">or continue with</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {IS_GOOGLE_ENABLED && (
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="filled_blue"
                      shape="pill"
                    />
                  </div>
                )}
                <button
                  onClick={handleAppleLogin}
                  className="border p-3 rounded-xl flex items-center justify-center gap-2 font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.153-1.659 1.648-3.744 1.658-3.788-.013-.005-3.158-1.199-3.186-4.759-.028-3.536 3.08-4.394 3.146-4.424-1.824-2.463-4.466-2.588-4.546-2.596zm-.786-2.876c1.03-1.23 1.738-2.942 1.567-4.688-.037-.325-.066-.632-.066-.908 0-.153.027-.278.037-.403.004-.047.013-.094.026-.142.028-.108.074-.217.124-.317.074-.148.166-.29.278-.419.096-.108.193-.213.304-.31.118-.102.247-.199.39-.292.154-.1.321-.186.5-.256.372-.147.785-.179 1.189-.159.37.018.734.093 1.077.225l.083.033c.184.077.357.177.513.302.138.11.262.238.364.38.106.145.194.301.262.467.054.134.092.275.114.418.022.141.025.285.01.426-.136 1.755-.907 3.375-1.992 4.517-.086.091-.175.178-.266.26-.185.168-.396.313-.621.43-.232.12-.478.206-.732.254-.269.05-.543.055-.816.012-.273-.043-.535-.13-.776-.26-.243-.131-.464-.31-.658-.532-.206-.234-.374-.507-.496-.812a3.01 3.01 0 0 1-.21-.722c-.022-.118-.027-.24-.015-.361.024-.24.083-.472.172-.688.087-.212.205-.407.35-.58.15-.174.329-.319.529-.426.204-.109.429-.183.667-.219.225-.034.452-.025.675.027.23.054.447.152.64.289z" />
                  </svg>
                  Apple
                </button>
              </div>
            </>
          )}

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
