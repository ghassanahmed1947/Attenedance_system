import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const COMPLETION_WINDOW_HOURS = 9;

const DeveloperDashboard = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [signInTime, setSignInTime] = useState(null);
  const [signOutTime, setSignOutTime] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const { data } = await API.get("/attendance/status");
      setSignInTime(data.signInTime);
      setSignOutTime(data.signOutTime);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const hoursSinceSignOut = signOutTime
    ? (Date.now() - new Date(signOutTime).getTime()) / (1000 * 60 * 60)
    : null;

  const withinCompletionWindow = signOutTime && hoursSinceSignOut < COMPLETION_WINDOW_HOURS;

  useEffect(() => {
    if (withinCompletionWindow) {
      const remainingMs = (COMPLETION_WINDOW_HOURS - hoursSinceSignOut) * 60 * 60 * 1000;
      const timer = setTimeout(fetchStatus, remainingMs + 1000);
      return () => clearTimeout(timer);
    }
  }, [signOutTime]);

  const signInDisabled = !!signInTime && (!signOutTime || withinCompletionWindow);
  const signOutDisabled = !signInTime || !!signOutTime;

  const handleSignIn = async () => {
    setMessage("");
    setError("");
    try {
      const { data } = await API.post("/attendance/signin");
      setMessage(data.message);
      fetchStatus();
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
      fetchStatus();
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

          {!loading && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSignIn}
                disabled={signInDisabled}
                className={`px-6 py-2 rounded-md transition text-white ${
                  signInDisabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Sign In
              </button>

              <button
                onClick={handleSignOut}
                disabled={signOutDisabled}
                className={`px-6 py-2 rounded-md transition text-white ${
                  signOutDisabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                Sign Out
              </button>
            </div>
          )}

          {withinCompletionWindow && (
            <p className="text-blue-600 text-sm font-medium">
              Your shift has been completed
            </p>
          )}

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;