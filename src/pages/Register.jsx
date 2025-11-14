// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleSelector from "../components/RoleSelector";
import { auth, db } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Register() {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Redirect companies/institutions to registration request form
    if (role === "institution" || role === "company") {
      navigate("/company-institution-registration", {
        state: { role },
      });
      return;
    }

    // Password length check
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Set display name
      await updateProfile(user, { displayName: name });

      // 3. Send email verification
      await sendEmailVerification(user);

      // 4. Add extra info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        role: role,
        verifiedEmail: false,
        approved: true, // students auto approved
        createdAt: new Date(),
      });

      alert("Registration successful! Please check your email to verify your account.");
      navigate("/verify-email");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email is already registered. Please login.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-3xl font-semibold text-white mb-4">
        Create Account
      </h2>
      <form
        className="bg-[#121228] p-8 rounded-2xl shadow-md w-80"
        onSubmit={handleRegister}
      >
        <RoleSelector role={role} setRole={setRole} />
        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-4 px-4 py-2 rounded-md bg-[#181832] text-gray-200 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded-md bg-[#181832] text-gray-200 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-md bg-[#181832] text-gray-200 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}

export default Register;
