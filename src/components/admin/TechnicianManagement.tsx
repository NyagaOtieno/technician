import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Users, Edit, Trash2, Phone, Mail, MapPin, Navigation, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/api";
import { CreateTechnicianDialog } from "./CreateTechnicianDialog";
import { AdminJobExecutionDialog } from "./AdminJobExecutionDialog";

// ---------------- Types ----------------
type JobStatus = "pending" | "active" | "completed" | "inactive";

interface Technician {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: JobStatus;
  specialization?: string;
  activeJobs?: number;
  completedJobs?: number;
  rating?: number;
  role?: string;
}

interface Job {
  id: number;
  vehicleReg: string;
  type: string;
  technician: string;
  client: string;
  status: JobStatus;
  scheduled: string;
  location: string;
  photos?: string[];
  remarks?: string;
}

// ---------------- Utils ----------------
const getStatusColor = (status?: JobStatus): BadgeProps["variant"] => {
  const map: Record<JobStatus, BadgeProps["variant"]> = {
    active: "success",
    inactive: "secondary",
    pending: "warning",
    completed: "primary",
  };
  return status ? map[status] : "secondary";
};

const formatPhone = (phone?: string | number) => (phone ? `+${phone}` : "-");

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.address ? `${data.address.city || data.address.town || data.address.state || "Unknown"}, ${data.address.suburb || ""}` : `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
};

// ---------------- Components ----------------
function StatCard({ label, value, icon: Icon, border, color }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  border: string;
  color: string;
}) {
  return (
    <Card className={`shadow-card border-l-4 ${border} ${color}/5`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </CardContent>
    </Card>
  );
}

function JobCard({ job, onView }: { job: Job; onView: (job: Job) => void }) {
  return (
    <Card key={job.id} className="shadow-card hover:shadow-md transition">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Job #{job.id}
          <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p><strong>Vehicle:</strong> {job.vehicleReg}</p>
        <p><strong>Client:</strong> {job.client}</p>
        <p><strong>Type:</strong> {job.type}</p>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Scheduled:</strong> {new Date(job.scheduled).toLocaleString()}</p>
        <Button size="sm" variant="outline" className="gap-1 mt-2" onClick={() => onView(job)}>
          View Job
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------- Main Page ----------------
export function TechnicianManagement() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  const [createTechnicianOpen, setCreateTechnicianOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [modalType, setModalType] = useState<"edit" | "jobs" | "deactivate" | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);

  const [mapOpen, setMapOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // -------- Fetch Technicians --------
  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const usersRes = await api.get("/users");
      const sessionsRes = await api.get("/reports/technicians/active");

      const usersData: Technician[] = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];
      const sessionsData: { id: number; latitude?: number; longitude?: number }[] = Array.isArray(sessionsRes.data) ? sessionsRes.data : sessionsRes.data?.data || [];

      const activeIds = sessionsData.map(s => s.id);

      const techs: Technician[] = usersData
        .filter(u => u.role?.toUpperCase() === "TECHNICIAN")
        .map(t => {
          const session = sessionsData.find(s => s.id === t.id);
          return {
            ...t,
            status: activeIds.includes(t.id) ? "active" : "inactive",
            latitude: session?.latitude,
            longitude: session?.longitude,
            location: session ? `${session.latitude}, ${session.longitude}` : t.location || "N/A",
          };
        });

      setTechnicians(techs);
      setLoading(false);

      // Reverse geocode each technician with lat/lng
      techs.forEach(async t => {
        if (t.latitude && t.longitude) {
          const loc = await reverseGeocode(t.latitude, t.longitude);
          setTechnicians(prev => prev.map(p => p.id === t.id ? { ...p, location: loc } : p));
        }
      });
    } catch (err: any) {
      console.error("Failed to fetch technicians:", err);
      toast.error("Failed to fetch technicians");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // -------- Handlers --------
  const handleSaveEdit = async (updated: Technician) => {
    try {
      await api.put(`/users/${updated.id}`, updated);
      toast.success("Technician updated");
      fetchTechnicians();
      setModalType(null);
    } catch {
      toast.error("Error updating technician");
    }
  };

  const handleViewJobs = async (tech: Technician) => {
    setSelectedTech(tech);
    setModalType("jobs");
    setJobsLoading(true);
    try {
      const res = await api.get<Job[]>(`/jobs?technicianId=${tech.id}`);
      setJobs(res.data);
    } catch {
      toast.error("Failed to fetch jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  const handleViewJobExecution = (job: Job) => {
    setSelectedJob(job);
    setJobDialogOpen(true);
  };

  const handleSaveJob = async (updated: Job) => {
    try {
      await api.post(`/jobs/${updated.id}/history`, { ...updated });
      toast.success("Job updated");
      setJobs(prev => prev.map(j => (j.id === updated.id ? updated : j)));
      setSelectedJob(updated);
    } catch {
      toast.error("Error updating job");
    }
  };

  const handleDeactivate = async (tech: Technician) => {
    try {
      await api.delete(`/users/${tech.id}`);
      toast.success(`${tech.name} deleted`);
      fetchTechnicians();
      setModalType(null);
    } catch {
      toast.error("Error deleting technician");
    }
  };

  const handleViewMap = (tech: Technician) => {
    if (tech.latitude && tech.longitude) {
      setMapCoords({ lat: tech.latitude, lng: tech.longitude });
      setMapOpen(true);
    } else {
      toast.error("Location not available");
    }
  };

  const filteredTechnicians = useMemo(() => {
    if (!searchTerm) return technicians;
    return technicians.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.phone && t.phone.toString().includes(searchTerm))
    );
  }, [searchTerm, technicians]);

  // ---------------- Render ----------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Technician Management</h2>
          <p className="text-muted-foreground">Manage technician profiles and jobs</p>
        </div>
        <Button onClick={() => setCreateTechnicianOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Technician
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Technicians" value={technicians.length} icon={Users} border="border-l-primary" color="text-primary" />
        <StatCard label="Active Technicians" value={technicians.filter(t => t.status === "active").length} icon={Users} border="border-l-success" color="text-success" />
        <StatCard label="Inactive Technicians" value={technicians.filter(t => t.status === "inactive").length} icon={Users} border="border-l-warning" color="text-orange-500" />
      </div>

      {/* Technician Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Technician Directory</CardTitle>
          {/* Search */}
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Search technicians..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={fetchTechnicians} className="gap-1"><SearchIcon className="h-4 w-4" /> Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? [...Array(5)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                )) : filteredTechnicians.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-6">No technicians found</TableCell></TableRow>
                ) : filteredTechnicians.map(tech => (
                  <TableRow key={tech.id} className="hover:bg-muted/50">
                    <TableCell>
                      <p className="font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.id}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {formatPhone(tech.phone)}</div>
                      <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {tech.email}</div>
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {tech.location || "N/A"} 
                      {tech.latitude && tech.longitude && (
                        <Button size="icon" variant="ghost" onClick={() => handleViewMap(tech)}><Navigation className="h-4 w-4" /></Button>
                      )}
                    </TableCell>
                    <TableCell>{tech.rating || "-"}</TableCell>
                    <TableCell><Badge variant={getStatusColor(tech.status)}>{tech.status || "inactive"}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedTech(tech); setModalType("edit"); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewJobs(tech)}>
                            <Users className="mr-2 h-4 w-4" /> View Jobs
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedTech(tech); setModalType("deactivate"); }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Map Modal */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-3xl h-[400px]">
          <DialogHeader><DialogTitle>Technician Location</DialogTitle></DialogHeader>
          {mapCoords && (
            <iframe
              title="Technician Map"
              src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=15&output=embed`}
              width="100%" height="100%"
              style={{ border: 0 }}
            />
          )}
          <DialogFooter>
            <Button onClick={() => setMapOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <CreateTechnicianDialog open={createTechnicianOpen} onOpenChange={setCreateTechnicianOpen} />

      {modalType === "edit" && selectedTech && (
        <Dialog open onOpenChange={() => setModalType(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Technician</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Label>Name</Label>
              <Input value={selectedTech.name} onChange={e => setSelectedTech({ ...selectedTech, name: e.target.value })} />
              <Label>Email</Label>
              <Input value={selectedTech.email} onChange={e => setSelectedTech({ ...selectedTech, email: e.target.value })} />
              <Label>Phone</Label>
              <Input value={selectedTech.phone} onChange={e => setSelectedTech({ ...selectedTech, phone: e.target.value })} />
              <DialogFooter><Button onClick={() => handleSaveEdit(selectedTech)}>Save</Button></DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {modalType === "jobs" && selectedTech && (
        <Dialog open onOpenChange={() => setModalType(null)}>
          <DialogContent className="max-w-5xl h-[600px] overflow-y-auto">
            <DialogHeader><DialogTitle>{selectedTech.name} - Assigned Jobs</DialogTitle></DialogHeader>
            {jobsLoading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
            : jobs.length === 0 ? <p className="text-center py-6 text-muted-foreground">No jobs found</p>
            : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => <JobCard key={job.id} job={job} onView={handleViewJobExecution} />)}
              </div>}
          </DialogContent>
        </Dialog>
      )}

      {modalType === "deactivate" && selectedTech && (
        <Dialog open onOpenChange={() => setModalType(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Technician</DialogTitle></DialogHeader>
            <p>Are you sure you want to delete <strong>{selectedTech.name}</strong>?</p>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setModalType(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeactivate(selectedTech)}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Job Execution Dialog */}
      {selectedJob && (
        <AdminJobExecutionDialog
          open={jobDialogOpen}
          job={selectedJob}
          onOpenChange={setJobDialogOpen}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
}
