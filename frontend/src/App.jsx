import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/protectedRoute";

import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import ManagerHome from "./pages/ManagerHome";
import ManagerRecords from "./pages/ManagerRecords";
import ManagerCreateUser from "./pages/ManagerCreateUser";
import ManagerAttendance from "./pages/ManagerAttendance";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/employee" element={
          <ProtectedRoute allowedRole="employee"><EmployeeDashboard /></ProtectedRoute>
        } />

        <Route path="/developer" element={
          <ProtectedRoute allowedRole="developer"><DeveloperDashboard /></ProtectedRoute>
        } />

        <Route path="/manager/home" element={
          <ProtectedRoute allowedRole="manager"><ManagerHome /></ProtectedRoute>
        } />
        <Route path="/manager/records" element={
          <ProtectedRoute allowedRole="manager"><ManagerRecords /></ProtectedRoute>
        } />
        <Route path="/manager/create-user" element={
          <ProtectedRoute allowedRole="manager"><ManagerCreateUser /></ProtectedRoute>
        } />
        <Route path="/manager/attendance" element={
          <ProtectedRoute allowedRole="manager"><ManagerAttendance /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;