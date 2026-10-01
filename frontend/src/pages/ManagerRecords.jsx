import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const ROLE_BADGE = {
  employee: { letter: "E", classes: "bg-blue-100 text-blue-700" },
  manager: { letter: "M", classes: "bg-purple-100 text-purple-700" },
  developer: { letter: "D", classes: "bg-orange-100 text-orange-700" },
};

const RoleBadge = ({ role }) => {
  const badge = ROLE_BADGE[role];
  if (!badge) return null;
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${badge.classes}`}>
      {badge.letter}
    </span>
  );
};

const ManagerRecords = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await API.get("/users");
        setAllEmployees(data);
      } catch (err) {
        // ignore
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRecords = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/attendance/records", { params });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setNameInput(value);
    setSelectedEmployee(null);

    if (value.trim() === "") {
      setSuggestions(allEmployees);
    } else {
      setSuggestions(
        allEmployees.filter((u) => u.name.toLowerCase().includes(value.toLowerCase()))
      );
    }
    setShowSuggestions(true);
  };

  const handleFocus = () => {
    setSuggestions(
      nameInput.trim() === ""
        ? allEmployees
        : allEmployees.filter((u) => u.name.toLowerCase().includes(nameInput.toLowerCase()))
    );
    setShowSuggestions(true);
  };

  const handleSelectEmployee = (user) => {
    setSelectedEmployee(user);
    setNameInput(user.name);
    setShowSuggestions(false);
  };

  const handleSelectAllUsers = () => {
    setSelectedEmployee(null);
    setNameInput("");
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (selectedEmployee) params.employeeId = selectedEmployee.id || selectedEmployee._id;
    if (start) params.start = start;
    if (end) params.end = end;
    fetchRecords(params);
  };

  const handleClear = () => {
    setNameInput("");
    setSelectedEmployee(null);
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
      <div className="max-w-5xl mx-auto mt-10 space-y-6 pb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Search Records</h2>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative" ref={wrapperRef}>
              <input
                type="text"
                placeholder="All Users"
                value={nameInput}
                onChange={handleNameChange}
                onFocus={handleFocus}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {showSuggestions && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-56 overflow-y-auto">
                  <div
                    onClick={handleSelectAllUsers}
                    className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50 cursor-pointer"
                  >
                    All Users
                  </div>
                  {suggestions.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => handleSelectEmployee(u)}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <RoleBadge role={u.role} />
                      <span>{u.name}</span>
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-400">No matches</div>
                  )}
                </div>
              )}
            </div>

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
  
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : result?.mode === "single" ? (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                <RoleBadge role={result.employee.role} />
                {result.employee.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="py-3 px-4 font-medium">Date</th>
                      <th className="py-3 px-4 font-medium">Attendance</th>
                      <th className="py-3 px-4 font-medium">Sign In</th>
                      <th className="py-3 px-4 font-medium">Sign Out</th>
                      <th className="py-3 px-4 font-medium">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.records.map((r) => (
                      <tr key={r.date} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-500">{formatDate(r.date)}</td>
                        <td className="py-3 px-4">{statusBadge(r.attendance)}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{formatTime(r.signInTime)}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{formatTime(r.signOutTime)}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{r.totalHours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.records.length === 0 && (
                  <p className="text-gray-400 text-sm mt-2 text-center">No records found.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400">Total Working Days</p>
                  <p className="text-xl font-medium text-gray-800">{result.summary.totalWorkingDays}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600">Total Present</p>
                  <p className="text-xl font-medium text-green-700">{result.summary.totalPresent}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-xs text-red-600">Total Absent</p>
                  <p className="text-xl font-medium text-red-700">{result.summary.totalAbsent}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600">Total Hours</p>
                  <p className="text-xl font-medium text-blue-700">{result.summary.totalHours}</p>
                </div>
              </div>
            </div>
          </>
        ) : result?.mode === "all-simple" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                  {result.records.map((emp) => (
                    <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                        <span className="flex items-center gap-2">
                          <RoleBadge role={emp.role} />
                          {emp.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">{statusBadge(emp.attendance)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{formatTime(emp.signInTime)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{formatTime(emp.signOutTime)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{emp.totalHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.records.length === 0 && (
                <p className="text-gray-400 text-sm mt-4 text-center">No records found.</p>
              )}
            </div>
          </div>
        ) : result?.mode === "all-matrix" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">{result.monthLabel}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="py-3 px-4 font-medium sticky left-0 bg-white">Date</th>
                    {result.employees.map((emp) => (
                      <th key={emp.id} className="py-3 px-4 font-medium text-center whitespace-nowrap">
                         <span className="flex items-center justify-center gap-1">
                          
                          {emp.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.date} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm text-gray-500 sticky left-0 bg-white whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      {result.employees.map((emp) => {
                        const status = row.cells[emp.id];
                        const colors = {
                          P: "bg-green-50 text-green-700",
                          A: "bg-red-50 text-red-700",
                          H: "bg-gray-100 text-gray-500",
                        };
                        return (
                          <td key={emp.id} className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${colors[status]}`}>
                              {status}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-700 sticky left-0 bg-white">
                      Total Hours
                    </td>
                    {result.employees.map((emp) => (
                      <td key={emp.id} className="py-3 px-4 text-center text-sm font-semibold text-gray-700">
                        {result.totals[emp.id]}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
              {result.rows.length === 0 && (
                <p className="text-gray-400 text-sm mt-4 text-center">No records found for this search.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ManagerRecords;