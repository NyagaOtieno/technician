import React, { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// ---------- Shared Role Type ----------
export type UserRole = "admin" | "technician";

// ---------- Lazy-loaded pages ----------
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const JobsList = lazy(() => import("@/pages/jobs/JobsList"));
const JobCreate = lazy(() => import("@/pages/jobs/JobCreate"));
const Sessions = lazy(() => import("@/pages/sessions/Sessions"));
const Reports = lazy(() => import("@/pages/reports/Reports"));
const RollCall = lazy(() => import("@/pages/rollcall/RollCall"));

// ---------- Lazy-loaded dashboards ----------
const AdminDashboard = lazy(
  () => import("@/components/dashboard/AdminDashboard")
);
const TechnicianDashboard = lazy(
  () => import("@/components/technician/TechnicianDashboard")
);

const queryClient = new QueryClient();

// ---------- Protected Route ----------
interface ProtectedRouteProps {
  isLoggedIn: boolean;
  children: React.ReactNode;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isLoggedIn,
  children,
}) => {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ---------- AppContent ----------
const AppContent: React.FC = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    navigate("/dashboard", { replace: true });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/login", { replace: true });
  };

  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-lg font-medium text-muted-foreground">
          Loading...
        </div>
      }
    >
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              {userRole === "admin" ? (
                <AdminDashboard onLogout={handleLogout} />
              ) : userRole === "technician" ? (
                <TechnicianDashboard onLogout={handleLogout} />
              ) : null}
            </ProtectedRoute>
          }
        />

        {/* Shared routes */}
        {isLoggedIn && (
          <>
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/jobs/create" element={<JobCreate />} />
          </>
        )}

        {/* Admin-only */}
        {isLoggedIn && userRole === "admin" && (
          <>
            <Route path="/reports" element={<Reports />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/rollcall" element={<RollCall />} />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

// ---------- Root App ----------
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
