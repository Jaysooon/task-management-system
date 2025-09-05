import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaTimes, FaUser, FaLock, FaSpinner } from "react-icons/fa";

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setEmail("");
      setPassword("");
      setErr("");
      setLoading(false);
      // Focus trap
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setMounted(false), 300);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    
    try {
      const res = await login(email, password);
      if (res.ok) {
        nav("/dashboard");
        onClose();
      } else {
        setErr(res.error || "Invalid credentials");
      }
    } catch (error) {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted && !isOpen) return null;

  return (
    <div 
      className={`animate-fade-in-up fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={handleBackdropClick}
    >
      <div className={`relative w-full max-w-md transform transition-all duration-300 ${
        isOpen ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'
      }`}>
        {/* Elegant card with subtle shadow and border */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800" />
          
          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Header with close button */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Sign in to your account
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                disabled={loading}
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-6">
              {/* Email field with icon */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaUser className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:placeholder-zinc-400"
                    placeholder="Enter your email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password field with icon */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaLock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:placeholder-zinc-400"
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Error message */}
              {err && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    // You can add logic to open register modal here
                  }}
                  className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}