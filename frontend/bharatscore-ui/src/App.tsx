import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SignedIn } from "@clerk/clerk-react";

// User's existing component imports
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import SignInPage from "./components/SignInPage";
import ProfileForm from "./components/ProfileForm";
import Dashboard from "./components/Dashboard";
import Redirector from "./components/Redirector";
import ApplyForm from "./components/ApplyForm";
import BehavioralPsychometricTest from "./components/psychometricTest";

// New page imports from the template.
// NOTE: You will need to create or import these files if they don't exist.
import Applications from "./components/Applications";
import Support from "./components/Support";
import AdminDashboard from "./components/AdminDashboard";
import NotFound from "./components/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* These components are for displaying toasts and tooltips globally */}
        <Toaster />
        <Sonner />
        {/* The BrowserRouter is now in main.jsx, so we remove it here */}
        <Routes>
          {/* Public and Clerk Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/redirector" element={<Redirector />} />

          {/* Protected Routes (require sign-in) */}
          <Route
            path="/profile"
            element={
              <SignedIn>
                <ProfileForm />
              </SignedIn>
            }
          />
          <Route
            path="/dashboard"
            element={
              <SignedIn>
                <Dashboard />
              </SignedIn>
            }
          />
          <Route
            path="/apply"
            element={
              <SignedIn>
                <ApplyForm />
              </SignedIn>
            }
          />
          <Route
            path="/psychometric-test"
            element={
              <SignedIn>
                <BehavioralPsychometricTest />
              </SignedIn>
            }
          />
          
          {/* Newly Integrated Routes */}
          <Route
            path="/applications"
            element={
              <SignedIn>
                <Applications />
              </SignedIn>
            }
          />
          <Route
            path="/support"
            element={
              <SignedIn>
                <Support />
              </SignedIn>
            }
          />
          <Route
            path="/admin"
            element={
              <SignedIn>
                <AdminDashboard />
              </SignedIn>
            }
          />

          {/* The catch-all route handles non-existent paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
