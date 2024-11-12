// components/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { UserIcon, ClockIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  role: "Admin" | "Manager" | "Employee";
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  return (
    <aside className="bg-gray-100 w-64 p-6 border-r border-gray-300">
      <ul className="space-y-4">
        <li>
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <ChartBarIcon className="h-6 w-6" />
            <span>Dashboard</span>
          </Link>
        </li>
        {role === "Admin" && (
          <li>
            <Link
              href="/manage-users"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
            >
              <UserIcon className="h-6 w-6" />
              <span>Manage Users</span>
            </Link>
          </li>
        )}
        {role === "Manager" && (
          <li>
            <Link
              href="/team-attendance"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
            >
              <ClockIcon className="h-6 w-6" />
              <span>Team Attendance</span>
            </Link>
          </li>
        )}
        {role === "Employee" && (
          <li>
            <Link
              href="/my-attendance"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
            >
              <ClockIcon className="h-6 w-6" />
              <span>My Attendance</span>
            </Link>
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
