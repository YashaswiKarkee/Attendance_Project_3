// components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { ChartBarIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

interface DashboardProps {
  role: "Admin" | "Manager" | "Employee";
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar role={role} />
      <main className="flex-1 bg-gray-50">
        <div className="p-6 space-y-6">
          <section className="bg-white shadow-md rounded-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Attendance Summary
            </h3>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-green-100 p-4 rounded-md text-green-600">
                Present: 80%
              </div>
              <div className="bg-yellow-100 p-4 rounded-md text-yellow-600">
                On Leave: 10%
              </div>
              <div className="bg-red-100 p-4 rounded-md text-red-600">
                Absent: 10%
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white shadow-md rounded-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Quick Actions
            </h3>
            <div className="mt-4 flex space-x-4">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Mark Attendance
              </button>
              {role === "Manager" && (
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  Generate Report
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
