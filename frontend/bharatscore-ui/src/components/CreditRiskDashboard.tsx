// CreditRiskDashboard.tsx
import React, { useState, useEffect } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  ageGroup: string;
  region: string;
  occupation?: string;
  loanRequested: number;
  //... other fields
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
  modelOutput: ModelOutput;
  onClose: () => void;
}

export default function CreditRiskDashboard({
  clerkUserId,
  userData,
  modelOutput,
  onClose,
}: CreditRiskDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string>("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("English");

  const languages = ["English", "Hindi", "Tamil", "Bengali"];

  const buildGeminiPrompt = () => `
  You are a senior financial analyst AI specializing in credit risk assessment for a banking institution. 
  Your task is to provide a comprehensive credit risk analysis based on the following application data and model output.
  
  Generate the full report in **${language}** language.

  **APPLICATION DATA:**
  ${JSON.stringify(userData, null, 2)}
  
  **AI MODEL ASSESSMENT:**
  ${JSON.stringify(modelOutput, null, 2)}
  
  Please generate a detailed credit risk report with the following structure in English and Hindi:
  
  1. **EXECUTIVE SUMMARY**
     - Brief overview of the applicant's creditworthiness
     - Key risk factors and positive indicators
     - Overall recommendation (Approve/Reject/Review)
  
  2. **CREDIT SCORE ANALYSIS**
     - Analysis of the ${modelOutput.final_cibil_score} credit score
     - Comparison to industry benchmarks
  
  3. **RISK TIER ASSESSMENT** 
     - Explanation of the "${modelOutput.final_tier}" risk classification
     - Factors contributing to this classification
  
  4. **FINANCIAL CAPACITY EVALUATION**
     - Income analysis: ${
       modelOutput.monthly_income
         ? "₹" + modelOutput.monthly_income.toLocaleString()
         : "Not available"
     }
     - Debt-to-income ratio: ${
       modelOutput.debt_to_income_ratio
         ? (modelOutput.debt_to_income_ratio * 100).toFixed(1) + "%"
         : "Not available"
     }
     - Employment stability: ${modelOutput.employment_stability || "Not available"}
     - Loan amount requested: ₹${userData.loanRequested.toLocaleString()}
  
  5. **STRENGTHS**
     - List 3-5 positive factors supporting approval
  
  6. **CONCERNS & RISK FACTORS**
     - List 3-5 risk factors that need consideration
  
  7. **RECOMMENDATION & NEXT STEPS**
     - Clear recommendation: Approve/Reject/Review
  
  8. **MONITORING SUGGESTIONS**
     - Key indicators to monitor if approved
  `;

  useEffect(() => {
    async function fetchAiReport() {
      try {
        setLoading(true);
        setError("");

        const prompt = buildGeminiPrompt();

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCt5_MkrbvNK5ICB6pr-izCn5QhDGgAnzo`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`AI API Error: ${text}`);
        }

        const data = await res.json();
        const aiText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No report generated";

        setAiReport(aiText);
      } catch (e) {
        setError(`Failed to load AI report: ${e}`);
      } finally {
        setLoading(false);
      }
    }
    fetchAiReport();
  }, [clerkUserId, language]); // 🔑 re-fetch when language changes

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-bold">
            Credit Risk Report for {userData.name}
          </h1>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded p-2 ml-4"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
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
            <div className="error p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          ) : (
            <>
              {/* AI Report */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <Sparkles className="mr-2" /> AI Analysis
                </h2>
                <div className="whitespace-pre-wrap">{aiReport}</div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Credit Score
                  </h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {modelOutput.final_cibil_score}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-1">
                    Risk Tier
                  </h3>
                  <p className="text-xl font-bold text-purple-700">
                    {modelOutput.final_tier}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-1">
                    Approval Probability
                  </h3>
                  <p className="text-2xl font-bold text-green-700">
                    {(modelOutput.loan_approval_probability * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Additional Financial Data */}
              {(modelOutput.monthly_income ||
                modelOutput.debt_to_income_ratio) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-3">
                    Financial Assessment
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {modelOutput.monthly_income && (
                      <div>
                        <strong className="text-gray-700">
                          Monthly Income:
                        </strong>
                        <p className="font-medium">
                          ₹{modelOutput.monthly_income.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {modelOutput.debt_to_income_ratio && (
                      <div>
                        <strong className="text-gray-700">
                          Debt to Income:
                        </strong>
                        <p className="font-medium">
                          {(modelOutput.debt_to_income_ratio * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {modelOutput.employment_stability && (
                      <div>
                        <strong className="text-gray-700">
                          Employment Stability:
                        </strong>
                        <p className="font-medium">
                          {modelOutput.employment_stability}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Information */}
              <div className="border rounded-lg p-4">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
