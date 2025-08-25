import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import SignInPage from "./components/SignInPage";
import ProfileForm from "./components/ProfileForm"; 
import Dashboard from "./components/Dashboard"; 
import Redirector from "./components/Redirector";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Clerk Auth Pages */}
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

      {/* Redirect if not logged in */}
      <Route
        path="*"
        element={
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        }
      />
    </Routes>
  );
}

export default App;
