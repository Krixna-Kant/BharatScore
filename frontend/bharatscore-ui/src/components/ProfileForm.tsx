import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import AadhaarVerification from "./AdharVerification";
import { User, Mail, Phone, MapPin, Briefcase, Users, CheckCircle } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  occupation: string;
  gender: string;
  dateOfBirth: string;
}

const ProfileForm: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    aadhaarNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    occupation: "",
    gender: "",
    dateOfBirth: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isValidAadhaar, setIsValidAadhaar] = useState<boolean | null>(null);
  const [aadhaarError, setAadhaarError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Indian states list
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
  ];

  // Common occupations
  const occupations = [
    "Student", "Software Engineer", "Teacher", "Doctor", "Nurse", "Lawyer",
    "Business Owner", "Manager", "Sales Executive", "Accountant", "Engineer",
    "Consultant", "Designer", "Writer", "Artist", "Farmer", "Government Employee",
    "Retired", "Unemployed", "Other"
  ];

  // Load existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/profile?clerk_user_id=${user.id}`
        );
        const data = await res.json();
        if (data?.has_profile && data.profile) {
          setProfile((prev) => ({
            ...prev,
            name: data.profile.name || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
            gender: data.profile.gender || "",
            state: data.profile.state || "",
            occupation: data.profile.occupation || "",
            aadhaarNumber: data.profile.aadhaarNumber || "",
            address: data.profile.address || "",
            city: data.profile.city || "",
            pincode: data.profile.pincode || "",
            dateOfBirth: data.profile.dateOfBirth || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Aadhaar validation function
  const validateAadhaar = (aadhaar: string): boolean => {
    const cleanAadhaar = aadhaar.replace(/[\s-]/g, '');
    
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return false;
    }

    // Verhoeff algorithm for Aadhaar validation
    const verhoeffTable = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];

    const permutationTable = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];

    let checksum = 0;
    const reversedDigits = cleanAadhaar.split('').map(Number).reverse();

    for (let i = 0; i < reversedDigits.length; i++) {
      checksum = verhoeffTable[checksum][permutationTable[i % 8][reversedDigits[i]]];
    }

    return checksum === 0;
  };

  const cleanAadhaarNumber = (aadhaar: string): string => {
    const cleaned = aadhaar.replace(/\D/g, '');
    return cleaned.substring(0, 12);
  };

  const formatAadhaarDisplay = (aadhaar: string): string => {
    const cleaned = cleanAadhaarNumber(aadhaar);
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAadhaarExtracted = (extractedAadhaar: string, extractedData?: any) => {
    console.log("Raw OCR extracted Aadhaar:", extractedAadhaar);
    console.log("Extracted data:", extractedData);
    
    const cleanedAadhaar = cleanAadhaarNumber(extractedAadhaar);
    
    if (cleanedAadhaar.length === 12) {
      setProfile((prev) => ({
        ...prev,
        aadhaarNumber: cleanedAadhaar,
        // Auto-fill extracted data if available
        ...(extractedData?.name && !prev.name && { name: extractedData.name }),
        ...(extractedData?.address && !prev.address && { address: extractedData.address }),
        ...(extractedData?.pincode && !prev.pincode && { pincode: extractedData.pincode }),
      }));
      
      const isValid = validateAadhaar(cleanedAadhaar);
      setIsValidAadhaar(isValid);
      
      if (!isValid) {
        setAadhaarError("Invalid Aadhaar number. Please verify the extracted number.");
      } else {
        setAadhaarError("");
      }
    } else {
      setAadhaarError(`Incomplete Aadhaar number extracted (${cleanedAadhaar.length} digits). Please try again.`);
      setIsValidAadhaar(false);
    }
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = cleanAadhaarNumber(value);
    
    setProfile((prev) => ({ ...prev, aadhaarNumber: cleaned }));
    
    if (cleaned.length === 12) {
      const isValid = validateAadhaar(cleaned);
      setIsValidAadhaar(isValid);
      setAadhaarError(isValid ? "" : "Invalid Aadhaar number");
    } else {
      setIsValidAadhaar(null);
      setAadhaarError(cleaned.length > 0 ? "Aadhaar number must be 12 digits" : "");
    }
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      return !!(profile.name && profile.email && profile.phone && isValidAadhaar);
    } else if (currentStep === 2) {
      return !!(profile.address && profile.city && profile.state && profile.pincode);
    } else if (currentStep === 3) {
      return !!(profile.occupation && profile.gender);
    }
    return false;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      setAadhaarError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch("http://localhost:8000/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_user_id: user?.id || "user_123",
          ...profile,
          aadhaar_number: profile.aadhaarNumber,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        console.log("Profile stored:", data);
        setSubmitted(true);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to submit profile");
      }
    } catch (err) {
      console.error("Error submitting profile:", err);
      setAadhaarError("Failed to submit profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Input component
  const InputField: React.FC<{
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readOnly?: boolean;
  }> = ({ label, ...props }) => (
    <div>
      <label className="block text-gray-700 text-sm font-semibold mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:outline-none transition-colors duration-200"
      />
    </div>
  );

  // Reusable Select component
  const SelectField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
  }> = ({ label, options, ...props }) => (
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
    return <p>Please sign in to complete your profile.</p>;
  }

  if (fetching) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
      
      {submitted ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-600 mb-2">Profile Submitted Successfully!</h3>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Aadhaar Verification Section */}
          <AadhaarVerification onExtract={handleAadhaarExtracted} />

          {/* Aadhaar Number Input */}
          <InputField
            label="Aadhaar Number"
            name="aadhaarNumber"
            value={formatAadhaarDisplay(profile.aadhaarNumber)}
            onChange={handleAadhaarChange}
            placeholder="1234 5678 9012"
            readOnly={profile.aadhaarNumber.length === 12}
          />
          
          {aadhaarError && (
            <p className="text-red-500 text-sm mt-1">{aadhaarError}</p>
          )}

          {/* Basic Information */}
          <InputField
            label="Full Name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <InputField
            label="Phone"
            name="phone"
            type="tel"
            value={profile.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />

          <InputField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={profile.dateOfBirth}
            onChange={handleChange}
          />

          {/* Address Information */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Address</label>
            <textarea
              name="address"
              value={profile.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:outline-none transition-colors duration-200"
            />
          </div>

          <InputField
            label="City"
            name="city"
            value={profile.city}
            onChange={handleChange}
            placeholder="Enter your city"
          />

          <SelectField
            label="State"
            name="state"
            value={profile.state}
            onChange={handleChange}
            options={[
              { value: "", label: "Select State", disabled: true },
              ...indianStates.map(state => ({ value: state, label: state }))
            ]}
          />

          <InputField
            label="PIN Code"
            name="pincode"
            value={profile.pincode}
            onChange={handleChange}
            placeholder="Enter PIN code"
          />

          {/* Personal Information */}
          <SelectField
            label="Gender"
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            options={[
              { value: "", label: "Select Gender", disabled: true },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" }
            ]}
          />

          <SelectField
            label="Occupation"
            name="occupation"
            value={profile.occupation}
            onChange={handleChange}
            options={[
              { value: "", label: "Select Occupation", disabled: true },
              ...occupations.map(occupation => ({ value: occupation, label: occupation }))
            ]}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileForm;