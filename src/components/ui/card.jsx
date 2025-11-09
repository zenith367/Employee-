import React from "react";

export const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-700 transition ${className}`}
  >
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="text-white text-lg">{children}</div>
);
