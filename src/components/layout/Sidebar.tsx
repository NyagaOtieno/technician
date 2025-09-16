import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/jobs", label: "Jobs" },
  { path: "/jobs/create", label: "Create Job" },
  { path: "/sessions", label: "Sessions" },
  { path: "/reports", label: "Reports" },
  { path: "/rollcall", label: "Roll Call" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        JENDIE Tech
      </div>
      <nav className="flex-1 flex flex-col p-4 gap-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "px-3 py-2 rounded-md hover:bg-gray-700 transition-colors",
              location.pathname === item.path ? "bg-gray-700 font-semibold" : ""
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
