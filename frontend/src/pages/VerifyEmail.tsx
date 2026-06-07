import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authApi } from "../lib/api";

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get email from navigation state
  const email = location.state?.email || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.verifyEmail(email, otp);
      navigate("/login", { state: { email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email is missing. Go back to sign up and try again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await authApi.resendOtp(email);
      alert(result.message || "Verification code resent!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fef8f3]">
      {/* RIGHT */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-[#1a1a2e] text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1200&fit=crop"
          alt="CF Company Welcome"
          className="w-full h-full object-cover"
        />
      </div>

      {/* LEFT */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1a1a2e] mb-6 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back Home
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-[#00000b]">
            Verify your email
          </h1>
          <p className="mb-6 text-gray-600">
            We sent a verification code to {email}
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            {/* OTP */}
            <input
              type="text"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-semibold bg-[#1a1a2e] hover:bg-[#0f0f1e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Verify email"}
            </button>
          </form>

          {/* Resend code */}
          <div className="text-center mt-6">
            <p className="text-[#4a4a68]">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                className="font-semibold text-[#1a1a2e] hover:text-[#e8722a] transition-colors"
              >
                Resend code
              </button>
            </p>
          </div>

          {/* Back to login */}
          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
