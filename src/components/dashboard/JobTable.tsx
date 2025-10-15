import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminJobExecutionDialog } from "@/components/admin/AdminJobExecutionDialog";

interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Job {
  id: number;
  vehicleReg?: string;
  jobType?: string;
  status?: string;
  scheduledDate?: string;
  location?: string;
  clientName?: string;
  clientPhone?: string;
  assignedTechnician?: Technician;
}

interface JobTableProps {
  searchQuery?: string;
  statusFilter?: string;
  technicianFilter?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const statusColors: Record<string, string> = {
  pending: "default",
  "in-progress": "warning",
  done: "success",
  escalated: "danger",
  "not-done": "secondary",
};

export function JobTable({
  searchQuery = "",
  statusFilter = "all",
  technicianFilter = "all",
  dateFrom,
  dateTo,
}: JobTableProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          "https://technician-production-e311.up.railway.app/api/jobs?page=1&limit=1000"
        );
        if (isMounted) {
          const data = Array.isArray(res.data) ? res.data : res.data?.jobs || [];
          setJobs(data);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        if (isMounted) setError("Failed to load jobs. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.vehicleReg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.assignedTechnician?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || job.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesTechnician =
      technicianFilter === "all" ||
      job.assignedTechnician?.name?.toLowerCase().replace(/\s+/g, "-") ===
        technicianFilter.toLowerCase();

    const matchesDate =
      (!dateFrom || new Date(job.scheduledDate || "").getTime() >= dateFrom.getTime()) &&
      (!dateTo || new Date(job.scheduledDate || "").getTime() <= dateTo.getTime());

    return matchesSearch && matchesStatus && matchesTechnician && matchesDate;
  });

  const totalPages = Math.max(Math.ceil(filteredJobs.length / itemsPerPage), 1);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="rounded-md border overflow-x-auto">
      {error && (
        <div className="p-4 text-red-500 text-center font-semibold">{error}</div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Vehicle Reg</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-10">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Loading jobs...
              </TableCell>
            </TableRow>
          ) : paginatedJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No jobs found matching your criteria
              </TableCell>
            </TableRow>
          ) : (
            paginatedJobs.map((job) => (
              <TableRow key={job.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell className="font-mono">{job.vehicleReg || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{job.jobType || "N/A"}</Badge>
                </TableCell>
                <TableCell>{job.assignedTechnician?.name || "Unassigned"}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{job.clientName || "N/A"}</span>
                    {job.clientPhone ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {job.clientPhone}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusColors[job.status?.toLowerCase() || ""] || "default"
                    }
                  >
                    {job.status?.replace("-", " ") || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.scheduledDate
                    ? new Date(job.scheduledDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {job.location || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedJob(job);
                      setDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center p-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <AdminJobExecutionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        job={selectedJob}
        onSave={(updatedJob) => {
          if (!updatedJob) {
            setJobs((prev) => prev.filter((j) => j.id !== selectedJob?.id));
          } else {
            setJobs((prev) =>
              prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
            );
          }
          setSelectedJob(null);
        }}
      />
    </div>
  );
}

