import { useState } from "react";
import { Plus, Filter, Download, Search, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobStatusCard } from "./JobStatusCard";
import { JobTable } from "./JobTable";
import { CreateJobDialog } from "./CreateJobDialog";
import { TechnicianManagement } from "@/components/admin/TechnicianManagement";
import { ProfileHeader } from "@/components/layout/ProfileHeader";

const statusMetrics = [
  { label: "Pending", count: 12, color: "default", trend: "+2 from yesterday" },
  { label: "In Progress", count: 8, color: "warning", trend: "+3 from yesterday" },
  { label: "Completed", count: 45, color: "success", trend: "+12 from yesterday" },
  { label: "Escalated", count: 3, color: "danger", trend: "0 from yesterday" },
  { label: "Not Done", count: 2, color: "secondary", trend: "-1 from yesterday" },
];

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader userRole="admin" onLogout={onLogout} />
      <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="technicians" className="gap-2">
            <Users className="h-4 w-4" />
            Technicians
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Manage jobs, track progress, and monitor technician performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="orange" 
            onClick={() => setCreateJobOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statusMetrics.map((metric) => (
          <JobStatusCard
            key={metric.label}
            label={metric.label}
            count={metric.count}
            color={metric.color as any}
            trend={metric.trend}
          />
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Job Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vehicle reg, technician, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="not-done">Not Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                <SelectItem value="james-mwangi">James Mwangi</SelectItem>
                <SelectItem value="grace-wanjiku">Grace Wanjiku</SelectItem>
                <SelectItem value="david-kimani">David Kimani</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>

          <JobTable 
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            technicianFilter={technicianFilter}
          />
          </CardContent>
        </Card>

        <CreateJobDialog open={createJobOpen} onOpenChange={setCreateJobOpen} />
        </TabsContent>

        <TabsContent value="technicians">
          <TechnicianManagement />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
export default AdminDashboard;
