import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Users, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTechnicianDialog } from "./CreateTechnicianDialog";

interface Technician {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  status?: string; // active | inactive
  specialization?: string;
  activeJobs?: number;
  completedJobs?: number;
  rating?: number;
  joinDate?: string;
}

export function TechnicianManagement() {
  const [createTechnicianOpen, setCreateTechnicianOpen] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await axios.get("https://jendietech-production.up.railway.app/api/users");
        // If API returns ALL users, filter only technicians by role
        const techs = res.data.filter((user: any) => user.role === "TECHNICIAN");
        setTechnicians(techs);
      } catch (error) {
        console.error("Error fetching technicians:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  const getStatusColor = (status: string) => {
    return status?.toLowerCase() === "active" ? "success" : "secondary";
  };

  const getTotalTechnicians = () => technicians.length;
  const getActiveTechnicians = () =>
    technicians.filter((t) => t.status?.toLowerCase() === "active").length;
  const getTotalActiveJobs = () =>
    technicians.reduce((sum, t) => sum + (t.activeJobs || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Technician Management
          </h2>
          <p className="text-muted-foreground">
            Manage technician profiles, assignments, and performance
          </p>
        </div>
        <Button
          variant="orange"
          onClick={() => setCreateTechnicianOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Technician
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Technicians</p>
                <p className="text-2xl font-bold">{getTotalTechnicians()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-success bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Technicians</p>
                <p className="text-2xl font-bold">{getActiveTechnicians()}</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-orange bg-orange/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{getTotalActiveJobs()}</p>
              </div>
              <Users className="h-8 w-8 text-orange" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technician Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Technician Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      Loading technicians...
                    </TableCell>
                  </TableRow>
                ) : technicians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      No technicians found
                    </TableCell>
                  </TableRow>
                ) : (
                  technicians.map((technician) => (
                    <TableRow key={technician.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{technician.name}</p>
                          <p className="text-xs text-muted-foreground">{technician.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {technician.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {technician.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {technician.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {technician.location || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{technician.specialization || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{technician.activeJobs || 0} active</p>
                          <p className="text-muted-foreground">{technician.completedJobs || 0} completed</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{technician.rating || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(technician.status || "inactive") as any}>
                          {technician.status || "inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              View Jobs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-danger">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateTechnicianDialog
        open={createTechnicianOpen}
        onOpenChange={setCreateTechnicianOpen}
      />
    </div>
  );
}
