import { LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  userRole: "admin" | "technician";
  onLogout: () => void;
}

export function ProfileHeader({ userRole, onLogout }: ProfileHeaderProps) {
  const displayName = userRole === "admin" ? "Admin User" : "Technician";
  const initials = userRole === "admin" ? "AU" : "TU";

  return (
    <div className="flex items-center justify-between p-4 bg-background border-b border-border">
      <div className="flex items-center gap-3">
        <img 
          src="/src/assets/jendie-logo.png" 
          alt="JENDIE Tech" 
          className="h-8"
        />
        <div>
          <h2 className="text-lg font-semibold text-foreground">JENDIE Tech</h2>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 bg-background border border-border shadow-elevated z-50" 
          align="end" 
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userRole === "admin" ? "admin@jendie.com" : "tech@jendie.com"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            onSelect={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}