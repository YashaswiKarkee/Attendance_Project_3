"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface Notification {
  id: number;
  content: string;
  is_read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("id");
    setMyId(id);
  }, []);

  useEffect(() => {
    if (myId) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/notification/get-notification/receiver/${myId}`
        )
        .then((response) => {
          const newNotifications = response.data.data;
          setNotifications(newNotifications);
          setLoading(false);

          // Filter new unread notifications
          const unreadNotifications = newNotifications.filter(
            (notification: Notification) => !notification.is_read
          );

          // If there are unread notifications, show them in a popup
          if (unreadNotifications.length > 0) {
            showNotificationsSequentially(unreadNotifications);
          }
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to load notifications", "error");
          setLoading(false);
        });
    }
  }, [myId]);

  // Function to show notifications sequentially
  const showNotificationsSequentially = async (
    unreadNotifications: Notification[]
  ) => {
    for (let i = 0; i < unreadNotifications.length; i++) {
      const notification = unreadNotifications[i];

      // Show SweetAlert2 popup
      await Swal.fire({
        title: "New Notification",
        text: notification.content,
        icon: "info",
        confirmButtonText: "OK",
        preConfirm: () => {
          // Mark as read once the user clicks "OK"
          markAsRead(notification.id);
        },
      });
    }
  };

  const markAsRead = (notificationId: number) => {
    axios
      .patch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/notification/get-notification/${notificationId}/`,
        { is_read: true }
      )
      .then(() => {
        // Update the specific notification to mark it as read without resetting the entire notifications array
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
      })
      .catch(() => {
        Swal.fire("Error", "Failed to mark notification as read", "error");
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-black">Notifications</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        <div>
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-4 mb-2 border rounded-lg ${
                notification.is_read ? "bg-gray-100" : "bg-white"
              }`}
            >
              <p className="text-gray-500">
                {notification.content}
                {!notification.is_read && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                    New
                  </span>
                )}
              </p>
              <div className="mt-2 flex justify-end">
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
