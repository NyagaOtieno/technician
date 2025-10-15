import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertTriangle, CheckCircle2, XCircle, MapPin, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { JobExecutionDialog } from "./JobExecutionDialog";
import { ProfileHeader } from "@/components/layout/ProfileHeader";

const API_BASE = "https://technician-production-e311.up.railway.app/api";

const statusIcons = {
  pending: Clock,
  "in-progress": AlertTriangle,
  completed: CheckCircle2,
  escalated: AlertTriangle,
  "not-done": XCircle,
};

const priorityColors = {
  high: "destructive",
  medium: "warning",
  low: "success",
} as const;

export default function TechnicianDashboard({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("today");
  const [sessionActive, setSessionActive] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchJobs = async () => {
    if (!token || !userId) {
      setError("Token or userId missing. Please login.");
      setLoadingJobs(false);
      return;
    }

    setLoadingJobs(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE}/jobs?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedJobs = res.data?.jobs || [];

      // Filter only jobs assigned to logged-in technician
      const technicianJobs = fetchedJobs.filter(
        (job: any) => job.assignedTechnician?.id === Number(userId)
      );

      // Sort newest first
      technicianJobs.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setJobs(technicianJobs);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err?.response?.data?.message || err.message || "Failed to fetch jobs");
      toast({
        title: "Error fetching jobs",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  const startSession = async () => {
    if (!token || !userId) return;
    setLoadingSession(true);
    try {
      const res = await axios.post(
        `${API_BASE}/sessions/login`,
        { userId: Number(userId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) setSessionActive(true);
    } catch (err: any) {
      console.error("Session start error:", err);
      toast({ title: "Session Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingSession(false);
    }
  };

  const endSession = async () => {
    if (!token || !userId) return;
    setLoadingSession(true);
    try {
      const res = await axios.post(
        `${API_BASE}/sessions/logout`,
        { userId: Number(userId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) setSessionActive(false);
    } catch (err: any) {
      console.error("Session end error:", err);
      toast({ title: "Session Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayDate = new Date().toISOString().split("T")[0];
  const todayJobs = jobs.filter((job) => job.scheduledDate?.startsWith(todayDate));
  const pendingJobs = jobs.filter((job) => job.status?.toLowerCase() === "pending");
  const inProgressJobs = jobs.filter((job) => job.status?.toLowerCase() === "in-progress");
  const completedJobs = jobs.filter((job) => job.status?.toLowerCase() === "done" || job.status?.toLowerCase() === "completed");

  const renderJobCard = (job: any) => {
    const StatusIcon = statusIcons[job.status?.toLowerCase()] || Clock;

    return (
      <Card
        key={job.id}
        className="shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer"
        onClick={() => setSelectedJob(job)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">{job.vehicleReg || job.id}</CardTitle>
            </div>
            <Badge
              variant={priorityColors[job.priority?.toLowerCase()] || "secondary"}
            >
              {job.priority || "normal"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{job.jobType || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{job.status || "N/A"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{job.clientName || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{job.clientPhone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.location || "N/A"}</span>
            </div>
          </div>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedJob(job);
              }}
            >
              {["pending", "in-progress", "done"].includes(job.status?.toLowerCase())
                ? job.status === "pending" ? "Start Job" :
                  job.status === "in-progress" ? "Continue Job" :
                    "View Details"
                : "View Job"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader userRole="technician" onLogout={onLogout} />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              My Jobs
            </h1>
            <p className="text-muted-foreground">Track and complete your assigned jobs efficiently</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={startSession} disabled={sessionActive || loadingSession} variant="default">
              Start Session
            </Button>
            <Button onClick={endSession} disabled={!sessionActive || loadingSession} variant="destructive">
              End Session
            </Button>
          </div>
        </div>

        {error && <p className="text-destructive text-center">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card border-l-4 border-l-warning bg-warning/5">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingJobs.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-orange bg-orange/5">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressJobs.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange" />
            </CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-success bg-success/5">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedJobs.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today's Jobs</TabsTrigger>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {loadingJobs ? (
              <p className="text-center text-muted-foreground">Loading jobs...</p>
            ) : todayJobs.length === 0 ? (
              <p className="text-center text-muted-foreground">No jobs scheduled for today</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayJobs.map(renderJobCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {loadingJobs ? (
              <p className="text-center text-muted-foreground">Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p className="text-center text-muted-foreground">No jobs assigned to you</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map(renderJobCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedJob && (
          <JobExecutionDialog
            job={selectedJob}
            open={!!selectedJob}
            onOpenChange={(open) => !open && setSelectedJob(null)}
          />
        )}
      </div>
    </div>
  );
}
