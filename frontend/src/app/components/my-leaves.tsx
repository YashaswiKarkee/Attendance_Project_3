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
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [updatedReason, setUpdatedReason] = useState<string>("");

  useEffect(() => {
    // Fetch employee leaves
    axios
      .get(
        `${
          process.env.NEXT_PUBLIC_BACKEND_BASE_URL
        }/api/attendance/leaves/employee/${sessionStorage.getItem("id")}/`
      )
      .then((response) => {
        setLeaves(response.data.data);
      })
      .catch((error) => {
        Swal.fire("Error", "Failed to load leaves", "error");
      });
  }, []);

  const handleUpdateLeave = (leaveId: number) => {
    const leave = leaves.find((l) => l.id === leaveId);
    if (leave) {
      setSelectedLeave(leave);
      setUpdatedReason(leave.reason);
    }
  };

  const handleLeaveUpdate = () => {
    if (selectedLeave) {
      const updatedLeave = { ...selectedLeave, reason: updatedReason };
      axios
        .put(`/api/leaves/${selectedLeave.id}/`, updatedLeave)
        .then((response) => {
          Swal.fire("Success", "Leave updated successfully", "success");
          setLeaves(
            leaves.map((leave) =>
              leave.id === selectedLeave.id ? response.data : leave
            )
          );
          setSelectedLeave(null);
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to update leave", "error");
        });
    }
  };

  const handleDeleteLeave = (leaveId: number) => {
    axios
      .delete(`/api/leaves/${leaveId}/`)
      .then(() => {
        Swal.fire("Deleted", "Leave deleted successfully", "success");
        setLeaves(leaves.filter((leave) => leave.id !== leaveId));
      })
      .catch((error) => {
        Swal.fire("Error", "Failed to delete leave", "error");
      });
  };

  const handleApproveLeave = (leaveId: number) => {
    axios
      .put(`/api/leaves/${leaveId}/`, { status: "A" })
      .then((response) => {
        Swal.fire("Approved", "Leave approved successfully", "success");
        setLeaves(
          leaves.map((leave) => (leave.id === leaveId ? response.data : leave))
        );
      })
      .catch((error) => {
        Swal.fire("Error", "Failed to approve leave", "error");
      });
  };

  const handleRejectLeave = (leaveId: number) => {
    axios
      .put(`/api/leaves/${leaveId}/`, { status: "R" })
      .then((response) => {
        Swal.fire("Rejected", "Leave rejected successfully", "success");
        setLeaves(
          leaves.map((leave) => (leave.id === leaveId ? response.data : leave))
        );
      })
      .catch((error) => {
        Swal.fire("Error", "Failed to reject leave", "error");
      });
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
          {leaves.map((leave) => (
            <tr key={leave.id} className="hover:bg-gray-100">
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
              <td className="py-2 px-4 border-b text-gray-500 space-x-2">
                {leave.status === "P" && (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleApproveLeave(leave.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleRejectLeave(leave.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleUpdateLeave(leave.id)}
                >
                  Edit
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDeleteLeave(leave.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Leave */}
      {selectedLeave && (
        <div className="mt-4 p-4 border border-gray-200 rounded">
          <h3 className="text-xl mb-2">Update Leave</h3>
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-2"
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
