import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuthCookies,
} from "./cookies";
import { toast } from "react-hot-toast";

// Create axios instance with default config
const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || "https://mzas.site/api",
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for cookie handling
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to invalid token
    const isTokenError =
      error.response?.status === 401 ||
      error.response?.data?.detail ===
        "Given token not valid for any token type" ||
      error.response?.data?.code === "token_not_valid" ||
      error.response?.data?.detail?.toLowerCase().includes("token");

    if (isTokenError && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, clear auth and reject
        clearAuthCookies();
        processQueue(new Error("No refresh token available"), null);
        isRefreshing = false;

        // Only show toast if we're not on login page
        if (!window.location.pathname.includes("/login")) {
          toast.error("Session expired. Please login again.");
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }

        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint with ngrok header
        const response = await axios.post(
          `${
            // import.meta.env.VITE_API_URL || "https://mzas.site/api"
            import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
          }/auth/refresh/`,
          { refresh: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          },
        );

        const { access, refresh } = response.data;

        if (!access) {
          throw new Error("No access token received from refresh endpoint");
        }

        // Store new tokens in cookies
        setAccessToken(access);
        if (refresh) {
          setRefreshToken(refresh);
        }

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Process queued requests
        processQueue(null, access);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthCookies();
        processQueue(refreshError, null);
        isRefreshing = false;

        // Show user-friendly message
        if (!window.location.pathname.includes("/login")) {
          toast.error("Session expired. Please login again.");
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other common errors
    if (error.response?.status === 403) {
      toast.error(
        "Access denied. You don't have permission to perform this action.",
      );
    }

    if (error.response?.status === 404) {
      toast.error("Resource not found.");
    }

    if (error.response?.status >= 500) {
      toast.error("Server error occurred. Please try again later.");
    }

    // Handle network errors
    if (!error.response) {
      if (error.message.includes("Network Error")) {
        toast.error(
          "Network error. Please check your connection and try again.",
        );
      }
    }

    return Promise.reject(error);
  },
);

// Helper functions for common API operations
export const apiHelpers = {
  // Login function that properly stores tokens
  login: async (credentials: {
    email?: string;
    username?: string;
    password: string;
  }) => {
    try {
      const response = await api.post("/auth/login/", credentials);
      const { access, refresh } = response.data;

      if (access && refresh) {
        setAccessToken(access);
        setRefreshToken(refresh);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout function that clears tokens
  logout: async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        // Call logout endpoint if it exists
        await api
          .post("/auth/logout/", { refresh: refreshToken })
          .catch(() => {});
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local tokens
      clearAuthCookies();
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAccessToken();
    return Boolean(token);
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/user/");
      return response.data;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  },
};

// Export the configured axios instance
export default api;
