// app/components/UserList.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_picture?: string;
  date_joined: string;
  last_login?: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [user_id, setID] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const USERS_PER_PAGE = 10;

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("id");
    console.log(storedUserId);
    if (storedUserId) {
      setID(parseInt(storedUserId, 10));
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/list?page=${currentPage}&page_size=${USERS_PER_PAGE}`
        );
        const data = await response.json();
        setUsers(data.results);
        setTotalPages(Math.ceil(data.count / USERS_PER_PAGE)); // Set total pages from API response
      } catch (error) {
        console.error("Error fetching users:", error);
        router.push("/error");
      }
    };

    fetchUsers();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">All Users</h2>
      <div className="bg-white shadow-md rounded-md p-4 space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center p-4 border border-gray-200 rounded-md"
          >
            <h1 className="text-black">
              {user_id} + {user.id}
            </h1>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-gray-300">@{user.email}</p>
            </div>
            <Link
              href={`http://localhost:8000/api/chat/room/${user_id}/${user.id}/`}
            >
              <p className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Chat
              </p>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center items-center space-x-4">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserList;
