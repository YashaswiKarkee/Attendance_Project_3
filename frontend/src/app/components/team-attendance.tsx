"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const TeamAttendance: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]); // To store the list of users
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]); // Attendance data for the selected user
  const [filteredAttendanceData, setFilteredAttendanceData] = useState<any[]>(
    []
  ); // Filtered attendance data
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    onLeave: 0,
    absent: 0,
    late: 0,
  });
  const [page, setPage] = useState(1); // Pagination for users
  const [totalPages, setTotalPages] = useState(1); // Total pages for user list
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error handling
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [selection, setSelection] = useState("all"); // Selection for filtering

  // Fetch all users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null); // Reset error on new fetch

    try {
      const response = await axios.get(
        `http://localhost:8000/api/users/list/?page=${page}`
      );
      const data = response.data.results || [];
      console.log(data);
      if (data.length === 0) {
        setError("No users found.");
      } else {
        setUsers(data); // Setting the users state
        setTotalPages(Math.ceil(response.data.count / 3)); // This calculation works as long as the backend returns a `count` field
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance records for the selected user
  const fetchAttendanceForUser = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8000/api/attendance/get-attendance/user-attendance/${userId}/`
      );

      if (
        !Array.isArray(response.data.data) ||
        response.data.data.length === 0
      ) {
        setError("No attendance data returned.");
        return;
      }

      const data = response.data.data || [];
      setAttendanceData(data);
      filterAttendance();
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

  useEffect(() => {
    if (attendanceData.length > 0) {
      filterAttendance();
    }
  }, [selection, page, attendanceData]);
  // Calculate attendance summary (present, on leave, absent, late)
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

  // Handle user selection from the list
  const handleUserSelect = (userId: string, userName: string) => {
    setSelectedUserName(userName);
    setSelectedUserId(userId);
    fetchAttendanceForUser(userId); // Fetch attendance for selected user
  };

  // Handle selection change for filtering
  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelection(event.target.value);
  };

  // Handle pagination for users
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Effect to fetch users on page change
  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <main className="p-6 space-y-6">
      <section className="bg-white shadow-md rounded-md p-6">
        <h3 className="text-lg font-semibold text-gray-700">User List</h3>

        {loading && <p className="text-gray-700">Loading users...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="mt-4">
          <ul>
            {users.map((user, index) => (
              <button
                key={index}
                className="w-full text-left"
                onClick={() => handleUserSelect(user.id, user.first_name)}
              >
                <li className="flex justify-between items-center p-4 bg-white rounded-md shadow-md mb-2 hover:bg-gray-100 transition duration-200">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.profile_picture}`}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-gray-700 font-medium">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </li>
              </button>
            ))}
          </ul>
        </div>

        {/* Pagination for users */}
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </section>

      {selectedUserId && (
        <section className="bg-white shadow-md rounded-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Attendance Summary for User {selectedUserName}
          </h3>

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

          <div className="mt-4 grid grid-cols-4 gap-4">
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

          <div className="mt-4">
            <h4 className="text-lg font-semibold text-gray-700">
              Attendance Data:
            </h4>

            {loading && <p className="text-gray-700">Loading attendance...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {/* Display attendance data */}
            <div className="mt-6">
              {loading && (
                <p className="text-black">Loading attendance data...</p>
              )}
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
          </div>
        </section>
      )}
    </main>
  );
};

export default TeamAttendance;
