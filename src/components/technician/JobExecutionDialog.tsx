import { useState } from "react";
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

interface JobExecutionDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const governorStatuses = [
  { value: "active", label: "Active" },
  { value: "faulty", label: "Faulty" },
  { value: "not-installed", label: "Not Installed" },
];

const notDoneReasons = [
  { value: "client-unavailable", label: "Client Unavailable" },
  { value: "vehicle-missing", label: "Vehicle Missing" },
  { value: "access-denied", label: "Access Denied" },
  { value: "location-incorrect", label: "Location Incorrect" },
  { value: "other", label: "Other" },
];

export function JobExecutionDialog({
  job,
  open,
  onOpenChange,
}: JobExecutionDialogProps) {
  const [jobStatus, setJobStatus] = useState(job.status);
  const [formData, setFormData] = useState({
    governorSerial: "",
    governorStatus: "",
    gpsLocation: "Auto-captured: -1.2921, 36.8219", // Default coordinates (Nairobi)
    clientName: job.client,
    clientPhone: job.clientPhone,
    remarks: "",
    notDoneReason: "",
    escalationReason: "",
    photos: [] as File[],
    signature: null as string | null,
  });

  const [startTime] = useState(new Date().toLocaleString());

  const handleStatusChange = (newStatus: string) => {
    setJobStatus(newStatus);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log("Uploaded photos:", files); // Debugging line
    setFormData({ ...formData, photos: [...formData.photos, ...files] });
  };

  const handleSubmit = () => {
    // Basic validation before submitting
    if (!formData.governorSerial || !formData.governorStatus) {
      console.error("Please fill in all required fields.");
      return;
    }

    // In real app, this would save to backend and update job status
    console.log("Submitting job:", { ...formData, status: jobStatus });

    // Close dialog
    onOpenChange(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "in-progress":
        return "warning";
      case "completed":
        return "success";
      case "escalated":
        return "danger";
      case "not-done":
        return "secondary";
      default:
        return "default";
    }
  };

  // Ensure job is valid before rendering
  if (!job) {
    console.error("Job data is missing");
    return null; // Don't render if no job data is passed
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Job Execution - {job.id}
          </DialogTitle>
          <DialogDescription>
            Complete job details and update status
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Info Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Vehicle Registration
                  </Label>
                  <p className="font-mono font-medium">{job.vehicleReg}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Job Type</Label>
                  <p className="font-medium">{job.jobType}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={getStatusColor(jobStatus) as any}>
                    {jobStatus.replace("-", " ")}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{job.client}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{job.clientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Started: {startTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={jobStatus === "in-progress" ? "warning" : "outline"}
                  className="w-full"
                  onClick={() => handleStatusChange("in-progress")}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Start Job
                </Button>
                <Button
                  variant={jobStatus === "completed" ? "success" : "outline"}
                  className="w-full"
                  onClick={() => handleStatusChange("completed")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
                <Button
                  variant={jobStatus === "escalated" ? "danger" : "outline"}
                  className="w-full"
                  onClick={() => handleStatusChange("escalated")}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
                <Button
                  variant={jobStatus === "not-done" ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() => handleStatusChange("not-done")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cannot Complete
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Job Execution Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="governorSerial">Governor Serial Number</Label>
                    <Input
                      id="governorSerial"
                      placeholder="Enter serial number"
                      value={formData.governorSerial}
                      onChange={(e) =>
                        setFormData({ ...formData, governorSerial: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="governorStatus">Governor Status</Label>
                    <Select
                      value={formData.governorStatus}
                      onValueChange={(value) =>
                        setFormData({ ...formData, governorStatus: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {governorStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpsLocation">GPS Location</Label>
                  <div className="flex gap-2">
                    <Input
                      id="gpsLocation"
                      value={formData.gpsLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, gpsLocation: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Refresh GPS
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, clientPhone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conditional Sections based on status */}
            {jobStatus === "not-done" && (
              <Card className="shadow-card border-l-4 border-l-secondary">
                <CardHeader>
                  <CardTitle className="text-danger">Job Cannot be Completed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notDoneReason">Reason</Label>
                    <Select
                      value={formData.notDoneReason}
                      onValueChange={(value) =>
                        setFormData({ ...formData, notDoneReason: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {notDoneReasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {jobStatus === "escalated" && (
              <Card className="shadow-card border-l-4 border-l-danger">
                <CardHeader>
                  <CardTitle className="text-danger">Escalation Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="escalationReason">Escalation Reason</Label>
                    <Textarea
                      id="escalationReason"
                      placeholder="Describe the issue that requires escalation..."
                      value={formData.escalationReason}
                      onChange={(e) =>
                        setFormData({ ...formData, escalationReason: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photos and Documentation */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photos">Photo Evidence</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload photos</p>
                    <Input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("photos")?.click()}
                    >
                      Choose Photos
                    </Button>
                    {formData.photos.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {formData.photos.length} photo(s) selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks/Notes</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Add any additional notes or observations..."
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleSubmit}>
                Submit Job Update
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
