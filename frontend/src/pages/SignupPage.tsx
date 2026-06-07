import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Loader2,
  Store,
  Clock,
  MapPin,
  Phone,
  ChefHat,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";

// Check if Google login is enabled
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const IS_GOOGLE_ENABLED =
  GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID");

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

// Days of week for operating hours
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface OperatingHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading, googleSignIn } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState("");

  // Restaurant details state
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantDescription, setRestaurantDescription] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>(
    DAYS.map((day) => ({
      day,
      isOpen: true,
      openTime: "09:00",
      closeTime: "22:00",
    })),
  );

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
      const restaurantData = selectedRole === "restaurant_owner" 
        ? { 
            restaurantName,
            restaurantDescription, 
            restaurantPhone, 
            cuisineType, 
            address, 
            city, 
            operatingHours 
          } 
        : null;
      
      const result = await signUp(email, password, fullName, selectedRole, restaurantData);

      if (result.message.toLowerCase().includes("sign in now")) {
        navigate("/login", { state: { email } });
        return;
      }

      navigate("/verify-email", { state: { email } });
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
      await googleSignIn(response.credential, selectedRole || undefined);
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
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-[#1a1a2e] text-white items-center justify-center overflow-hidden p-8">
        <img
          src="https://i.pinimg.com/736x/b1/8a/84/b18a84834c9fd0373ae6b92a08214130.jpg"
          alt="CF Company Welcome"
          className="max-h-[80vh] w-auto rounded-3xl object-cover shadow-2xl"
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

            {/* Restaurant Details Form - Only shown if restaurant_owner is selected */}
            {selectedRole === "restaurant_owner" && (
              <div className="mt-6 space-y-4 p-6 bg-[#faf5f0] rounded-xl border border-[#e8722a]/30">
                <h2 className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-[#e8722a]" />
                  Your Restaurant Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[#1a1a2e]">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g., The Bistro Hub"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#e8722a] outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[#1a1a2e]">
                      Cuisine Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      placeholder="e.g., Italian, Mexican, Fusion"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#e8722a] outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[#1a1a2e]">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={restaurantPhone}
                      onChange={(e) => setRestaurantPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#e8722a] outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[#1a1a2e]">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your City"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#e8722a] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#1a1a2e]">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street, Suite 100"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#e8722a] outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#1a1a2e]">
                    Description
                  </label>
                  <textarea
                    value={restaurantDescription}
                    onChange={(e) => setRestaurantDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell us about your restaurant..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#e8722a] outline-none"
                  />
                </div>

                {/* Operating Hours */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Operating Hours
                  </label>
                  <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-200">
                    {operatingHours.map((day, index) => (
                      <div
                        key={day.day}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={day.isOpen}
                              onChange={() => {
                                setOperatingHours((prev) =>
                                  prev.map((d, i) =>
                                    i === index
                                      ? { ...d, isOpen: !d.isOpen }
                                      : d,
                                  ),
                                );
                              }}
                              className="w-4 h-4 accent-[#e8722a]"
                            />
                            <span className="text-sm font-medium text-[#1a1a2e]">
                              {day.day}
                            </span>
                          </div>
                        </div>
                        {day.isOpen && (
                          <>
                            <div className="col-span-4">
                              <input
                                type="time"
                                value={day.openTime}
                                onChange={(e) =>
                                  setOperatingHours((prev) =>
                                    prev.map((d, i) =>
                                      i === index
                                        ? { ...d, openTime: e.target.value }
                                        : d,
                                    ),
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div className="col-span-1 flex items-center justify-center text-gray-400">
                              -
                            </div>
                            <div className="col-span-4">
                              <input
                                type="time"
                                value={day.closeTime}
                                onChange={(e) =>
                                  setOperatingHours((prev) =>
                                    prev.map((d, i) =>
                                      i === index
                                        ? { ...d, closeTime: e.target.value }
                                        : d,
                                    ),
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </>
                        )}
                        {!day.isOpen && (
                          <div className="col-span-9 text-sm text-gray-400 italic">
                            Closed
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
