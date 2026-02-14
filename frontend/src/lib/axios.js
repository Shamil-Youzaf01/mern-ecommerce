import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "https://mern-ecommerce-1-fflp.onrender.com"
      : "/api",
  withCredentials: true, //send cookies the server
});

export default axiosInstance;
