import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const ManagerDashboard = () => {
  const [attendanceByDate, setAttendanceByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchAttendance = async () => {
    try {
      const { data } = await API.get("/attendance");
      setAttendanceByDate(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, []);

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "employee" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      if (editingId) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await API.put(`/users/${editingId}`, payload);
        setFormSuccess("User updated successfully");
      } else {
        await API.post("/users", formData);
        setFormSuccess("User created successfully");
      }

      resetForm();
      fetchUsers();
      fetchAttendance();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setEditingId(user._id);
    setFormSuccess("");
    setFormError("");
  };

  const handleDelete = async (id) => {
    if (alert("Are you sure you want to delete this user?")) return;

    try {
      await API.delete(`/users/${id}`);
      setFormSuccess("User deleted successfully");
      fetchUsers();
      fetchAttendance();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-10 space-y-6 pb-10">
        {/* Create / Edit User Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? "Edit User" : "Create New User"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder={editingId ? "New Password (optional)" : "Password"}
              value={formData.password}
              onChange={handleChange}
              required={!editingId}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="developer">Developer</option>
            </select>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                {editingId ? "Update User" : "Create User"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {formSuccess && <p className="text-green-600 text-sm mt-3">{formSuccess}</p>}
          {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Users</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-sm text-gray-600">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b text-sm">
                    <td className="py-2 px-3">{u.name}</td>
                    <td className="py-2 px-3">{u.email}</td>
                    <td className="py-2 px-3 capitalize">{u.role}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end items-center">
          <button
            onClick={fetchAttendance}
            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="space-y-6">
            {attendanceByDate.map((day) => (
              <div key={day.date} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  {formatDate(day.date)}
                </h3>

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
                      {day.records.map((emp) => (
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
                          <td className="py-2 px-3">{emp.totalHours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {day.records.length === 0 && (
                    <p className="text-gray-500 text-sm mt-2 text-center">
                      No employees found.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;