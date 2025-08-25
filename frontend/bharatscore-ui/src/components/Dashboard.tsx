import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

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

const Dashboard = () => {
  const { user } = useUser(); 
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/users?clerk_user_id=${user.id}`
        );
        const data = await response.json();

        if (data.users) {
          setApplications(data.users);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error("Error fetching user applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <p className="text-center mt-10">Loading your applications...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Your Applications</h2>

      {applications.length === 0 ? (
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
  );
};

export default Dashboard;
