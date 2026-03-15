import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "./lib/axios.js";
import { BrowserRouter } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
function Main() {
  const [csrfReady, setCsrfReady] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await axios.get("/csrf-token");
        setCsrfReady(true);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
        setCsrfReady(true);
      }
    };
    fetchCsrfToken();
  }, []);

  if (!csrfReady) {
    return null;
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);
