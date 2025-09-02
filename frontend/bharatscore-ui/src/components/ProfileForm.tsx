import React, { useState, useEffect } from "react";
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
          clerk_user_id: "user_123", // Replace with actual user ID
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
          // Replace with your actual routing logic
          window.location.href = "/dashboard"; // or use React Router: navigate('/dashboard')
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

  const handleReset = () => {
    setProfile({
      name: "", email: "", phone: "", aadhaarNumber: "", address: "",
      city: "", state: "", pincode: "", occupation: "", gender: "", dateOfBirth: ""
    });
    setSubmitted(false);
    setIsValidAadhaar(null);
    setAadhaarError("");
    setCurrentStep(1);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Created Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your profile has been saved. Redirecting to dashboard...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Basic Information' : 
              currentStep === 2 ? 'Address Details' : 
              'Additional Information'
            }
          </div>
        </div>

        {/* Aadhaar Verification - Only show in step 1 */}
        {currentStep === 1 && (
          <div className="mb-8">
            <AadhaarVerification onAadhaarExtracted={handleAadhaarExtracted} />
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Create Your Profile
            </h1>
            <p className="text-center text-blue-100 mt-2">
              Please fill in all the required information
            </p>
          </div>

          <div className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={formatAadhaarDisplay(profile.aadhaarNumber)}
                      onChange={handleAadhaarChange}
                      maxLength={14}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        profile.aadhaarNumber 
                          ? isValidAadhaar 
                            ? 'bg-green-50 border-green-300 text-green-800' 
                            : 'bg-red-50 border-red-300 text-red-800'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      } shadow-sm`}
                      placeholder="Upload Aadhaar or enter manually"
                      required
                    />
                    
                    {profile.aadhaarNumber && (
                      <div className="mt-2 flex items-center">
                        {isValidAadhaar ? (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Valid Aadhaar number
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            Invalid Aadhaar number
                          </div>
                        )}
                      </div>
                    )}
                    
                    {aadhaarError && (
                      <p className="mt-2 text-sm text-red-600">{aadhaarError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      Complete Address *
                    </label>
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors resize-none"
                      placeholder="House No, Street, Area, Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={profile.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                        placeholder="Enter your city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        name="state"
                        value={profile.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={profile.pincode}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{6}"
                        maxLength={6}
                        className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                        placeholder="6-digit PIN code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Occupation *
                    </label>
                    <select
                      name="occupation"
                      value={profile.occupation}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                    >
                      <option value="">Select Occupation</option>
                      {occupations.map((occupation) => (
                        <option key={occupation} value={occupation}>
                          {occupation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 mr-2" />
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth (Optional)
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 shadow-sm transition-colors"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 font-medium rounded-xl transition duration-300 ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition duration-300"
                >
                  Reset
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateCurrentStep()}
                    className={`px-8 py-3 font-semibold rounded-xl transition duration-300 ${
                      validateCurrentStep()
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!validateCurrentStep() || isSubmitting}
                    className={`px-8 py-3 font-semibold rounded-xl transition duration-300 ${
                      validateCurrentStep() && !isSubmitting
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Profile...
                      </div>
                    ) : (
                      'Create Profile'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Form Validation Message */}
            {!validateCurrentStep() && currentStep > 1 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm text-center">
                  Please fill in all required fields to continue
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;