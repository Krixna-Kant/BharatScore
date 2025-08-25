import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    state: "",
    occupation: "",
  });
  const [fetching, setFetching] = useState(true);

  // Load existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        console.log("Checking user profile for:", user.id);
        const res = await fetch(
          `http://127.0.0.1:8000/profile?clerk_user_id=${user.id}`
        );
        const data = await res.json();
        console.log("Backend response:", data);

        if (data?.has_profile && data.profile) {
          setFormData({
            name: data.profile.name || "",
            gender: data.profile.gender || "",
            state: data.profile.state || "",
            occupation: data.profile.occupation || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to submit.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        clerk_user_id: user.id,
        ...formData,
      };

      const response = await fetch("http://127.0.0.1:8000/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profile saved!");
        navigate("/dashboard");
      } else {
        throw new Error(data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
        <p>Please sign in to complete your profile.</p>
      </div>
    );
  }

  if (fetching) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Edit Your Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            placeholder="e.g. Uttar Pradesh"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Occupation *
          </label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            required
            placeholder="e.g. Farmer"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
