import { useState, useEffect } from "react";
import {
  MapPin,
  Camera,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

interface JobExecutionDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const governorStatuses = [
  { value: "INSTALLED", label: "Installed" },
  { value: "FAULTY", label: "Faulty" },
  { value: "NOT_INSTALLED", label: "Not Installed" },
];

const notDoneReasons = [
  { value: "CLIENT_UNAVAILABLE", label: "Client Unavailable" },
  { value: "VEHICLE_MISSING", label: "Vehicle Missing" },
  { value: "ACCESS_DENIED", label: "Access Denied" },
  { value: "LOCATION_INCORRECT", label: "Location Incorrect" },
  { value: "OTHER", label: "Other" },
];

const statusMap: Record<string, string> = {
  "pending": "PENDING",
  "in-progress": "IN_PROGRESS",
  "completed": "DONE",
  "escalated": "IN_PROGRESS",
  "not-done": "PENDING",
};

export function JobExecutionDialog({
  job,
  open,
  onOpenChange,
}: JobExecutionDialogProps) {
  const [jobStatus, setJobStatus] = useState(job.status);
  const [formData, setFormData] = useState({
    governorSerial: "",
    governorStatus: "",
    gpsLocation: "Fetching location...",
    clientName: job.client,
    clientPhone: job.clientPhone,
    remarks: "",
    notDoneReason: "",
    escalationReason: "",
    photos: [] as File[],
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [startTime] = useState(new Date().toLocaleString());

  // Capture GPS
  useEffect(() => {
    if (!open) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setFormData(prev => ({
            ...prev,
            gpsLocation: `Auto-captured: ${pos.coords.latitude}, ${pos.coords.longitude}`,
          }));
        },
        (err) => {
          console.warn("Failed to get location:", err);
          setLocation(null);
          setFormData(prev => ({ ...prev, gpsLocation: "Location not available" }));
        },
        { enableHighAccuracy: true }
      );
    } else {
      setFormData(prev => ({ ...prev, gpsLocation: "Geolocation not supported" }));
    }
  }, [open]);

  const handleStatusChange = (newStatus: string) => setJobStatus(newStatus);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const handleSubmit = async () => {
    try {
      const prismaStatus = statusMap[jobStatus.toLowerCase()];
      const payload: any = {
        userId: job.technicianId || 2,
        status: prismaStatus,
        governorSerial: formData.governorSerial,
        governorStatus: formData.governorStatus,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        remarks: formData.remarks,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      };
      if (jobStatus === "not-done") payload.notDoneReason = formData.notDoneReason;
      if (jobStatus === "escalated") payload.escalationReason = formData.escalationReason;

      let dataToSend: any = payload;
      let config = { headers: { "Content-Type": "application/json" } };

      // Use FormData if photos exist
      if (formData.photos.length > 0) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) fd.append(key, String(value));
        });
        formData.photos.forEach(file => fd.append("photos", file));
        dataToSend = fd;
        config.headers = { "Content-Type": "multipart/form-data" };
      }

      await axios.put(
        `https://technician-production-0728.up.railway.app/api/jobs/update/${job.id}`,
        dataToSend,
        config
      );

      alert("Job updated successfully!");
      setFormData(prev => ({ ...prev, photos: [] }));
      onOpenChange(false);
    } catch (error: any) {
      console.error("Job update failed:", error.response?.data || error);
      alert("Job update failed. " + (error.response?.data?.message || ""));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "default";
      case "in-progress": return "warning";
      case "completed": return "success";
      case "escalated": return "destructive";
      case "not-done": return "secondary";
      default: return "default";
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Job Execution - {job.id}
          </DialogTitle>
          <DialogDescription>Complete job details and update status</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Vehicle Registration</Label>
                  <p className="font-mono font-medium">{job.vehicleReg}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Job Type</Label>
                  <p className="font-medium">{job.jobType}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={getStatusColor(jobStatus) as any}>{jobStatus.replace("-", " ")}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /><span>{job.client}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{job.clientPhone}</span></div>
                  <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{formData.gpsLocation}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><span>Started: {startTime}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant={jobStatus === "in-progress" ? "warning" : "outline"} className="w-full" onClick={() => handleStatusChange("in-progress")}><AlertTriangle className="h-4 w-4 mr-2" />Start Job</Button>
                <Button variant={jobStatus === "completed" ? "success" : "outline"} className="w-full" onClick={() => handleStatusChange("completed")}><CheckCircle className="h-4 w-4 mr-2" />Mark Complete</Button>
                <Button variant={jobStatus === "escalated" ? "destructive" : "outline"} className="w-full" onClick={() => handleStatusChange("escalated")}><AlertTriangle className="h-4 w-4 mr-2" />Escalate</Button>
                <Button variant={jobStatus === "not-done" ? "secondary" : "outline"} className="w-full" onClick={() => handleStatusChange("not-done")}><XCircle className="h-4 w-4 mr-2" />Cannot Complete</Button>
              </CardContent>
            </Card>
          </div>

          {/* Execution Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="governorSerial">Governor Serial</Label>
                    <Input id="governorSerial" value={formData.governorSerial} onChange={e => setFormData({...formData, governorSerial: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="governorStatus">Governor Status</Label>
                    <Select value={formData.governorStatus} onValueChange={v => setFormData({...formData, governorStatus: v})}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>{governorStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpsLocation">GPS Location</Label>
                  <Input id="gpsLocation" value={formData.gpsLocation} readOnly />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input id="clientName" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input id="clientPhone" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {jobStatus === "not-done" && (
              <Card className="shadow-card border-l-4 border-l-secondary">
                <CardHeader><CardTitle className="text-danger">Job Cannot be Completed</CardTitle></CardHeader>
                <CardContent>
                  <Label>Reason</Label>
                  <Select value={formData.notDoneReason} onValueChange={v => setFormData({...formData, notDoneReason: v})}>
                    <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                    <SelectContent>{notDoneReasons.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {jobStatus === "escalated" && (
              <Card className="shadow-card border-l-4 border-l-destructive">
                <CardHeader><CardTitle className="text-danger">Escalation Required</CardTitle></CardHeader>
                <CardContent>
                  <Label>Escalation Reason</Label>
                  <Textarea value={formData.escalationReason} onChange={e => setFormData({...formData, escalationReason: e.target.value})} rows={3} />
                </CardContent>
              </Card>
            )}

            <Card className="shadow-card">
              <CardHeader><CardTitle>Documentation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Photo Evidence</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload photos</p>
                    <Input id="photos" type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("photos")?.click()}>Choose Photos</Button>
                    {formData.photos.length > 0 && <p className="text-xs text-muted-foreground mt-2">{formData.photos.length} photo(s) selected</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Remarks/Notes</Label>
                  <Textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} rows={3} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-orange-500 text-white">Submit Job Update</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}