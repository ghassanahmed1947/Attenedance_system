import { useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const EmployeeDashboard = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setMessage("");
    setError("");
    try {
      const { data } = await API.post("/attendance/signin");
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleSignOut = async () => {
    setMessage("");
    setError("");
    try {
      const { data } = await API.post("/attendance/signout");
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-col items-center justify-center mt-20">
        <div className="bg-white p-8 rounded-lg shadow-md text-center space-y-4 w-full max-w-sm">
          <h2 className="text-xl font-semibold text-gray-800">Mark Attendance</h2>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSignIn}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            >
              Sign In
            </button>

            <button
              onClick={handleSignOut}
              className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition"
            >
              Sign Out
            </button>
          </div>

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;