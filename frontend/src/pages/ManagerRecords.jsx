import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const ManagerRecords = () => {
  const [attendanceByDate, setAttendanceByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const fetchRecords = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/attendance/records", { params });
      setAttendanceByDate(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (name) params.name = name;
    if (start) params.start = start;
    if (end) params.end = end;
    fetchRecords(params);
  };

  const handleClear = () => {
    setName("");
    setStart("");
    setEnd("");
    fetchRecords();
  };

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const statusBadge = (status) => {
    const isPresent = status === "P";
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        isPresent ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? "bg-green-500" : "bg-red-500"}`} />
        {isPresent ? "Present" : "Absent"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 space-y-6 pb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Search Records</h2>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Search
              </button>
              <button type="button" onClick={handleClear} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Clear
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            Sab khali chhodein to aaj ka din dikhega. Sirf Start Date bharein to sirf usi din ka data. Sirf Name bharein to us employee ki poori history.
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="space-y-6">
            {attendanceByDate.map((day) => (
              <div key={day.date} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">{formatDate(day.date)}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">Attendance</th>
                        <th className="py-3 px-4 font-medium">Sign In</th>
                        <th className="py-3 px-4 font-medium">Sign Out</th>
                        <th className="py-3 px-4 font-medium">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.records.map((emp) => (
                        <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{emp.name}</td>
                          <td className="py-3 px-4">{statusBadge(emp.attendance)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{formatTime(emp.signInTime)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{formatTime(emp.signOutTime)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{emp.totalHours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {day.records.length === 0 && (
                    <p className="text-gray-400 text-sm mt-2 text-center">No records found.</p>
                  )}
                </div>
              </div>
            ))}

            {attendanceByDate.length === 0 && (
              <p className="text-gray-400 text-sm text-center">No records found for this search.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerRecords;