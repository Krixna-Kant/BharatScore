import { useState } from "react";
import { SidebarProvider,SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./dashboard/AppSideBar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings
} from "lucide-react";

interface LoanApplication {
  id: string;
  applicantName: string;
  loanType: string;
  loanAmount: number;
  bharatScore: number;
  riskCategory: "Low" | "Medium" | "High";
  status: "pending" | "approved" | "rejected" | "under_review";
  appliedDate: string;
  region: "urban" | "rural";
  deviceType: "smartphone" | "feature_phone";
  factors: {
    technology: number;
    location: number;
    financial: number;
    stability: number;
    demographics: number;
  };
}

const mockApplications: LoanApplication[] = [
  {
    id: "BOI001",
    applicantName: "Rajesh Kumar",
    loanType: "Personal Loan",
    loanAmount: 250000,
    bharatScore: 720,
    riskCategory: "Low",
    status: "approved",
    appliedDate: "2024-01-20",
    region: "urban",
    deviceType: "smartphone",
    factors: { technology: 80, location: 70, financial: 85, stability: 75, demographics: 60 }
  },
  {
    id: "BOI002",
    applicantName: "Priya Sharma",
    loanType: "Education Loan",
    loanAmount: 800000,
    bharatScore: 685,
    riskCategory: "Medium",
    status: "under_review",
    appliedDate: "2024-01-21",
    region: "rural",
    deviceType: "smartphone",
    factors: { technology: 75, location: 55, financial: 70, stability: 80, demographics: 65 }
  },
  {
    id: "BOI003",
    applicantName: "Anil Patel",
    loanType: "Agriculture Loan",
    loanAmount: 500000,
    bharatScore: 595,
    riskCategory: "Medium",
    status: "pending",
    appliedDate: "2024-01-22",
    region: "rural",
    deviceType: "feature_phone",
    factors: { technology: 40, location: 60, financial: 75, stability: 85, demographics: 55 }
  },
  {
    id: "BOI004",
    applicantName: "Sunita Devi",
    loanType: "Business Loan",
    loanAmount: 1200000,
    bharatScore: 450,
    riskCategory: "High",
    status: "rejected",
    appliedDate: "2024-01-19",
    region: "rural",
    deviceType: "feature_phone",
    factors: { technology: 35, location: 45, financial: 40, stability: 50, demographics: 45 }
  },
  {
    id: "BOI005",
    applicantName: "Vikash Singh",
    loanType: "Emergency Loan",
    loanAmount: 150000,
    bharatScore: 655,
    riskCategory: "Medium",
    status: "approved",
    appliedDate: "2024-01-23",
    region: "urban",
    deviceType: "smartphone",
    factors: { technology: 80, location: 65, financial: 60, stability: 70, demographics: 55 }
  }
];

const AdminDashboard = () => {
  const [applications, setApplications] = useState<LoanApplication[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "under_review":
        return <AlertTriangle className="h-4 w-4 text-accent" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending Review</Badge>;
      case "under_review":
        return <Badge className="bg-accent text-accent-foreground">Under Review</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return <Badge className="bg-success text-success-foreground">Low Risk</Badge>;
      case "Medium":
        return <Badge className="bg-warning text-warning-foreground">Medium Risk</Badge>;
      case "High":
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus as any } : app
      )
    );
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesRisk = riskFilter === "all" || app.riskCategory === riskFilter;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const stats = {
    totalApplications: applications.length,
    pendingReview: applications.filter(app => app.status === "pending" || app.status === "under_review").length,
    approved: applications.filter(app => app.status === "approved").length,
    avgBharatScore: Math.round(applications.reduce((sum, app) => sum + app.bharatScore, 0) / applications.length)
  };

  if (selectedApplication) {
    return (
      <SidebarProvider>
        <div className="min-h-screen w-full flex bg-background">
          <AppSidebar isAdmin={true} />
          <main className="flex-1">
            <header className="h-16 border-b border-border bg-card flex items-center px-6">
              <SidebarTrigger label="Toggle Sidebar" />
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Application Details</h1>
              </div>
              <Button 
                variant="outline" 
                className="ml-auto"
                onClick={() => setSelectedApplication(null)}
              >
                Back to Dashboard
              </Button>
            </header>
            
            <div className="p-6 space-y-6">
              <Card className="shadow-medium border-border/50">
                <CardHeader className="bg-gradient-admin text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedApplication.applicantName}</CardTitle>
                      <p className="text-primary-foreground/80">Application ID: {selectedApplication.id}</p>
                    </div>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Application Details */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">Loan Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{selectedApplication.loanType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">₹{selectedApplication.loanAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Applied:</span>
                          <span className="font-medium">{selectedApplication.appliedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Region:</span>
                          <span className="font-medium capitalize">{selectedApplication.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Device:</span>
                          <span className="font-medium capitalize">{selectedApplication.deviceType.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </Card>

                    {/* BharatScore */}
                    <Card className="p-4 text-center">
                      <h3 className="font-semibold text-foreground mb-3">BharatScore</h3>
                      <div className="text-3xl font-bold text-foreground mb-2">{selectedApplication.bharatScore}</div>
                      {getRiskBadge(selectedApplication.riskCategory)}
                    </Card>

                    {/* Factor Analysis */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">Score Factors</h3>
                      <div className="space-y-2">
                        {Object.entries(selectedApplication.factors).map(([factor, value]) => (
                          <div key={factor} className="flex items-center justify-between text-sm">
                            <span className="capitalize text-muted-foreground">{factor}</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-border">
                    {selectedApplication.status === "pending" && (
                      <>
                        <Button 
                          className="bg-success text-success-foreground hover:bg-success/90"
                          onClick={() => handleStatusChange(selectedApplication.id, "approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Application
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleStatusChange(selectedApplication.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleStatusChange(selectedApplication.id, "under_review")}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Mark for Review
                        </Button>
                      </>
                    )}
                    {selectedApplication.status === "under_review" && (
                      <>
                        <Button 
                          className="bg-success text-success-foreground hover:bg-success/90"
                          onClick={() => handleStatusChange(selectedApplication.id, "approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Application
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleStatusChange(selectedApplication.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AppSidebar isAdmin={true} />
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6">
            <SidebarTrigger label="Toggle Sidebar" />
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
            </div>
          </header>
          
          <div className="p-6 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center shadow-soft border-border/50">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-2xl text-foreground">{stats.totalApplications}</h3>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </Card>
              <Card className="p-4 text-center shadow-soft border-border/50">
                <Clock className="h-8 w-8 text-warning mx-auto mb-2" />
                <h3 className="font-semibold text-2xl text-foreground">{stats.pendingReview}</h3>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </Card>
              <Card className="p-4 text-center shadow-soft border-border/50">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <h3 className="font-semibold text-2xl text-foreground">{stats.approved}</h3>
                <p className="text-sm text-muted-foreground">Approved</p>
              </Card>
              <Card className="p-4 text-center shadow-soft border-border/50">
                <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h3 className="font-semibold text-2xl text-foreground">{stats.avgBharatScore}</h3>
                <p className="text-sm text-muted-foreground">Avg BharatScore</p>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 shadow-medium border-border/50">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="Low">Low Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Applications Table */}
            <Card className="shadow-medium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Loan Applications ({filteredApplications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <div key={app.id} className="p-4 border border-border rounded-lg hover:shadow-soft transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(app.status)}
                          <div>
                            <h4 className="font-semibold text-foreground">{app.applicantName}</h4>
                            <p className="text-sm text-muted-foreground">ID: {app.id} • {app.loanType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">₹{app.loanAmount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Score: {app.bharatScore}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(app.status)}
                            {getRiskBadge(app.riskCategory)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;