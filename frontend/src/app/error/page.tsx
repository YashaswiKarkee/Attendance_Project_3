// app/error/page.tsx
import React from "react";
import Link from "next/link";

const ErrorPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Error Occurred</h1>
      <p className="text-lg mb-6">Sorry, an unexpected error has occurred.</p>
      <Link
        href="/"
        className="text-blue-500 hover:underline bg-blue-100 py-2 px-4 rounded-md"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default ErrorPage;
