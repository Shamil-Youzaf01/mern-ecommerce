import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
  // Set your Render backend URL here for production
  // e.g., https://your-backend.onrender.com
  envPrefix: "VITE_",
});
