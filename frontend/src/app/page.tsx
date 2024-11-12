// pages/index.tsx
import type { NextPage } from "next";
import Link from "next/link";

const HomePage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl text-center bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Attendance Management System with Facial Recognition
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          A modern solution to manage attendance with facial recognition
          technology. Track employee attendance, monitor entry and exit times,
          and generate insightful reports with ease.
        </p>
        <div className="grid md:grid-cols-3 gap-6 my-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-600">
              Effortless Tracking
            </h3>
            <p className="text-gray-600 mt-2">
              Automatically track attendance without manual intervention.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-xl font-semibold text-green-600">
              Secure Access
            </h3>
            <p className="text-gray-600 mt-2">
              Facial recognition ensures secure and accurate access control.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-600">
              Detailed Reports
            </h3>
            <p className="text-gray-600 mt-2">
              Get insights with comprehensive attendance reports.
            </p>
          </div>
        </div>
        <Link
          href="/auth/login"
          className="inline-block bg-blue-600 text-white text-lg font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
