import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-500">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Attendance System
        </h1>
        <p className="text-sm text-gray-500">
          Welcome, <span className="font-medium">{user?.name}</span> ({user?.role})
        </p>
      </div>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
      >
        Log Out
      </button>
    </nav>
  );
};

export default Navbar;