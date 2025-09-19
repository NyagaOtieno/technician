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
import logo from "@/assets/logo.png";

const API_BASE = "https://jendietech-production.up.railway.app/api";

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

function TechnicianDashboard({ onLogout }: { onLogout: () => void }) {
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

  // ---- Fetch Jobs ----
  const fetchJobs = async () => {
    setLoadingJobs(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/jobs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs");
      toast({
        title: "Error fetching jobs",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  // ---- Session ----
  const startSession = async () => {
    if (!token || !userId) return;
    setLoadingSession(true);
    try {
      const res = await axios.post(
        `${API_BASE}/sessions/login`,
        { userId: parseInt(userId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        setSessionActive(true);
        toast({ title: "Session Started", description: "You are now online." });
      }
    } catch (err: any) {
      toast({
        title: "Session Error",
        description: err.message,
        variant: "destructive",
      });
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
        { userId: parseInt(userId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        setSessionActive(false);
        toast({ title: "Session Ended", description: "You are now offline." });
      }
    } catch (err: any) {
      toast({
        title: "Session Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingSession(false);
    }
  };

  // ---- Roll Call ----
  const takeRollCall = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_BASE}/rollcall`,
        { region: "Nairobi" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        toast({
          title: "Attendance Marked",
          description: "Roll call successful!",
        });
      }
    } catch (err: any) {
      toast({
        title: "Roll Call Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // ---- Initial Load ----
  useEffect(() => {
    fetchJobs();
    if (!sessionActive) startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Filters ----
  const todayDate = new Date().toISOString().split("T")[0];
  const todayJobs = jobs.filter((job) => job.scheduledDate?.startsWith(todayDate));
  const pendingJobs = jobs.filter((job) => job.status?.toLowerCase() === "pending");
  const inProgressJobs = jobs.filter((job) => job.status?.toLowerCase() === "in-progress");
  const completedJobs = jobs.filter((job) => job.status?.toLowerCase() === "completed");

  // ---- Render Job Card ----
  const renderJobCard = (job: any) => {
    const StatusIcon = statusIcons[job.status?.toLowerCase() as keyof typeof statusIcons] || Clock;
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
              <CardTitle className="text-lg">{job.id}</CardTitle>
            </div>
            <Badge
              variant={
                priorityColors[job.priority?.toLowerCase() as keyof typeof priorityColors] ||
                "secondary"
              }
            >
              {job.priority || "normal"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Vehicle</p>
              <p className="font-mono font-medium">{job.vehicleReg || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{job.jobType || "N/A"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{job.client || "Unknown"}</span>
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
              {job.status?.toLowerCase() === "pending" && "Start Job"}
              {job.status?.toLowerCase() === "in-progress" && "Continue Job"}
              {job.status?.toLowerCase() === "completed" && "View Details"}
              {!["pending", "in-progress", "completed"].includes(
                job.status?.toLowerCase() || ""
              ) && "View Job"}
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
        {/* Header & Session */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              My Jobs
            </h1>
            <p className="text-muted-foreground">
              Track and complete your assigned jobs efficiently
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={startSession}
              disabled={sessionActive || loadingSession}
              variant="default"
            >
              Start Session
            </Button>
            <Button
              onClick={endSession}
              disabled={!sessionActive || loadingSession}
              variant="destructive"
            >
              End Session
            </Button>
            <Button onClick={takeRollCall} variant="secondary">
              Mark Attendance
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="shadow-card border border-destructive p-4 bg-destructive/5">
            <p className="text-destructive">⚠️ {error}</p>
          </Card>
        )}

        {/* Quick Stats */}
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

        {/* Job Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today's Jobs</TabsTrigger>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {loadingJobs ? (
              <p className="text-center text-muted-foreground">Loading jobs...</p>
            ) : todayJobs.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No jobs scheduled for today</h3>
                  <p className="text-muted-foreground">Enjoy your day off!</p>
                </CardContent>
              </Card>
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
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">You have no assigned jobs.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map(renderJobCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Job Dialog */}
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

export default TechnicianDashboard;
