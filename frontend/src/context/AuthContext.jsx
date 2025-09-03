import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, getCurrentUser, authCall } from "../api/api";

const AuthContext = createContext(null);
const API = "http://localhost:5000";

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("auth_token");
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
  }, [user, token]);

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const data = await getCurrentUser();

          if (data && data.success && data.user) {
            setUser(data.user);
          } else {
            // Token is invalid, clear auth data
            logout();
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const authenticatedFetch = async (path, options = {}) => {
    return authCall(path, options);
  };

  async function login(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        return { ok: false, error: "Email and password are required" };
      }

      if (!email.includes("@")) {
        return { ok: false, error: "Please enter a valid email address" };
      }

      const response = await loginUser(email.trim().toLowerCase(), password);
      if (response && response.success) {
        setUser(response.user);
        setToken(response.token);
        return { ok: true };
      } else {
        return {
          ok: false,
          error: data.error || "Login failed. Please check your credentials.",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        ok: false,
        error: "Network error. Please check your connection and try again.",
      };
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  }

  // Update registration to work with new backend
  async function register({ name, email, password }) {
    try {
      if (!name || !email || !password) {
        return { ok: false, error: "All fields are required" };
      }

      if (!email.includes("@")) {
        return { ok: false, error: "Please enter a valid email address" };
      }

      if (password.length < 6) {
        return {
          ok: false,
          error: "Password must be at least 6 characters long",
        };
      }

      const response = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response) {
        return {
          ok: true,
          message:
            "Registration submitted successfully. Please wait for admin approval.",
        };
      } else {
        return {
          ok: false,
          error: data.error || "Registration failed. Please try again.",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        ok: false,
        error: "Network error. Please check your connection and try again.",
      };
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    authenticatedFetch,
    isAuthenticated: !!(user && token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
