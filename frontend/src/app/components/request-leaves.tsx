"use client";
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const RequestLeave: React.FC = () => {
  const id = sessionStorage.getItem("id");
  const [leave, setLeave] = useState({
    start_date: "",
    end_date: "",
    reason: "",
    employee: id,
  });

  const handleLeaveChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLeave({ ...leave, [e.target.name]: e.target.value });
  };

  const handleSubmitLeave = () => {
    axios
      .post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/leaves/`,
        leave
      )
      .then((response) => {
        console.log(response);
        Swal.fire("Success", "Leave requested successfully", "success");
        setLeave({ start_date: "", end_date: "", reason: "" });
      })
      .catch((error) => {
        console.error(error);
        Swal.fire("Error", "Failed to request leave", "error");
      });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-2xl font-bold text-black mb-4">Request Leave</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="start_date" className="block text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            id="start_date"
            className="w-full p-2 border border-gray-300 rounded text-gray-700"
            value={leave.start_date}
            onChange={handleLeaveChange}
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-gray-700">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            id="end_date"
            className="w-full p-2 border border-gray-300 rounded text-gray-700"
            value={leave.end_date}
            onChange={handleLeaveChange}
          />
        </div>
        <div>
          <label htmlFor="reason" className="block text-gray-700">
            Reason
          </label>
          <textarea
            name="reason"
            id="reason"
            className="w-full p-2 border border-gray-300 rounded text-gray-700"
            rows={4}
            value={leave.reason}
            onChange={handleLeaveChange}
          />
        </div>
        <button
          onClick={handleSubmitLeave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit Leave Request
        </button>
      </div>
    </div>
  );
};

export default RequestLeave;
