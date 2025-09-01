import React, { useState, useEffect } from "react";
import { User, RefreshCw, Sparkles, Shield, TrendingUp } from "lucide-react";

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

export default function CreditRiskDashboard({ clerkUserId, userData, modelOutput, onClose }: CreditRiskDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string>("");
  const [error, setError] = useState<string>("");

  const buildGeminiPrompt = () => `
You are a financial analyst AI.
Here is user data: ${JSON.stringify(userData)}
Here is model output: ${JSON.stringify(modelOutput)}

Write a concise credit risk report including summary, strengths, weaknesses, and recommendation.
`;

  useEffect(() => {
    async function fetchAiReport() {
      try {
        setLoading(true);
        setError("");

        const prompt = buildGeminiPrompt();

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`,
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
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No report generated";

        setAiReport(aiText);
      } catch (e) {
        setError(`Failed to load AI report: ${e}`);
      } finally {
        setLoading(false);
      }
    }
    fetchAiReport();
  }, [clerkUserId]);

  if (loading) return <div>Loading AI report...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="credit-risk-dashboard">
      <button onClick={onClose}>Close</button>
      <h1>Credit Risk Report for {userData.name}</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{aiReport}</pre>

      {/* Display stats */}
      <div>
        <p>Credit Score: {modelOutput.final_cibil_score}</p>
        <p>Risk Tier: {modelOutput.final_tier}</p>
        <p>Approval Probability: {(modelOutput.loan_approval_probability * 100).toFixed(1)}%</p>
        {/* etc */}
      </div>
    </div>
  );
}
