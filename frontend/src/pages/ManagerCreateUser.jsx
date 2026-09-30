import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const ManagerCreateUser = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "employee" });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setEditingId(user._id);
    setFormSuccess("");
    setFormError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      setFormSuccess("User deleted successfully");
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const roleBadge = (role) => {
    const colors = {
      employee: "bg-blue-50 text-blue-700",
      manager: "bg-purple-50 text-purple-700",
      developer: "bg-orange-50 text-orange-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colors[role] || "bg-gray-100 text-gray-700"}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 space-y-6 pb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            {editingId ? "Edit User" : "Create New User"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />

            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />

            <input type="password" name="password" placeholder={editingId ? "New Password (optional)" : "Password"}
              value={formData.password} onChange={handleChange} required={!editingId}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />

            <select name="role" value={formData.role} onChange={handleChange}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="developer">Developer</option>
            </select>

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                {editingId ? "Update User" : "Create User"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                  Cancel
                </button>
              )}
            </div>
          </form>

          {formSuccess && <p className="text-green-600 text-sm mt-3">{formSuccess}</p>}
          {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{u.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{u.email}</td>
                    <td className="py-3 px-4">{roleBadge(u.role)}</td>
                    <td className="py-3 px-4 flex gap-3">
                      <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCreateUser;

