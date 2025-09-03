import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  ChevronRight,
  Bell,
  RefreshCw,
  TrendingUp,
  X
} from "lucide-react";

// CreditRiskDashboard Component (as a modal)
interface UserData {
  id: string;
  name: string;
  ageGroup: string;
  region: string;
  occupation?: string;
  loanRequested: number;
}

interface ModelOutput {
  final_cibil_score: number;
  final_tier: string;
  loan_approval_probability: number;
  monthly_income?: number;
  debt_to_income_ratio?: number;
  employment_stability?: string;
}

interface CreditRiskDashboardProps {
  clerkUserId: string;
  userData: UserData;
  modelOutput: any;
  onClose: () => void;
  applicationData: any;
  onStatusUpdate: (status: string, remarks: string) => void;
  updating: boolean;
}

function CreditRiskDashboard({ 
  clerkUserId, 
  userData, 
  modelOutput, 
  onClose, 
  applicationData,
  onStatusUpdate,
  updating 
}: CreditRiskDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string>("");
  const [error, setError] = useState("");
  const [remarksInput, setRemarksInput] = useState("");
  const [generatingRemarks, setGeneratingRemarks] = useState(false);

  const buildGeminiPrompt = () => `
You are a financial analyst AI.
Here is user data: ${JSON.stringify(userData)}
Here is model output: ${JSON.stringify(modelOutput)}

Write a concise credit risk report including summary, strengths, weaknesses, and recommendation.
`;

  const generateAIRemarks = async (status) => {
    setGeneratingRemarks(true);
    try {
      const prompt = `
        You are a loan assessment AI assistant. Based on the following application data and decision, generate a professional, concise remark for the loan application.

        Application Details:
        - Applicant: ${userData.name || 'Unknown'}
        - Loan Amount: ₹${userData.loanRequested || 'N/A'}
        - Age Group: ${userData.ageGroup || 'N/A'}
        - Region: ${userData.region || 'N/A'}
        - Occupation: ${userData.occupation || 'N/A'}
        - Decision: ${status.toUpperCase()}
        
        AI Assessment:
        - Credit Score: ${modelOutput?.final_cibil_score || 'N/A'}
        - Risk Tier: ${modelOutput?.final_tier || 'N/A'}
        - Approval Probability: ${modelOutput?.loan_approval_probability ? (modelOutput.loan_approval_probability * 100).toFixed(1) + '%' : 'N/A'}

        Generate a professional remark (2-3 sentences) explaining the decision. For approved applications, mention document verification requirement. For rejected applications, mention specific concerns.
      `;

      const response = await fetch("http://127.0.0.1:8000/generate-remark", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(applicationData), // send full application data
});

if (!response.ok) throw new Error("Failed to generate remarks");

const data = await response.json();
const generatedRemark = data.ai_remark || "";

setRemarksInput(generatedRemark);

      // const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     contents: [{
      //       parts: [{
      //         text: prompt
      //       }]
      //     }],
      //     generationConfig: {
      //       maxOutputTokens: 200,
      //       temperature: 0.7
      //     }
      //   })
      // });
      
      // if (!response.ok) throw new Error('Failed to generate remarks');
      
      // const data = await response.json();
      // const generatedRemark = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // setRemarksInput(generatedRemark);
    } catch (err) {
      console.error('Failed to generate AI remarks:', err);
      setError('Failed to generate AI remarks. Please write manually.');
    } finally {
      setGeneratingRemarks(false);
    }
  };

  useEffect(() => {
    async function fetchAiReport() {
      try {
        setLoading(true);
        setError("");

        const prompt = buildGeminiPrompt();

        const res = await fetch("http://127.0.0.1:8000/generate-remark", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(applicationData.raw), // <-- send raw data from backend
});

const data = await res.json();
const aiText = data.ai_remark || "No report generated";
setAiReport(aiText);



//         if (!res.ok) {
//           const text = await res.text();
//           throw new Error(`AI API Error: ${text}`);
//         }

//         const data = await res.json();
// const aiText = data.ai_remark || "No report generated";

// setAiReport(aiText);

      } catch (e) {
        setError(`Failed to load AI report: ${e}`);
      } finally {
        setLoading(false);
      }
    }
    fetchAiReport();
  }, [clerkUserId]);

  const handleStatusUpdate = (status) => {
    if (updating) return;
    
    if (remarksInput.trim()) {
      onStatusUpdate(status, remarksInput.trim());
    } else {
      // Generate default message based on status
      let defaultRemark = "";
      switch (status) {
        case "approved":
          defaultRemark = "Application approved. Please visit the nearest branch for document verification and loan disbursement.";
          break;
        case "rejected":
          defaultRemark = "Application has been rejected based on our assessment criteria.";
          break;
        default:
          defaultRemark = "Application status updated.";
      }
      onStatusUpdate(status, defaultRemark);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-bold">Credit Risk Report for {userData.name}</h1>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="animate-spin mr-2" />
              Loading AI report...
            </div>
          ) : error ? (
            <div className="error p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
          ) : (
            <>
              {/* AI Report */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <TrendingUp className="mr-2" /> AI Analysis
                </h2>
                <div className="whitespace-pre-wrap">{aiReport}</div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-1">Credit Score</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {modelOutput?.final_cibil_score || "N/A"}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-1">Risk Tier</h3>
                  <p className="text-xl font-bold text-purple-700">
                    {modelOutput?.final_tier || "N/A"}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-1">Approval Probability</h3>
                  <p className="text-2xl font-bold text-green-700">
                    {modelOutput?.loan_approval_probability ? (modelOutput.loan_approval_probability * 100).toFixed(1) + '%' : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Additional Financial Data */}
              {(modelOutput?.monthly_income || modelOutput?.debt_to_income_ratio) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-3">Financial Assessment</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {modelOutput.monthly_income && (
                      <div>
                        <strong className="text-gray-700">Monthly Income:</strong>
                        <p className="font-medium">₹{modelOutput.monthly_income.toLocaleString()}</p>
                      </div>
                    )}
                    {modelOutput.debt_to_income_ratio && (
                      <div>
                        <strong className="text-gray-700">Debt to Income:</strong>
                        <p className="font-medium">{(modelOutput.debt_to_income_ratio * 100).toFixed(1)}%</p>
                      </div>
                    )}
                    {modelOutput.employment_stability && (
                      <div>
                        <strong className="text-gray-700">Employment Stability:</strong>
                        <p className="font-medium">{modelOutput.employment_stability}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Information */}
              <div className="border rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold mb-3">User Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-700">Name:</strong>
                    <p>{userData.name}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Age Group:</strong>
                    <p>{userData.ageGroup}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Region:</strong>
                    <p>{userData.region}</p>
                  </div>
                  {userData.occupation && (
                    <div>
                      <strong className="text-gray-700">Occupation:</strong>
                      <p>{userData.occupation}</p>
                    </div>
                  )}
                  <div>
                    <strong className="text-gray-700">Loan Requested:</strong>
                    <p>₹{userData.loanRequested.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Decision Section */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-3">Decision & Remarks</h2>
                
                {/* Remarks Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add remarks for this application:
                  </label>
                  <textarea
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                    placeholder="Add remarks for this application..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                   
                   
                    <button
                      onClick={() => setRemarksInput("")}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={updating}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    {updating ? "Processing..." : "Approve Application"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={updating}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {updating ? "Processing..." : "Reject Application"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, className = "", variant = "default", size = "default", onClick, disabled, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = "", variant = "default" }) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variants = {
    default: "bg-gray-100 text-gray-900",
    outline: "border border-gray-300 text-gray-700",
  };
  
  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

const Select = ({ children, value, onValueChange, className = "" }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    {children}
  </select>
);

const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg w-full h-full max-w-none max-h-none m-0 z-10 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => <div>{children}</div>;

// Stats Card Component
const StatCard = ({ icon, title, value, color }) => (
  <Card className={`${color} border-0`}>
    <CardContent className="p-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-full bg-white/50">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Types
type LoanApplication = {
  clerk_user_id: string;
  name: string;
  status: string;
  created: string;
  loan_amount_requested: number;
};

type ApplicationDetail = {
  clerk_user_id: string;
  profile: {
    name: string;
    gender?: string;
    state?: string;
    occupation?: string;
  };
  applications: Array<{
    raw: any;
    model_output: any;
    created: string;
    status: string;
  }>;
};

type Stats = {
  total_applications: number;
  pending: number;
  approved: number;
  issues: number;
};

// Main Dashboard Component
export default function AdminDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_applications: 0,
    pending: 0,
    approved: 0,
    issues: 0,
  });
  
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remarksInput, setRemarksInput] = useState("");
  const [generatingRemarks, setGeneratingRemarks] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showCreditRisk, setShowCreditRisk] = useState(false);
  const [creditRiskUser, setCreditRiskUser] = useState<{ user: any, model: any, application: any } | null>(null);

  // Add your Gemini API key here
  const GEMINI_API_KEY = "";

  // Show success message temporarily
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // FIXED: Generate AI remarks using Gemini with better error handling
  const generateAIRemarks = async (applicationData, status) => {
    setGeneratingRemarks(true);
    try {
      const prompt = `
        You are a loan assessment AI assistant. Based on the following application data and decision, generate a professional, concise remark for the loan application.

        Application Details:
        - Applicant: ${applicationData.profile?.name || 'Unknown'}
        - Loan Amount: ₹${applicationData.raw?.loan_amount_requested || 'N/A'}
        - Loan Category: ${applicationData.raw?.loan_category || 'N/A'}
        - Region: ${applicationData.raw?.region || 'N/A'}
        - User Type: ${applicationData.raw?.user_type || 'N/A'}
        - Decision: ${status.toUpperCase()}
        
        AI Assessment:
        - Credit Score: ${applicationData.model_output?.final_cibil_score || 'N/A'}
        - Risk Tier: ${applicationData.model_output?.final_tier || 'N/A'}
        - Approval Probability: ${applicationData.model_output?.loan_approval_probability ? (applicationData.model_output.loan_approval_probability * 100).toFixed(1) + '%' : 'N/A'}

        Generate a professional remark (2-3 sentences) explaining the decision. For approved applications, mention document verification requirement. For rejected applications, mention specific concerns. For flagged issues, mention what needs review.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate remarks');
      
      const data = await response.json();
      const generatedRemark = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      setRemarksInput(generatedRemark);
    } catch (err) {
      console.error('Failed to generate AI remarks:', err);
      setError('Failed to generate AI remarks. Please write manually.');
    } finally {
      setGeneratingRemarks(false);
    }
  };

  // FIXED: Fetch summary data with better error handling
  const fetchSummary = async () => {
    try {
      setError("");
      const response = await fetch("http://localhost:8000/admin/applications-summary");
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      setStats({
        total_applications: data.total_applications || 0,
        pending: data.pending || 0,
        approved: data.approved || 0,
        issues: data.issues || 0,
      });
      
      const applicants = data.applicants || [];
      const cleanedApplications = applicants.map(app => ({
        clerk_user_id: app.clerk_user_id || '',
        name: app.name || 'Unknown User',
        status: app.status || 'pending',
        created: app.created || new Date().toISOString(),
        loan_amount_requested: app.loan_amount_requested || 0,
      }));
      
      setApplications(cleanedApplications);
    } catch (err) {
      console.error("Failed to load summary:", err);
      setError(`Failed to load dashboard data: ${err.message}. Make sure your backend is running on localhost:8000`);
    }
  };

  // FIXED: Fetch detailed application data with error handling
  const fetchApplicationDetail = async (clerkUserId) => {
    try {
      setError("");
      const response = await fetch(`http://localhost:8000/admin/applications/${clerkUserId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      setSelectedApplication(data);
    } catch (err) {
      console.error("Failed to load application detail:", err);
      setError(`Failed to load application details: ${err.message}`);
    }
  };

  const openCreditRiskDashboard = (app) => {
    if (!selectedApplication) return;
    
    // Extract user data from the application
    const userData = {
      id: selectedApplication.clerk_user_id,
      name: selectedApplication.profile?.name || "Unknown",
      ageGroup: app.raw?.age_group || "N/A",
      region: app.raw?.region || "N/A",
      occupation: selectedApplication.profile?.occupation || "N/A",
      loanRequested: app.raw?.loan_amount_requested || 0
    };
    
    setCreditRiskUser({ 
      user: userData, 
      model: app.model_output,
      application: app
    });
    setShowCreditRisk(true);
  };

  // FIXED: Update application status with proper timestamp encoding
  const updateApplicationStatus = async (clerkUserId, created, newStatus, remarks = "") => {
    setUpdating(true);
    try {
      setError("");
      
      // Format the created timestamp properly - convert to ISO string if it's a Date object
      let createdTimestamp = created;
      if (created instanceof Date) {
        createdTimestamp = created.toISOString();
      } else if (typeof created === 'string') {
        // Ensure it's properly formatted
        createdTimestamp = created;
      }
      
      console.log("Updating application:", {
        clerkUserId,
        originalTimestamp: created,
        formattedTimestamp: createdTimestamp,
        status: newStatus
      });
      
      const response = await fetch(`http://localhost:8000/admin/applications/${clerkUserId}/${encodeURIComponent(createdTimestamp)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: remarks,
          admin_notes: ""
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed:", errorText);
        throw new Error(`Failed to update status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Update successful:", result);
      
      // Show success message
      showSuccessMessage(`Application ${newStatus} successfully! User will be notified automatically.`);
      
      // Refresh data after update
      await fetchSummary();
      
      // Only refresh detail if modal is still open
      if (selectedApplication?.clerk_user_id === clerkUserId) {
        await fetchApplicationDetail(clerkUserId);
      }
      
      setRemarksInput("");
      setShowCreditRisk(false);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(`Failed to update application status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Handle status update from credit risk dashboard
  const handleCreditRiskStatusUpdate = (status, remarks) => {
    if (!creditRiskUser) return;
    
    updateApplicationStatus(
      creditRiskUser.user.id, 
      creditRiskUser.application.created, 
      status, 
      remarks
    );
  };

  // FIXED: Handle status update with remarks
  const handleStatusUpdate = (clerkUserId, created, newStatus) => {
    if (updating) return; // Prevent double clicks
    
    if (remarksInput.trim()) {
      updateApplicationStatus(clerkUserId, created, newStatus, remarksInput.trim());
    } else {
      // Generate default message based on status
      let defaultRemark = "";
      switch (newStatus) {
        case "approved":
          defaultRemark = "Application approved. Please visit the nearest branch for document verification and loan disbursement.";
          break;
        case "rejected":
          defaultRemark = "Application has been rejected based on our assessment criteria.";
          break;
        case "issue":
          defaultRemark = "Application flagged for manual review due to data inconsistencies.";
          break;
        default:
          defaultRemark = "Application status updated.";
      }
      updateApplicationStatus(clerkUserId, created, newStatus, defaultRemark);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSummary();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Filter applications based on search and status filter
  const filteredApplications = applications.filter((app) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      (app.name && app.name.toLowerCase().includes(searchTerm)) ||
      (app.clerk_user_id && app.clerk_user_id.toLowerCase().includes(searchTerm));
    
    const matchesFilter = filter === "All" || 
      (filter === "pending" && (app.status === "received" || app.status === "pending")) ||
      (filter === "approved" && app.status === "approved") ||
      (filter === "rejected" && app.status === "rejected") ||
      (filter === "issues" && (app.status === "issue" || app.status === "rejected"));
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-500 text-white";
      case "rejected": return "bg-red-500 text-white";
      case "issue": return "bg-orange-500 text-white";
      default: return "bg-yellow-500 text-white";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "received": return "Pending";
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      case "issue": return "Issue";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button variant="outline" onClick={fetchSummary} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="text-green-800">{successMessage}</div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Clock className="text-yellow-600" size={24} />}
          title="Pending Review"
          value={stats.pending}
          color="bg-yellow-50"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" size={24} />}
          title="Approved"
          value={stats.approved}
          color="bg-green-50"
        />
        <StatCard
          icon={<XCircle className="text-red-600" size={24} />}
          title="Issues/Rejected"
          value={stats.issues}
          color="bg-red-50"
        />
        <StatCard
          icon={<AlertTriangle className="text-blue-600" size={24} />}
          title="Total Applications"
          value={stats.total_applications}
          color="bg-blue-50"
        />
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications ({filteredApplications.length})</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="issues">Issues</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No applications found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <div
                  key={`${app.clerk_user_id}-${app.created}`}
                  className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-909">
                      {app.name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {app.clerk_user_id}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        Amount: ₹{app.loan_amount_requested?.toLocaleString() || "0"}
                      </span>
                      <span className="text-sm text-gray-500">
                        Applied: {app.created ? new Date(app.created).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(app.status)}>
                      {getStatusLabel(app.status)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchApplicationDetail(app.clerk_user_id)}
                    >
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Full-Screen Modal */}
      <Dialog
        open={!!selectedApplication}
        onOpenChange={() => setSelectedApplication(null)}
      >
        <DialogContent>
          {selectedApplication && (
            <div className="h-full flex flex-col">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedApplication(null)}
                    className="flex items-center gap-2"
                  >
                    ← Back to Dashboard
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                    <p className="text-gray-600">Complete assessment and model output</p>
                  </div>
                </div>
                {/* Real-time indicator */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Bell className="h-4 w-4" />
                  <span>Updates sent instantly to user</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* User Profile Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">User Profile</h3>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <strong className="text-blue-900">Name:</strong>
                        <p className="text-blue-800">{selectedApplication.profile?.name || "Unknown User"}</p>
                      </div>
                      <div>
                        <strong className="text-blue-900">User ID:</strong>
                        <p className="text-blue-800 text-sm font-mono">{selectedApplication.clerk_user_id}</p>
                      </div>
                      {selectedApplication.profile?.state && (
                        <div>
                          <strong className="text-blue-900">State:</strong>
                          <p className="text-blue-800">{selectedApplication.profile.state}</p>
                        </div>
                      )}
                      {selectedApplication.profile?.occupation && (
                        <div>
                          <strong className="text-blue-900">Occupation:</strong>
                          <p className="text-blue-800">{selectedApplication.profile.occupation}</p>
                        </div>
                      )}
                      {selectedApplication.profile?.gender && (
                        <div>
                          <strong className="text-blue-900">Gender:</strong>
                          <p className="text-blue-800">{selectedApplication.profile.gender}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Applications Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Loan Applications ({selectedApplication.applications.length})
                  </h3>
                  
                  {selectedApplication.applications
                  .filter(app => app.model_output && !app.model_output.error)
                  .map((app, index) => (
                    <div key={index} className="border-2 rounded-xl overflow-hidden">
                      {/* Application Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              Application #{index + 1}
                            </h4>
                            <p className="text-gray-600">
                              Applied: {app.created ? new Date(app.created).toLocaleString() : "N/A"}
                            </p>
                          </div>
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusLabel(app.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Basic Application Info */}
                        <div>
                          <h5 className="text-lg font-semibold mb-3 text-gray-900">Application Details</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded">
                              <strong className="text-gray-700">Loan Amount:</strong>
                              <p className="text-lg font-bold text-green-600">
                                ₹{app.raw?.loan_amount_requested?.toLocaleString() || "N/A"}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <strong className="text-gray-700">Category:</strong>
                              <p className="font-medium">{app.raw?.loan_category || "N/A"}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <strong className="text-gray-700">Region:</strong>
                              <p className="font-medium">{app.raw?.region || "N/A"}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <strong className="text-gray-700">User Type:</strong>
                              <p className="font-medium">{app.raw?.user_type || "N/A"}</p>
                            </div>
                          </div>
                        </div>

                        {/* AI Model Output */}
                        {app.model_output && !app.model_output.error && (
                          <div>
                            <h5 className="text-lg font-semibold mb-4 text-gray-900">AI Assessment Results</h5>
                            
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              {app.model_output.final_cibil_score && (
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                  <h6 className="font-semibold text-blue-900 mb-1">Credit Score</h6>
                                  <p className="text-2xl font-bold text-blue-700">
                                    {app.model_output.final_cibil_score}
                                  </p>
                                  <p className="text-sm text-blue-600">Bharat Score</p>
                                </div>
                              )}
                              
                              {app.model_output.final_tier && (
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                  <h6 className="font-semibold text-purple-900 mb-1">Risk Tier</h6>
                                  <p className="text-xl font-bold text-purple-700">
                                    {app.model_output.final_tier}
                                  </p>
                                  <p className="text-sm text-purple-600">Risk Category</p>
                                </div>
                              )}
                              
                              {app.model_output.loan_approval_probability !== undefined && (
                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                  <h6 className="font-semibold text-green-900 mb-1">Approval Probability</h6>
                                  <p className="text-2xl font-bold text-green-700">
                                    {(app.model_output.loan_approval_probability * 100).toFixed(1)}%
                                  </p>
                                  <p className="text-sm text-green-600">Likelihood</p>
                                </div>
                              )}
                            </div>

                            {/* Additional Model Data */}
                            {(app.model_output.monthly_income || app.model_output.debt_to_income_ratio) && (
                              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h6 className="font-semibold text-gray-900 mb-3">Financial Assessment</h6>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  {app.model_output.monthly_income && (
                                    <div>
                                      <strong className="text-gray-700">Monthly Income:</strong>
                                      <p className="font-medium">₹{app.model_output.monthly_income.toLocaleString()}</p>
                                    </div>
                                  )}
                                  {app.model_output.debt_to_income_ratio && (
                                    <div>
                                      <strong className="text-gray-700">Debt to Income:</strong>
                                      <p className="font-medium">{(app.model_output.debt_to_income_ratio * 100).toFixed(1)}%</p>
                                    </div>
                                  )}
                                  {app.model_output.employment_stability && (
                                    <div>
                                      <strong className="text-gray-700">Employment Stability:</strong>
                                      <p className="font-medium">{app.model_output.employment_stability}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t flex-wrap">
                          
                         
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(selectedApplication.clerk_user_id, app.created, "issue")}
                            className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                            disabled={updating}
                          >
                            {updating ? (
                              <RefreshCw className="animate-spin" size={16} />
                            ) : (
                              <AlertTriangle size={16} />
                            )}
                            {updating ? "Processing..." : "Flag Issue"}
                          </Button>
                          
                          {/* Credit Risk Analysis Button */}
                          <Button
                            variant="outline"
                            onClick={() => openCreditRiskDashboard(app)}
                            className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <TrendingUp size={16} />
                            Credit Risk Analysis
                          </Button>
                        </div>

                        {/* Raw Application Data (Collapsible) */}
                        <details className="border rounded-lg">
                          <summary className="p-4 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                            View Raw Application Data
                          </summary>
                          <div className="p-4 bg-white">
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                              {JSON.stringify(app.raw, null, 2)}
                            </pre>
                          </div>
                        </details>

                        {/* Raw Model Output (Collapsible) */}
                        <details className="border rounded-lg">
                          <summary className="p-4 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                            View AI Model Output
                          </summary>
                          <div className="p-4 bg-white">
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                              {JSON.stringify(app.model_output, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                  
                  {/* No valid applications message */}
                  {selectedApplication.applications.filter(app => app.model_output && !app.model_output.error).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No valid applications found for this user</p>
                      <p className="text-sm">Applications may have processing errors</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credit Risk Dashboard Modal */}
      {showCreditRisk && creditRiskUser && (
        <CreditRiskDashboard 
          clerkUserId={creditRiskUser.user.id} 
          userData={creditRiskUser.user}
          modelOutput={creditRiskUser.model}
          onClose={() => setShowCreditRisk(false)}
          applicationData={creditRiskUser.application}
          onStatusUpdate={handleCreditRiskStatusUpdate}
          updating={updating}
        />
      )}
    </div>
  );
}