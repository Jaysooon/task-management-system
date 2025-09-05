import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaTimes, FaUser, FaEnvelope, FaLock, FaSpinner, FaCheckCircle } from "react-icons/fa";

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setForm({ name: "", email: "", password: "" });
      setSent(false);
      setErr("");
      setLoading(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setMounted(false), 300);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Password strength checker
  useEffect(() => {
    const password = form.password;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    setPasswordStrength(strength);
  }, [form.password]);

  async function submit(e) {
    e.preventDefault();
    
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setErr("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      setErr("Password must be at least 6 characters long");
      return;
    }

    if (!form.email.includes('@')) {
      setErr("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const response = await register(form);
      if (response && response.ok) {
        setSent(true);
      } else {
        setErr(response?.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      setErr("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
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
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800" />
          
          <div className="relative z-10 p-8">
            {sent ? (
              /* Success State */
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <FaCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Registration Submitted!
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  Your account is pending admin approval. You'll be notified once approved.
                </p>
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 px-4 text-white font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Registration Form */
              <>
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      Create Account
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Join our task management platform
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

                <form onSubmit={submit} className="space-y-6">
                  {/* Name field */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaUser className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:placeholder-zinc-400"
                        placeholder="Enter your full name"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaEnvelope className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:placeholder-zinc-400"
                        placeholder="Enter your email"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Password field with strength indicator */}
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
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:placeholder-zinc-400"
                        placeholder="Create a strong password"
                        disabled={loading}
                        required
                        minLength={6}
                      />
                    </div>
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 dark:text-zinc-400">Password strength:</span>
                          <span className={`font-medium ${
                            passwordStrength <= 2 ? 'text-red-600' : 
                            passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="mt-1 h-2 bg-zinc-200 rounded-full dark:bg-zinc-700">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
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
                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSwitchToLogin?.();
                      }}
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}