import { useState } from "react";
import { User } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateTechnicianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const kenyanCounties = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Kakamega",
];

const roles = [
  { value: "TECHNICIAN", label: "TECHNICIAN" },
  { value: "STAFF", label: "STAFF" },
  { value: "ADMIN", label: "ADMIN" },
];

export function CreateTechnicianDialog({
  open,
  onOpenChange,
}: CreateTechnicianDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    role: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get admin token for registration
  const getAdminToken = async (): Promise<string | null> => {
    try {
      const res = await fetch(
        "https://jendietech-production.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@jendie.com",
            password: "admin123",
          }),
        }
      );
      const data = await res.json();
      if (res.ok) return data.token;
      toast.error("Admin login failed", { description: data.message });
      return null;
    } catch (err) {
      console.error(err);
      toast.error("Admin login error");
      return null;
    }
  };

  // --- Phone Normalizer ---
  const normalizePhone = (raw: string): string | null => {
    let phone = raw.trim();

    // Allow either 07XXXXXXXX or +2547XXXXXXXX
    const localRegex = /^07\d{8}$/;
    const intlRegex = /^\+2547\d{8}$/;

    if (localRegex.test(phone)) {
      return "+254" + phone.substring(1); // convert 07... to +2547...
    }

    if (intlRegex.test(phone)) {
      return phone; // already in correct format
    }

    return null; // invalid
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { name, email, phone, password, role, region } = formData;

      // Required fields
      if (!name || !email || !phone || !password || !role || !region) {
        toast.error("All fields are required");
        setIsSubmitting(false);
        return;
      }

      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        toast.error(
          "Phone number must be 07XXXXXXXX or +2547XXXXXXXX format"
        );
        setIsSubmitting(false);
        return;
      }

      const token = await getAdminToken();
      if (!token) throw new Error("Cannot get admin token");

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: normalizedPhone, // always +2547XXXXXXXX
        password: password.trim(),
        role,
        region,
      };

      const response = await fetch(
        "https://jendietech-production.up.railway.app/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to create user");

      toast.success("User created successfully!", {
        description: `${data.user.name} added.`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        region: "",
        role: "",
        password: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user profile. Share Email and Password with them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="James Mwangi"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="3456TECH"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="james.mwangi@jendie.co.ke"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254700000000 or 07XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Work Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Primary Location</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) =>
                    setFormData({ ...formData, region: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {kenyanCounties.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="orange" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
