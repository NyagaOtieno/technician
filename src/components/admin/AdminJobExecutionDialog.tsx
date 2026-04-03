import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "@/lib/api";

interface Job {
  id?: number;
  vehicleReg: string;
  jobType: string;
  technicianId: number;
  technicianName?: string;
  client?: string;
  status: string;
  scheduledDate: string;
  location: string;
  remarks?: string;
  escalationReason?: string;
  notDoneReason?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  governorSerial?: string;
  governorStatus?: string;
}

interface AdminJobExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onSave: (updatedJob: Job | null) => void; // null for delete
  isNew?: boolean; // true if creating a new job
}

const statusVariantMap: Record<string, BadgeProps["variant"]> = {
  PENDING: "warning",
  STARTED: "secondary",
  DONE: "success", // backend enum
  ESCALATED: "destructive",
  NOT_DONE: "destructive",
};

// Display options for UI
const displayStatusOptions = ["PENDING", "STARTED", "COMPLETED", "ESCALATED", "NOT_DONE"];

// Map display value to backend enum
const mapStatusToApi = (status: string) => {
  if (status === "COMPLETED") return "DONE";
  return status;
};

export function AdminJobExecutionDialog({
  open,
  onOpenChange,
  job,
  onSave,
  isNew = false,
}: AdminJobExecutionDialogProps) {
  const [localJob, setLocalJob] = useState<Job | null>(job);
  const [uploading, setUploading] = useState(false);

  useEffect(() => setLocalJob(job), [job]);

  if (!localJob) return null;

  const updateJob = (changes: Partial<Job>) =>
    setLocalJob((prev) => (prev ? { ...prev, ...changes } : prev));

  // ---------------------- Upload Photos ----------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !localJob.id) return;
    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach((file) => formData.append("photos", file));

      const res = await api.put(`/jobs/update/${localJob.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateJob({ photos: res.data.photos });
      toast.success("Photos uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  // ---------------------- Save / Create Job ----------------------
  const handleSave = async () => {
    if (!localJob) return;

    const apiStatus = mapStatusToApi(localJob.status);

    try {
      let res;
      if (isNew) {
        // Create Job
        res = await api.post("/jobs", {
          vehicleReg: localJob.vehicleReg,
          jobType: localJob.jobType,
          status: apiStatus,
          scheduledDate: localJob.scheduledDate,
          location: localJob.location,
          clientName: localJob.client,
          clientPhone: localJob.client,
          remarks: localJob.remarks,
          technicianId: localJob.technicianId,
          governorSerial: localJob.governorSerial,
          governorStatus: localJob.governorStatus,
        });
        toast.success(`Job #${res.data.data.id} created successfully`);
        onSave(res.data.data);
      } else {
        // Update existing Job
        res = await api.put(`/jobs/update/${localJob.id}`, {
          userId: localJob.technicianId,
          status: apiStatus,
          governorSerial: localJob.governorSerial,
          governorStatus: localJob.governorStatus,
          clientName: localJob.client,
          clientPhone: localJob.client,
          remarks: localJob.remarks,
          latitude: localJob.latitude,
          longitude: localJob.longitude,
        });
        toast.success(`Job #${localJob.id} updated successfully`);
        onSave(res.data.job);
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(isNew ? "Failed to create job" : "Failed to update job");
    }
  };

  // ---------------------- Delete Job ----------------------
  const handleDelete = async () => {
    if (!localJob || !localJob.id || !confirm(`Delete job #${localJob.id}?`)) return;

    try {
      await api.delete(`/jobs/${localJob.id}`);
      toast.success(`Job #${localJob.id} deleted successfully`);
      onSave(null);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete job");
    }
  };

  // ---------------------- Render ----------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Create Job" : `Job Execution - ${localJob.vehicleReg} (${localJob.jobType})`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Info */}
          {!isNew && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job ID</Label>
                <p className="text-sm">{localJob.id}</p>
              </div>
              <div>
                <Label>Technician</Label>
                <p className="text-sm">{localJob.technicianName || localJob.technicianId}</p>
              </div>
              <div>
                <Label>Client</Label>
                <p className="text-sm">{localJob.client || "N/A"}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={statusVariantMap[mapStatusToApi(localJob.status)] || "secondary"}>
                  {localJob.status}
                </Badge>
              </div>
              <div>
                <Label>Scheduled</Label>
                <p className="text-sm">{new Date(localJob.scheduledDate).toLocaleString()}</p>
              </div>
              <div>
                <Label>Location</Label>
                <p className="text-sm">{localJob.location}</p>
              </div>
            </div>
          )}

          {/* Editable Fields */}
          <div className="space-y-3">
            <div>
              <Label>Status</Label>
              <Select
                value={localJob.status}
                onValueChange={(val) => updateJob({ status: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {displayStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Remarks</Label>
              <Textarea
                value={localJob.remarks || ""}
                onChange={(e) => updateJob({ remarks: e.target.value })}
              />
            </div>

            {["ESCALATED", "NOT_DONE"].includes(localJob.status) && (
              <div>
                <Label>{localJob.status === "ESCALATED" ? "Escalation Reason" : "Not Done Reason"}</Label>
                <Textarea
                  value={
                    localJob.status === "ESCALATED"
                      ? localJob.escalationReason || ""
                      : localJob.notDoneReason || ""
                  }
                  onChange={(e) =>
                    updateJob(
                      localJob.status === "ESCALATED"
                        ? { escalationReason: e.target.value }
                        : { notDoneReason: e.target.value }
                    )
                  }
                />
              </div>
            )}
          </div>

          {/* Photos */}
          <div>
            <Label>Photos</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {localJob.photos?.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`job-photo-${i}`}
                  className="h-20 w-20 object-cover rounded border"
                />
              ))}
            </div>

            {!isNew && (
              <div className="mt-2 flex gap-2">
                <Button variant="outline" className="gap-2" asChild disabled={uploading}>
                  <label className="cursor-pointer flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Photos"}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                </Button>

                <Button variant="destructive" className="gap-2" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" /> Delete Job
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{isNew ? "Create Job" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
