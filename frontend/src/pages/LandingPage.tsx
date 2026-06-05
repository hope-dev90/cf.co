import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Search,
  ShoppingCart,
  Bike,
  Star,
  ArrowRight,
  Menu,
  X,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface NavLinkProps {
  href: string;
  label: string;
}

interface RestaurantCard {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
}

interface TestimonialCard {
  id: number;
  quote: string;
  name: string;
  role: string;
  initial: string;
}

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: NavLinkProps[] = [
    { href: "#restaurants", label: "Restaurants" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#about", label: "About" },
  ];

  const restaurants: RestaurantCard[] = [
    {
      id: 1,
      name: "The Gourmet Kitchen",
      cuisine: "Modern European",
      rating: 4.8,
      image:
        "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 2,
      name: "Spice Haven",
      cuisine: "Indian & Asian",
      rating: 4.7,
      image:
        "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 3,
      name: "La Pasta House",
      cuisine: "Italian",
      rating: 4.9,
      image:
        "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 4,
      name: "Flame & Co",
      cuisine: "Grilled & BBQ",
      rating: 4.6,
      image:
        "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  const testimonials: TestimonialCard[] = [
    {
      id: 1,
      quote:
        "CF Company has completely changed how I order food. The selection is incredible and delivery is always on time. It's now my go-to app!",
      name: "Sarah Mitchell",
      role: "Food Enthusiast",
      initial: "S",
    },
    {
      id: 2,
      quote:
        "As a restaurant owner, partnering with CF Company has significantly boosted our orders and customer reach. The platform is intuitive and reliable.",
      name: "James Chen",
      role: "Restaurant Owner",
      initial: "J",
    },
    {
      id: 3,
      quote:
        "The variety of cuisines available is amazing. I love discovering new restaurants and my favorite dishes are always just a few taps away.",
      name: "Emma Rodriguez",
      role: "Regular Customer",
      initial: "E",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg" : "bg-white"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="CF Company" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-[#1a1a2e] hidden sm:block">
                CF Company
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[#4a4a68] hover:text-[#e8722a] font-medium transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth Buttons & Mobile Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-3">
                {user ? (
                  <>
                    <span className="text-sm text-[#4a4a68] py-2 px-4">
                      {user.email}
                    </span>
                    <Link
                      to="/dashboard"
                      className="px-6 py-2 bg-[#e8722a] hover:bg-[#d4631f] text-white font-medium rounded-lg transition-colors duration-300"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-6 py-2 text-[#e8722a] hover:text-[#d4631f] font-medium transition-colors duration-300 border border-[#e8722a] rounded-lg hover:bg-red-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-6 py-2 bg-[#e8722a] hover:bg-[#d4631f] text-white font-medium rounded-lg transition-colors duration-300"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={24} className="text-[#1a1a2e]" />
                ) : (
                  <Menu size={24} className="text-[#1a1a2e]" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100">
              <div className="flex flex-col gap-2 pt-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-[#4a4a68] hover:bg-[#faf5f0] rounded-lg transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex gap-2 pt-2">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="flex-1 px-4 py-2 bg-[#e8722a] hover:bg-[#d4631f] text-white font-medium rounded-lg transition-colors duration-300 text-center"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex-1 px-4 py-2 text-[#e8722a] font-medium border border-[#e8722a] rounded-lg hover:bg-red-50 transition-colors duration-300 text-center"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="flex-1 px-4 py-2 bg-[#e8722a] hover:bg-[#d4631f] text-white font-medium rounded-lg transition-colors duration-300 text-center"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-[#faf5f0] via-white to-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a2e] leading-tight">
                  Delicious Food, Delivered Fast
                </h1>
                <p className="text-lg md:text-xl text-[#4a4a68] leading-relaxed">
                  Connect with your favorite restaurants and discover new
                  culinary experiences. Fresh meals delivered to your doorstep
                  in minutes.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-[#e8722a] hover:bg-[#d4631f] text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Get Started
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/restaurants"
                  className="px-8 py-4 border-2 border-[#e8722a] text-[#e8722a] hover:bg-red-50 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Browse Restaurants
                </Link>
              </div>

              {/* Stats Preview */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-[#e8722a]">500+</p>
                  <p className="text-sm text-[#4a4a68] font-medium">
                    Partner Restaurants
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#e8722a]">50K+</p>
                  <p className="text-sm text-[#4a4a68] font-medium">
                    Orders Delivered
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#e8722a]">4.8/5</p>
                  <p className="text-sm text-[#4a4a68] font-medium">
                    Average Rating
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-96 md:h-full rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Delicious food delivery"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#4a4a68] max-w-2xl mx-auto">
              Three simple steps to get your favorite food delivered to you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-[#faf5f0] rounded-xl p-8 h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e8722a] to-[#d4631f] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">
                  Browse Restaurants
                </h3>
                <p className="text-[#4a4a68] leading-relaxed">
                  Explore hundreds of restaurants in your area. Filter by
                  cuisine, rating, delivery time, and more to find exactly what
                  you crave.
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute -right-6 top-1/2 w-12 h-1 bg-gradient-to-r from-[#e8722a] to-transparent transform translate-y-1/2" />
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-[#faf5f0] rounded-xl p-8 h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e8722a] to-[#d4631f] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">
                  Place Your Order
                </h3>
                <p className="text-[#4a4a68] leading-relaxed">
                  Customize your meal to your preferences. Add special
                  instructions, choose your favorite items, and pay securely in
                  seconds.
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute -right-6 top-1/2 w-12 h-1 bg-gradient-to-r from-[#e8722a] to-transparent transform translate-y-1/2" />
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-[#faf5f0] rounded-xl p-8 h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e8722a] to-[#d4631f] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bike size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">
                  Enjoy Delivery
                </h3>
                <p className="text-[#4a4a68] leading-relaxed">
                  Track your order in real-time and receive hot, fresh food
                  delivered quickly. Sit back, relax, and enjoy your meal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section id="restaurants" className="py-24 bg-[#faf5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-4">
                Featured Restaurants
              </h2>
              <p className="text-lg text-[#4a4a68]">
                Discover some of our most popular partners
              </p>
            </div>
            <Link
              to="/restaurants"
              className="hidden md:flex items-center gap-2 px-6 py-3 text-[#e8722a] hover:text-[#d4631f] font-bold transition-colors duration-300 group"
            >
              View All
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/20 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-1 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-[#4a4a68] mb-4">
                    {restaurant.cuisine}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.floor(restaurant.rating)
                              ? "fill-[#e8722a] text-[#e8722a]"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-[#1a1a2e]">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex md:hidden justify-center pt-12">
            <Link
              to="/restaurants"
              className="px-8 py-3 bg-[#e8722a] hover:bg-[#d4631f] text-white font-bold rounded-lg transition-colors duration-300 flex items-center gap-2"
            >
              View All Restaurants
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Stat 1 */}
            <div className="text-center space-y-2">
              <p className="text-5xl md:text-6xl font-bold text-[#e8722a]">
                500+
              </p>
              <p className="text-xl text-gray-300 font-medium">Restaurants</p>
              <p className="text-sm text-gray-400">
                Partner restaurants in your city
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center space-y-2">
              <p className="text-5xl md:text-6xl font-bold text-[#e8722a]">
                10K+
              </p>
              <p className="text-xl text-gray-300 font-medium">
                Happy Customers
              </p>
              <p className="text-sm text-gray-400">
                Satisfied users trusting CF Company
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center space-y-2">
              <p className="text-5xl md:text-6xl font-bold text-[#e8722a]">
                50K+
              </p>
              <p className="text-xl text-gray-300 font-medium">
                Orders Delivered
              </p>
              <p className="text-sm text-gray-400">
                Successful deliveries completed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-[#4a4a68] max-w-2xl mx-auto">
              Join thousands of happy customers who trust CF Company for their
              daily meals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-[#faf5f0] rounded-xl p-8 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#e8722a] transform hover:-translate-y-2"
              >
                {/* Quote */}
                <p className="text-lg text-[#4a4a68] mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#e8722a] to-[#d4631f] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {testimonial.initial}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a2e]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[#4a4a68]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#e8722a] to-[#d4631f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Order?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover amazing restaurants and get your favorite meals delivered
            hot and fresh. Sign up today and enjoy special offers on your first
            order!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-[#e8722a] hover:bg-gray-50 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/restaurants"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white/10 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="CF Company" className="h-8 w-auto" />
                <span className="text-2xl font-bold text-white">
                  CF Company
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting food lovers with amazing restaurants. Fresh, fast,
                and delicious.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#about"
                    className="hover:text-[#e8722a] transition-colors duration-300"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#e8722a] transition-colors duration-300"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#e8722a] transition-colors duration-300"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#e8722a] transition-colors duration-300"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#e8722a] transition-colors duration-300"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#e8722a] transition-colors duration-300"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#e8722a] transition-colors duration-300"
                  >
                    Safety
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#e8722a] transition-colors duration-300"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-[#e8722a] rounded-lg flex items-center justify-center transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-[#e8722a] rounded-lg flex items-center justify-center transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-[#e8722a] rounded-lg flex items-center justify-center transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>&copy; 2024 CF Company. All rights reserved.</p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="hover:text-[#e8722a] transition-colors duration-300"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="hover:text-[#e8722a] transition-colors duration-300"
                >
                  Terms & Conditions
                </a>
                <a
                  href="#"
                  className="hover:text-[#e8722a] transition-colors duration-300"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
