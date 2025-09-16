import { useState } from "react";
import Login from "@/pages/Login";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import TechnicianDashboard from "@/components/technician/TechnicianDashboard";


const Index = () => {
  const [userRole, setUserRole] = useState<"admin" | "technician" | null>(null);

  const handleLogin = (role: "admin" | "technician") => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="animate-fadeIn">
        {userRole === "admin" ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <TechnicianDashboard onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
};

export default Index;
