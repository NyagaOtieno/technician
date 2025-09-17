import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobStatusCardProps {
  label: string;
  statusKey: "PENDING" | "IN_PROGRESS" | "DONE" | "NOT_DONE" | "ESCALATED"; // backend schema
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
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://jendietech-production.up.railway.app/api/jobs")
      .then((res) => {
        const jobs = res.data || [];
        const filtered = jobs.filter((job: any) => job.status === statusKey);
        setCount(filtered.length);
      })
      .catch((err) => {
        console.error(`Error fetching ${statusKey} jobs:`, err);
        setCount(0);
      })
      .finally(() => setLoading(false));
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
              {loading ? "..." : count}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{loading ? "..." : count}</p>
            <p className="text-xs text-muted-foreground">{trend}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
