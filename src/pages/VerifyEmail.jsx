import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const handleResend = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        alert("Verification email sent again! Check your inbox.");
      } else {
        alert("No user found. Please log in again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error sending verification email. Try again later.");
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center space-y-6">
      <h1 className="text-3xl font-semibold">Verify Your Email</h1>
      <p className="max-w-md">
        A verification link has been sent to your email. Please verify your
        account before logging in.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={handleResend}
          className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Resend Email
        </button>
        <button
          onClick={handleGoToLogin}
          className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
