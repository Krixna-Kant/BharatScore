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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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

  // Reusable Input and Select components for consistent styling
  const InputField = ({ label, ...props }) => (
    <div>
      <label className="block text-gray-700 text-sm font-semibold mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:outline-none transition-colors duration-200"
      />
    </div>
  );

  const SelectField = ({ label, options, ...props }) => (
    <div>
      <label className="block text-gray-700 text-sm font-semibold mb-2">{label}</label>
      <select
        {...props}
        className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:outline-none transition-colors duration-200 bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center bg-white bg-opacity-95 shadow-2xl rounded-3xl p-8 sm:p-10 border-4 border-white">
          <p className="text-lg font-medium text-gray-800">Please sign in to complete your profile.</p>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <p className="text-xl text-gray-700 font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white bg-opacity-95 shadow-2xl rounded-3xl p-8 sm:p-10 border-4 border-white">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-md text-gray-600">
            Provide your basic details to get started with BharatScore.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <InputField
            label="Full Name *"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <SelectField
            label="Gender *"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            options={[
              { value: "", label: "Select Gender", disabled: true },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />

          <InputField
            label="State *"
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            placeholder="e.g. Uttar Pradesh"
          />

          <InputField
            label="Occupation *"
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            required
            placeholder="e.g. Farmer"
          />

          <div className="flex gap-4 pt-4">
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
    </div>
  );
};

export default ProfileForm;