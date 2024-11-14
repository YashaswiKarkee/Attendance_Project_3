"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface Leave {
  id: number;
  employee: {
    username: string;
  };
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
          .put(`/api/leaves/${leaveId}/`, { status: "A" })
          .then((response) => {
            Swal.fire("Approved", "Leave approved successfully", "success");
            setLeaves(
              leaves.map((leave) =>
                leave.id === leaveId ? response.data : leave
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
          .put(`/api/leaves/${leaveId}/`, { status: "R" })
          .then((response) => {
            Swal.fire("Rejected", "Leave rejected successfully", "success");
            setLeaves(
              leaves.map((leave) =>
                leave.id === leaveId ? response.data : leave
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
          {leaves.map((leave) => (
            <tr key={leave.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b text-gray-500">
                {leave.employee.username}
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
                {leave.status === "P" && (
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
