import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '../lib/api';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state if available
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !otp) {
      setError('Please enter your email and OTP');
      return;
    }
    
    try {
      setLoading(true);
      await authApi.verifyEmail(email, otp);
      setSuccess('Email verified successfully!');
      
      // After a short delay, redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#faf5f0] to-[#f5ede4]">
        <img
          src="/image.png"
          alt="CF Company Welcome"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-[#4a4a68] hover:text-[#e8722a] mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Login
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2">Verify Email</h1>
            <p className="text-[#4a4a68]">Enter the OTP sent to your email</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-[#1a1a2e] mb-3">
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

            {/* OTP */}
            <div>
              <label htmlFor="otp" className="block text-base font-semibold text-[#1a1a2e] mb-3">
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#e0e0e8] bg-[#f9f9fc] text-[#1a1a2e] placeholder-[#b0b0c8] transition-all focus:outline-none focus:border-[#e8722a] focus:bg-white text-center text-2xl tracking-widest"
                required
              />
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 rounded-lg bg-[#1a1a2e] hover:bg-[#0f0f1e] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
