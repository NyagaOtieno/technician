import { useState, useEffect } from "react";
import axios from "axios";
import { CalendarDays, MapPin, User, Settings } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const jobTypes = [
  { value: "INSTALL", label: "Install" },
  { value: "RENEWAL", label: "Renewal" },
  { value: "FAULT-CHECK", label: "Fault Check" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "REMOVAL", label: "Removal" },
];

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const [formData, setFormData] = useState({
    vehicleReg: "",
    jobType: "",
    technicianId: "",
    scheduledDate: "",
    location: "",
    clientName: "",
    clientPhone: "",
    notes: "",
  });
  const [technicians, setTechnicians] = useState<any[]>([]);
  const { toast } = useToast();

  // ✅ Fetch technicians from API
  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://jendietech-production.up.railway.app/api/users",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const techs = res.data.filter((user: any) => user.role === "TECHNICIAN");
        setTechnicians(techs);
      } catch (err) {
        console.error("Error fetching technicians:", err);
      }
    };
    if (open) fetchTechs();
  }, [open]);

  // ✅ Handle job creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://jendietech-production.up.railway.app/api/jobs",
        {
          vehicleReg: formData.vehicleReg,
          jobType: formData.jobType,
          status: "PENDING",
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
          location: formData.location,
          technicianId: parseInt(formData.technicianId),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Job Created",
        description: `Job for ${formData.vehicleReg} assigned successfully.`,
      });

      onOpenChange(false);
      setFormData({
        vehicleReg: "",
        jobType: "",
        technicianId: "",
        scheduledDate: "",
        location: "",
        clientName: "",
        clientPhone: "",
        notes: "",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create job",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Create New Job
          </DialogTitle>
          <DialogDescription>
            Assign a new job to a technician with auto-generated checklist
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Registration */}
            <div className="space-y-2">
              <Label htmlFor="vehicleReg">Vehicle Registration Number</Label>
              <Input
                id="vehicleReg"
                placeholder="e.g., KCA 123A"
                value={formData.vehicleReg}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleReg: e.target.value })
                }
                required
              />
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select
                value={formData.jobType}
                onValueChange={(value) =>
                  setFormData({ ...formData, jobType: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned Technician */}
            <div className="space-y-2">
              <Label htmlFor="technician">Assigned Technician</Label>
              <Select
                value={formData.technicianId}
                onValueChange={(value) =>
                  setFormData({ ...formData, technicianId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {tech.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Nairobi CBD"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Create Job & Send SMS Notification
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
