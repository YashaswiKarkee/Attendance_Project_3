"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface Leave {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
  reason: string;
}

const EmployeeLeaves: React.FC = () => {
  const [myId, setMyId] = useState<string | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [updatedReason, setUpdatedReason] = useState<string>("");

  useEffect(() => {
    const id = sessionStorage.getItem("id");
    setMyId(id);
  }, []);

  useEffect(() => {
    // Fetch employee leaves only when myId is populated
    if (myId) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/leaves/employee/${myId}`
        )
        .then((response) => {
          setLeaves(response.data);
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to load leaves", "error");
        });
    }
  }, [myId]);

  const handleUpdateLeave = (leaveId: number) => {
    const leave = leaves.find((l) => l.id === leaveId);
    if (leave) {
      setSelectedLeave(leave);
      setUpdatedReason(leave.reason);
    }
  };

  const handleLeaveUpdate = () => {
    if (selectedLeave) {
      const updatedLeave = { reason: updatedReason }; // Only send reason

      axios
        .patch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/leaves/${selectedLeave.id}/`,
          updatedLeave
        )
        .then((response) => {
          Swal.fire("Success", "Leave updated successfully", "success");

          // Update leaves state directly with the updated reason
          setLeaves((prevLeaves) =>
            prevLeaves.map((leave) =>
              leave.id === selectedLeave.id
                ? { ...leave, reason: updatedReason } // Apply updated reason
                : leave
            )
          );

          // Clear selection after update
          setSelectedLeave(null);
          setUpdatedReason("");
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to update leave", "error");
        });
    }
  };

  const handleDeleteLeave = (leaveId: number) => {
    axios
      .delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/leaves/${leaveId}/`
      )
      .then(() => {
        Swal.fire("Deleted", "Leave deleted successfully", "success");
        setLeaves(leaves.filter((leave) => leave.id !== leaveId));
      })
      .catch((error) => {
        Swal.fire("Error", "Failed to delete leave", "error");
      });
  };

  const handleCloseUpdateBox = () => {
    setSelectedLeave(null);
    setUpdatedReason("");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-black">
        Your Applied Leaves
      </h2>
      <table className="min-w-full bg-white border border-gray-200 mb-4">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-gray-700">Start Date</th>
            <th className="py-2 px-4 border-b text-gray-700">End Date</th>
            <th className="py-2 px-4 border-b text-gray-700">Status</th>
            <th className="py-2 px-4 border-b text-gray-700">Reason</th>
            <th className="py-2 px-4 border-b text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave, index) => (
            <tr key={index} className="hover:bg-gray-100">
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
              {leave.status === "A" ? (
                <td className="py-2 px-4 border-b text-gray-500">Accepted</td>
              ) : leave.status === "R" ? (
                <td className="py-2 px-4 border-b text-gray-500">Rejected</td>
              ) : (
                <td className="py-2 px-4 border-b text-gray-500 space-x-4">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => handleUpdateLeave(leave.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDeleteLeave(leave.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Leave */}
      {selectedLeave && (
        <div className="mt-4 p-4 border border-gray-200 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl text-gray-500">Update Leave</h3>
            <button
              className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
              onClick={handleCloseUpdateBox}
            >
              Close
            </button>
          </div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-2 text-gray-500"
            value={updatedReason}
            onChange={(e) => setUpdatedReason(e.target.value)}
            rows={4}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleLeaveUpdate}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;
