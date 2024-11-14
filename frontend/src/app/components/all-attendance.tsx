"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment"; // For date manipulations like filtering by day, month, year, week

const AllAttendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]); // Store all attendance data
  const [filteredAttendanceData, setFilteredAttendanceData] = useState<any[]>(
    []
  ); // Store filtered attendance data
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    onLeave: 0,
    absent: 0,
    late: 0,
  });
  const [selection, setSelection] = useState("all"); // Default to show all attendance
  const [page, setPage] = useState(1); // Pagination page
  const [totalPages, setTotalPages] = useState(1); // Total pages from API
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState<string | null>(null); // Handle error state

  // Fetch all attendance data from backend
  const fetchAttendance = async () => {
    setLoading(true);
    setError(null); // Reset error on new fetch

    try {
      const url = `http://localhost:8000/api/attendance/get-attendance/`;
      const response = await axios.get(url);

      console.log(response.data);
      if (!Array.isArray(response.data) || response.data.length === 0) {
        setError("No attendance data returned.");
        return;
      }

      const data = response.data || [];
      if (data.length === 0) {
        setError("No attendance records found.");
      } else {
        setAttendanceData(data);
        setFilteredAttendanceData(data); // Set all data initially
        calculateAttendanceSummary(data);
      }

      setTotalPages(Math.ceil(data.length / 10)); // Assume 10 records per page
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance based on selection (day, month, year, week)
  const filterAttendance = () => {
    let filteredData = [...attendanceData];

    if (selection === "day") {
      filteredData = filteredData.filter((record) =>
        moment(record.date).isSame(moment(), "day")
      );
    } else if (selection === "month") {
      filteredData = filteredData.filter((record) =>
        moment(record.date).isSame(moment(), "month")
      );
    } else if (selection === "year") {
      filteredData = filteredData.filter((record) =>
        moment(record.date).isSame(moment(), "year")
      );
    } else if (selection === "week") {
      filteredData = filteredData.filter((record) =>
        moment(record.date).isSame(moment(), "week")
      );
    }

    // Apply pagination logic
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    setFilteredAttendanceData(filteredData.slice(startIndex, endIndex));
    calculateAttendanceSummary(filteredData.slice(startIndex, endIndex));
  };

  // Calculate attendance percentages for filtered data
  const calculateAttendanceSummary = (data: any[]) => {
    const summary = {
      present: 0,
      onLeave: 0,
      absent: 0,
      late: 0,
    };

    data.forEach((attendance) => {
      if (attendance.status === "P") summary.present++;
      if (attendance.status === "O") summary.onLeave++;
      if (attendance.status === "A") summary.absent++;
      if (attendance.status === "L") summary.late++;
    });

    const total = data.length;
    setAttendanceSummary({
      present:
        total > 0
          ? parseFloat(((summary.present / total) * 100).toFixed(2))
          : 0,
      onLeave:
        total > 0
          ? parseFloat(((summary.onLeave / total) * 100).toFixed(2))
          : 0,
      absent:
        total > 0 ? parseFloat(((summary.absent / total) * 100).toFixed(2)) : 0,
      late:
        total > 0 ? parseFloat(((summary.late / total) * 100).toFixed(2)) : 0,
    });
  };

  // Handle selection change (e.g., day, month, year, week)
  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelection(event.target.value);
    setPage(1); // Reset to the first page when changing filter
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Fetch attendance data on component mount
  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (attendanceData.length > 0) {
      filterAttendance();
    }
  }, [selection, page, attendanceData]);

  return (
    <main className="p-6 space-y-6">
      <section className="bg-white shadow-md rounded-md p-6">
        <h3 className="text-lg font-semibold text-black">Attendance Summary</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-md text-green-600">
            Present: {attendanceSummary.present}%
          </div>
          <div className="bg-yellow-100 p-4 rounded-md text-yellow-600">
            On Leave: {attendanceSummary.onLeave}%
          </div>
          <div className="bg-red-100 p-4 rounded-md text-red-600">
            Absent: {attendanceSummary.absent}%
          </div>
          <div className="bg-purple-100 p-4 rounded-md text-purple-600">
            Late: {attendanceSummary.late}%
          </div>
        </div>
      </section>

      <section className="bg-white shadow-md rounded-md p-6">
        <h3 className="text-lg font-semibold text-black">Attendance Records</h3>

        {/* Selection for filtering by day, month, year */}
        <div className="mt-4 flex items-center space-x-4">
          <select
            className="border p-2 rounded-md text-black"
            value={selection}
            onChange={handleSelectionChange}
          >
            <option value="all">All Time</option>
            <option value="day">Today</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="week">This Week</option>
          </select>
        </div>

        {/* Display attendance data */}
        <div className="mt-6">
          {loading && <p className="text-black">Loading attendance data...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {filteredAttendanceData.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-black">Date</th>
                  <th className="py-2 px-4 border-b text-black">Status</th>
                  <th className="py-2 px-4 border-b text-black">
                    Check-in Time
                  </th>
                  <th className="py-2 px-4 border-b text-black">
                    Check-out Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendanceData.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="py-2 px-4 border-b text-black">
                      {attendance.date}
                    </td>
                    <td className="py-2 px-4 border-b text-black">
                      {attendance.status}
                    </td>
                    <td className="py-2 px-4 border-b text-black">
                      {attendance.check_in_time}
                    </td>
                    <td className="py-2 px-4 border-b text-black">
                      {attendance.check_out_time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-black">No attendance records found.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-between">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
};

export default AllAttendance;
