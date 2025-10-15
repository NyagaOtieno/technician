import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobStatusCardProps {
  label: string;
  statusKey: "PENDING" | "IN_PROGRESS" | "DONE" | "NOT_DONE" | "ESCALATED";
  color: "default" | "warning" | "success" | "danger" | "secondary";
  trend: string;
}

const colorClasses: Record<JobStatusCardProps["color"], string> = {
  default: "border-l-primary bg-primary/5",
  warning: "border-l-warning bg-warning/5",
  success: "border-l-success bg-success/5",
  danger: "border-l-danger bg-danger/5",
  secondary: "border-l-muted-foreground bg-muted/5",
};

const badgeVariants: Record<JobStatusCardProps["color"], string> = {
  default: "default",
  warning: "warning",
  success: "success",
  danger: "danger",
  secondary: "secondary",
};

export function JobStatusCard({ label, statusKey, color, trend }: JobStatusCardProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // prevent state updates if unmounted
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://technician-production-e311.up.railway.app/api/jobs?page=1&limit=1000"
        );
        const jobs = Array.isArray(res.data) ? res.data : res.data?.jobs || [];
        const filtered = jobs.filter((job: any) => job?.status === statusKey);
        if (isMounted) setCount(filtered.length);
      } catch (err) {
        console.error(`Error fetching ${statusKey} jobs:`, err);
        if (isMounted) setCount(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, [statusKey]);

  return (
    <Card
      className={cn(
        "border-l-4 shadow-card hover:shadow-elevated transition-all duration-200",
        colorClasses[color]
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <Badge variant={badgeVariants[color] as any} className="text-xs">
              {loading ? "..." : count ?? "N/A"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{loading ? "..." : count ?? "N/A"}</p>
            <p className="text-xs text-muted-foreground">{trend}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
