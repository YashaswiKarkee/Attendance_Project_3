"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface Leave {
  id: number;
  employee_profile_picture: string;
  employee_first_name: string;
  employee_last_name: string;
  start_date: string;
  end_date: string;
  status: string;
  reason: string;
}

const AllLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    // Fetch all leaves
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/leaves/list-all-leaves/`
      )
      .then((response) => {
        setLeaves(response.data.data);
      })
      .catch((error) => {
        Swal.fire("Error", "Failed to load leaves", "error");
      });
  }, []);

  const handleApproveLeave = (leaveId: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to approve this leave request.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/leaves/${leaveId}/`,
            { status: "A" } // "A" stands for Approved
          )
          .then((response) => {
            Swal.fire("Approved", "Leave approved successfully", "success");

            // Update the leaves state with the correct status directly
            setLeaves((prevLeaves) =>
              prevLeaves.map((leave) =>
                leave.id === leaveId ? { ...leave, status: "A" } : leave
              )
            );
          })
          .catch((error) => {
            Swal.fire("Error", "Failed to approve leave", "error");
          });
      }
    });
  };

  const handleRejectLeave = (leaveId: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to reject this leave request.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/leaves/${leaveId}/`,
            { status: "R" } // "R" stands for Rejected
          )
          .then((response) => {
            Swal.fire("Rejected", "Leave rejected successfully", "success");

            // Update the leaves state with the correct status directly
            setLeaves((prevLeaves) =>
              prevLeaves.map((leave) =>
                leave.id === leaveId ? { ...leave, status: "R" } : leave
              )
            );
          })
          .catch((error) => {
            Swal.fire("Error", "Failed to reject leave", "error");
          });
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-black">All Leaves</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-gray-500">Employee</th>
            <th className="py-2 px-4 border-b text-gray-500">Start Date</th>
            <th className="py-2 px-4 border-b text-gray-500">End Date</th>
            <th className="py-2 px-4 border-b text-gray-500">Status</th>
            <th className="py-2 px-4 border-b text-gray-500">Reason</th>
            <th className="py-2 px-4 border-b text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b text-gray-500 flex items-center">
                <img
                  className="w-8 h-8 rounded-full mr-2"
                  src={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${leave.employee_profile_picture}`}
                  alt="profile_pic"
                />
                <span>
                  {leave.employee_first_name} {leave.employee_last_name}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-gray-500">
                {leave.start_date}
              </td>
              <td className="py-2 px-4 border-b text-gray-500">
                {leave.end_date}
              </td>
              <td className="py-2 px-4 border-b text-gray-500">
                {leave.status === "P"
                  ? "Pending"
                  : leave.status === "A"
                  ? "Approved"
                  : "Rejected"}
              </td>
              <td className="py-2 px-4 border-b text-gray-500">
                {leave.reason}
              </td>
              <td className="py-2 px-4 border-b text-gray-500">
                {leave.status === "P" ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveLeave(leave.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectLeave(leave.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                ) : leave.status === "A" ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRejectLeave(leave.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveLeave(leave.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllLeaves;
