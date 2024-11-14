"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  UserIcon,
  ClockIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

const Sidebar: React.FC = () => {
  const [newNotifications, setNewNotifications] = useState<Boolean>(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [role, setRole] = React.useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("id");
    setRole(sessionStorage.getItem("role"));
    setMyId(id);
  }, []);

  useEffect(() => {
    if (myId) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/notification/get-notification/receiver/${myId}`
        )
        .then((response) => {
          if (
            response.data.data.some(
              (notification: any) => !notification.is_read
            )
          ) {
            setNewNotifications(true); // Set to true if there are unread notifications
          }
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to load notifications", "error");
        });
    }
  }, [myId, newNotifications]);

  return (
    <aside className="bg-gray-100 w-64 p-6 border-r border-gray-300">
      <ul className="space-y-4">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <ChartBarIcon className="h-6 w-6" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/chat"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
            <span>Chat</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/my-leaves"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <UserIcon className="h-6 w-6" />
            <span>My Leaves</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/request-leaves"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
            <span>Request for Leaves</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/notifications"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <BellAlertIcon className="h-6 w-6" />
            <span>Notifications</span>
            {newNotifications && (
              <span className="ml-2 h-2 w-2 rounded-full bg-red-500"></span>
            )}
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
          <>
            <li>
              <Link
                href="/team-attendance"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <ClockIcon className="h-6 w-6" />
                <span>Team Attendance</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/all-leaves"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <ClockIcon className="h-6 w-6" />
                <span>All Leaves</span>
              </Link>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
