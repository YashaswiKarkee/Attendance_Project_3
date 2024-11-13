"use client";
import { useRouter } from "next/navigation";
import React from "react";

const UnauthorizedComponent = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/"); // Redirect to the home page or login page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl text-center">
        <div className="mb-6">
          <svg
            className="w-24 h-24 text-red-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 12H6M12 6v12"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page. Please contact your
          administrator or go back to the homepage.
        </p>
        <button
          onClick={handleRedirect}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedComponent;
