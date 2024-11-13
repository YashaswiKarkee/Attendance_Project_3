import React from "react";

const Dashboard: React.FC = () => {
  const role = "Manager";

  return (
    <main className="p-6 space-y-6">
      <section className="bg-white shadow-md rounded-md p-6">
        <h3 className="text-lg font-semibold text-gray-700">Attendance Summary</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-md text-green-600">Present: 80%</div>
          <div className="bg-yellow-100 p-4 rounded-md text-yellow-600">On Leave: 10%</div>
          <div className="bg-red-100 p-4 rounded-md text-red-600">Absent: 10%</div>
        </div>
      </section>

      <section className="bg-white shadow-md rounded-md p-6">
        <h3 className="text-lg font-semibold text-gray-700">Quick Actions</h3>
        <div className="mt-4 flex space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Mark Attendance</button>
          {role === "Manager" && (
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Generate Report</button>
          )}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
