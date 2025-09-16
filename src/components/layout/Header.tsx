import { Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import jendielogo from "@/assets/jendie-logo.png";

interface HeaderProps {
  onMenuClick?: () => void;
  userRole?: "admin" | "technician";
  userName?: string;
  onLogout?: () => void;
}

export function Header({ onMenuClick, userRole = "admin", userName = "Admin User", onLogout }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <img 
              src={jendielogo} 
              alt="JENDIE" 
              className="h-8 w-8"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">JENDIE</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Job Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center - Motivational Tagline */}
        <div className="hidden lg:block">
          <p className="text-sm font-medium text-muted-foreground italic">
            "Every install counts. Every fault resolved. Every mile safer—JENDIE TECHS on duty."
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-danger cursor-pointer"
                onSelect={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}