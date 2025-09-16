import { useEffect, useState } from "react";
import axios from "axios";
import { MoreHorizontal, Eye, Edit, Trash2, MapPin, Phone } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Job {
  id: string;
  vehicleReg: string;
  jobType: string;
  technician?: { name: string }; // because API returns technicianId, you might populate it with relation later
  client?: string; // extend once backend has client field
  clientPhone?: string;
  status: string;
  scheduledDate: string;
  location: string;
  createdAt: string;
}

interface JobTableProps {
  searchQuery: string;
  statusFilter: string;
  technicianFilter: string;
}

const statusColors = {
  pending: "default",
  "in-progress": "warning",
  completed: "success",
  escalated: "danger",
  "not-done": "secondary",
} as const;

export function JobTable({ searchQuery, statusFilter, technicianFilter }: JobTableProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("https://jendietech-production.up.railway.app/api/jobs");
        setJobs(res.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.vehicleReg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.technician?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.client?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status?.toLowerCase() === statusFilter;
    const matchesTechnician =
      technicianFilter === "all" ||
      job.technician?.name?.toLowerCase().replace(" ", "-") === technicianFilter;

    return matchesSearch && matchesStatus && matchesTechnician;
  });

  return (
    <div className="rounded-md border">
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
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Loading jobs...
              </TableCell>
            </TableRow>
          ) : filteredJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No jobs found matching your criteria
              </TableCell>
            </TableRow>
          ) : (
            filteredJobs.map((job) => (
              <TableRow key={job.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell className="font-mono">{job.vehicleReg}</TableCell>
                <TableCell>
                  <Badge variant="outline">{job.jobType}</Badge>
                </TableCell>
                <TableCell>{job.technician?.name || "Unassigned"}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{job.client || "N/A"}</span>
                    {job.clientPhone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {job.clientPhone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusColors[job.status?.toLowerCase() as keyof typeof statusColors] as any
                    }
                  >
                    {job.status?.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{job.scheduledDate?.split("T")[0]}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {job.location}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-danger">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
  );
}
