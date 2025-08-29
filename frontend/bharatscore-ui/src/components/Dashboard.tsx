import React, { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
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

  // Helper component to display loading state
  const LoadingState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center p-8 text-gray-600">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white bg-opacity-95 shadow-2xl rounded-3xl p-8 sm:p-10 border-4 border-white mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Your Profile</h2>
            <button
              onClick={() => navigate("/profile")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors shadow"
            >
              Edit Profile
            </button>
          </div>
          {loadingProfile ? (
            <LoadingState message="Loading profile details..." />
          ) : profile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700">
              <p><span className="font-semibold text-gray-900">Name:</span> {profile.name}</p>
              <p><span className="font-semibold text-gray-900">Gender:</span> {profile.gender}</p>
              <p><span className="font-semibold text-gray-900">State:</span> {profile.state}</p>
              <p><span className="font-semibold text-gray-900">Occupation:</span> {profile.occupation}</p>
            </div>
          ) : (
            <div className="text-center text-lg text-gray-600">
              <p className="mb-4">No profile found. Please create one to continue.</p>
              <button
                onClick={() => navigate("/profile")}
                className="text-orange-600 underline font-semibold"
              >
                Create Profile
              </button>
            </div>
          )}
        </div>

        {/* Applications Section */}
        <div className="bg-white bg-opacity-95 shadow-2xl rounded-3xl p-8 sm:p-10 border-4 border-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Applications</h2>
            <div className="flex space-x-4">
                <button
                onClick={() => navigate("/apply")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition-colors shadow"
                >
                Apply Now
                </button>
                <button
                onClick={() => navigate("/psychometric-test")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors shadow"
                >
                Take Psychometric Test
                </button>
            </div>
          </div>

          {loadingApps ? (
            <LoadingState message="Loading your applications..." />
          ) : applications.length === 0 ? (
            <div className="text-center text-lg text-gray-600">
              <p>You have not submitted any applications yet.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {applications.map((app, idx) => (
                <li key={idx} className="bg-orange-50 p-6 rounded-2xl shadow-md border-2 border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base text-gray-800">
                    <p>
                      <span className="font-semibold text-gray-900">Application Date:</span>{" "}
                      {new Date(app.created).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Status:</span>{" "}
                      <span className="font-bold text-green-700">{app.status}</span>
                    </p>
                    {app.prediction && (
                      <>
                        <p>
                          <span className="font-semibold text-gray-900">Risk Tier:</span>{" "}
                          <span className="font-bold text-orange-700">{app.prediction.risk_tier}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">Bharat Score:</span>{" "}
                          <span className="font-bold">{Math.round(app.prediction.pd * 1000)}</span>
                        </p>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;