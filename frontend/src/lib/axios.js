import axios from "axios";
import Cookies from "js-cookie";

let csrfToken = null;
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = Cookies.get("XSRF-TOKEN");

    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (csrfToken && !safeMethods.includes(config.method?.toUpperCase())) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error("CSRF validation failed. Please refresh the page.");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
export { csrfToken };
