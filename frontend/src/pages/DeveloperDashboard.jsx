import Navbar from "../components/Navbar";

const DeveloperDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center mt-20">
        <p className="text-gray-500">Developer dashboard</p>
      </div>
    </div>
  );
};

export default DeveloperDashboard;