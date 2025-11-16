import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-[#0b0b1b] text-white fixed w-full top-0 left-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-[#4fd1c5]">
              Silence Traders
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/student-dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1f1f2e]"
            >
              Dashboard
            </Link>
            {/* Removed Settings button */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
