import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const GoogleLoginButton = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse) => {
    try {
      // Send the credential to backend
      const res = await axios.post("auth/google", {
        credential: credentialResponse.credential,
      });
      console.log("Login successful:", res.data);
      // Redirect or update user state
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
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
