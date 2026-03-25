import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useRef, useState, useEffect } from "react";

const GoogleLoginButton = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setButtonWidth(Math.floor(entry.contentRect.width));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("auth/google", {
        credential: credentialResponse.credential,
      });
      console.log("Login successful:", res.data);
      window.location.href = "/";
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Google login failed. Please try again.",
      );
    }
  };

  const handleError = () => {
    console.log("Google Login Failed");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div ref={containerRef} style={{ width: "100%" }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          size="large"
          theme="outline"
          text="signin_with"
          width={buttonWidth}
          useOneTap={false}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
