import React, { useEffect, useState } from "react";
import { useUser, useClerk, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface Prediction {
  risk_tier: string;
  pd: number;
  prediction: string;
}

interface Application {
  created: string;
  status: string;
  prediction?: Prediction;
}

interface Profile {
  name: string;
  gender: string;
  state: string;
  occupation: string;
}

const Dashboard = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/profile?clerk_user_id=${user.id}`
        );
        const data = await res.json();
        if (data.has_profile) {
          setProfile(data.profile);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Fetch applications
  useEffect(() => {
    if (!user) return;
    const fetchApps = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/users?clerk_user_id=${user.id}`
        );
        const data = await res.json();
        if (data.users) {
          setApplications(data.users);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApps();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* Clerk's built-in signout button */}
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="mb-8 p-4 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
        {loadingProfile ? (
          <p>Loading profile...</p>
        ) : profile ? (
          <div className="space-y-1">
            <p><span className="font-medium">Name:</span> {profile.name}</p>
            <p><span className="font-medium">Gender:</span> {profile.gender}</p>
            <p><span className="font-medium">State:</span> {profile.state}</p>
            <p><span className="font-medium">Occupation:</span> {profile.occupation}</p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <p>No profile found. <button onClick={() => navigate("/profile")} className="text-orange-600 underline">Create Profile</button></p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Applications</h2>
            <button
            onClick={() => navigate("/apply")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
                Apply
            </button>
        </div>
        
        {/* <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
        <button
      onClick={() => navigate("/apply")}
      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
        Apply
        </button> */}
        {loadingApps ? (
          <p>Loading your applications...</p>
        ) : applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <ul className="space-y-4">
            {applications.map((app, idx) => (
              <li key={idx} className="p-4 border rounded-lg shadow-sm">
                <p>
                  <span className="font-semibold">Submitted At:</span>{" "}
                  {new Date(app.created).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {app.status}
                </p>
                {app.prediction && (
                  <>
                    <p>
                      <span className="font-semibold">Risk Tier:</span>{" "}
                      {app.prediction.risk_tier}
                    </p>
                    <p>
                      <span className="font-semibold">PD:</span>{" "}
                      {app.prediction.pd}
                    </p>
                    <p>
                      <span className="font-semibold">Prediction:</span>{" "}
                      {app.prediction.prediction}
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
