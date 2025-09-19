import React from "react";

interface TechnicianDashboardProps {
  onLogout: () => void;
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ onLogout }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Technician Dashboard</h1>
      <button
        onClick={onLogout}
        className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default TechnicianDashboard;
