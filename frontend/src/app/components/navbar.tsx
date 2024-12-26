"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [profile_picture, setProfilePicture] = useState("");
  let id;
  useEffect(() => {
    id = sessionStorage.getItem("id");
    setProfilePicture(sessionStorage.getItem("profile_picture") || "");
    setUsername(sessionStorage.getItem("username") || "");
    setUrl(`http://localhost:8000${profile_picture}`);
    if (!id) {
      router.push("/unauthorized");
    }
  }, [id]);

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("first_name");
    sessionStorage.removeItem("last_name");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("last_name");
    router.push("/");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold hover:text-gray-200">
            Attendance Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <img
              src={
                profile_picture
                  ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${profile_picture}`
                  : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="User Avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />
            <p className="font-medium">{username}</p>
            <button
              onClick={handleLogout}
              className="hover:bg-blue-700 p-2 rounded-md flex items-center space-x-1 transition duration-300"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
