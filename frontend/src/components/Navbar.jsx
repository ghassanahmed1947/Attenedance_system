// import { NavLink } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Navbar = () => {
//   const { user, logout } = useAuth();

//   const tabClass = ({ isActive }) =>
//     `px-3 py-1.5 rounded-md text-sm font-medium transition ${
//       isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
//     }`;

//   return (
//     <nav className="bg-white shadow-md px-6 py-4">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-lg font-semibold text-gray-800">Attendance System</h1>
//           <p className="text-sm text-gray-500">
//             Welcome, <span className="font-medium">{user?.name}</span> ({user?.role})
//           </p>
//         </div>

//         <button
//           onClick={logout}
//           className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
//         >
//           Log Out
//         </button>
//       </div>

//       {user?.role === "manager" && (
//         <div className="flex gap-2 mt-4">
//           <NavLink to="/manager/home" className={tabClass}>Home</NavLink>
//           <NavLink to="/manager/records" className={tabClass}>Records</NavLink>
//           <NavLink to="/manager/create-user" className={tabClass}>Create User</NavLink>
//           <NavLink to="/manager/attendance" className={tabClass}>Self Attendance</NavLink>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;


import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const tabClass = ({ isActive }) =>
    `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Section */}
        <div className="flex items-center justify-between py-4">

          {/* Brand + User Info */}
          <div className="flex items-center gap-4">

            {/* Logo */}
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-.714-.062-1.413-.18-2.016z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Attendance System
              </h1>

              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-500">
                  Welcome,{" "}
                  <span className="font-semibold text-gray-700">
                    {user?.name}
                  </span>
                </p>

                {/* Role Badge */}
                <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-500 hover:text-white hover:border-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>

            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>

        {/* Navigation */}
        {user?.role === "manager" && (
          <div className="flex items-center gap-1 overflow-x-auto border-t border-gray-100 py-3">

            <NavLink to="/manager/home" className={tabClass}>
               <span className="ml-1">Home</span>
            </NavLink>

            <NavLink to="/manager/records" className={tabClass}>
               <span className="ml-1">Records</span>
            </NavLink>

            <NavLink to="/manager/create-user" className={tabClass}>
               <span className="ml-1">Create User</span>
            </NavLink>

            <NavLink to="/manager/attendance" className={tabClass}>
               <span className="ml-1">Self Attendance</span>
            </NavLink>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

