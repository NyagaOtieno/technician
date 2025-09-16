import { useState } from "react";
import { Shield, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import jendielogo from "@/assets/jendie-logo.png";

interface RoleSelectorProps {
  onRoleSelect: (role: "admin" | "technician") => void;
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "technician" | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img src={jendielogo} alt="JENDIE" className="h-12 w-12" />
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
              JENDIE
            </h1>
          </div>
          <p className="text-xl font-medium text-muted-foreground">
            Job Management System
          </p>
          <p className="text-sm text-muted-foreground italic">
            "Every install counts. Every fault resolved. Every mile safer—JENDIE TECHS on duty."
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Select Your Role</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Role */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
                selectedRole === "admin" 
                  ? "ring-2 ring-primary shadow-elevated border-primary" 
                  : "shadow-card hover:shadow-elevated"
              }`}
              onClick={() => setSelectedRole("admin")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Administrator</CardTitle>
                <CardDescription>
                  Manage jobs, assign technicians, and monitor performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Create and assign jobs</li>
                  <li>• Monitor job status and progress</li>
                  <li>• View performance reports</li>
                  <li>• Handle escalated jobs</li>
                  <li>• Export data and analytics</li>
                </ul>
              </CardContent>
            </Card>

            {/* Technician Role */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
                selectedRole === "technician" 
                  ? "ring-2 ring-orange shadow-elevated border-orange" 
                  : "shadow-card hover:shadow-elevated"
              }`}
              onClick={() => setSelectedRole("technician")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-orange/10">
                  <Wrench className="h-8 w-8 text-orange" />
                </div>
                <CardTitle className="text-xl">Technician</CardTitle>
                <CardDescription>
                  Execute jobs, update status, and submit reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• View assigned jobs</li>
                  <li>• Execute job checklists</li>
                  <li>• Capture GPS and photos</li>
                  <li>• Collect client signatures</li>
                  <li>• Report and escalate issues</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button */}
          {selectedRole && (
            <div className="flex justify-center animate-fadeIn">
              <Button 
                variant={selectedRole === "admin" ? "hero" : "orange"}
                size="lg"
                onClick={() => onRoleSelect(selectedRole)}
                className="gap-2 text-lg px-8 py-6"
              >
                Continue as {selectedRole === "admin" ? "Administrator" : "Technician"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Demo Notice */}
        <div className="text-center p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            <strong>Demo Mode:</strong> This is a frontend demo. For full functionality including 
            authentication, database, and notifications, connect to Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}