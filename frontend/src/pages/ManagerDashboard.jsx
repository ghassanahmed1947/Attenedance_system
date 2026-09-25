import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const ManagerDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchAttendance = async () => {
    try {
      const { data } = await API.get("/attendance");
      setAttendance(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      await API.post("/users", { ...formData, role: "employee" });
      setFormSuccess("Employee added successfully");
      setFormData({ name: "", email: "", password: "" });
      fetchAttendance();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add employee");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-10 space-y-6 pb-10">
        {/* Add Employee Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Employee</h2>

          <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="md:col-span-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Add Employee
              </button>
            </div>
          </form>

          {formSuccess && <p className="text-green-600 text-sm mt-3">{formSuccess}</p>}
          {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Employee Attendance
            </h2>
            <button
              onClick={fetchAttendance}
              className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-sm text-gray-600">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Attendance</th>
                    <th className="py-2 px-3">Sign In</th>
                    <th className="py-2 px-3">Sign Out</th>
                    <th className="py-2 px-3">Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((emp) => (
                    <tr key={emp._id} className="border-b text-sm">
                      <td className="py-2 px-3">{emp.name}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            emp.attendance === "P"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {emp.attendance}
                        </span>
                      </td>
                      <td className="py-2 px-3">{formatTime(emp.signInTime)}</td>
                      <td className="py-2 px-3">{formatTime(emp.signOutTime)}</td>
                      <td className="py-2 px-3">{emp.totalHours || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {attendance.length === 0 && (
                <p className="text-gray-500 text-sm mt-4 text-center">
                  No employees found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;