import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface Question {
  id: number;
  trait: string;
  text: string;
  options?: string[];
  type: "single_choice" | "likert";
  reverse?: boolean;
}

const questions: Question[] = [
  { id: 1, trait: "Responsibility", text: "When given multiple tasks with deadlines, how do you usually prioritize them?", options: ["Complete earliest due first", "Do easiest first", "Leave until last"], type: "single_choice" },
  { id: 2, trait: "Conscientiousness", text: "How often do you track or review your daily spending?", options: ["Daily", "Weekly", "Sometimes", "Rarely", "Never"], type: "single_choice" },
  { id: 3, trait: "Self-control", text: "I find it difficult to resist small daily temptations.", type: "likert", reverse: true },
  { id: 4, trait: "Honesty", text: "If you found a wallet with money and no ID, what would you do?", options: ["Keep the money", "Leave it", "Try to find the owner or hand it to authorities"], type: "single_choice" },
  { id: 5, trait: "Adaptability", text: "I handle unexpected changes in plans calmly.", type: "likert" },
  { id: 6, trait: "Risk Tolerance", text: "I enjoy activities that involve some uncertainty or challenge.", type: "likert" },
  { id: 7, trait: "Responsibility", text: "How often do you set personal goals and complete them fully?", options: ["Always", "Most of the time", "Sometimes", "Rarely", "Never"], type: "single_choice" },
];

const scoringMap: Record<number, number[]> = {
  1: [5, 3, 1],
  2: [5, 4, 3, 2, 1],
  4: [1, 2, 5],
  7: [5, 4, 3, 2, 1],
};

export default function BehavioralPsychometricTest() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [canTakeTest, setCanTakeTest] = useState(true);
  const [nextEligibleDate, setNextEligibleDate] = useState<Date | null>(null);

  // Fetch user's psychometric test status
  useEffect(() => {
    if (!user) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/psychometric-status?clerk_user_id=${user.id}`);
        const data = await res.json();
        if (data.completed && data.last_test_date) {
          const lastTest = new Date(data.last_test_date);
          const now = new Date();
          const diffDays = (now.getTime() - lastTest.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 30) {
            setCanTakeTest(false);
            setNextEligibleDate(new Date(lastTest.getTime() + 30 * 24 * 60 * 60 * 1000));
          }
        }
      } catch (err) {
        console.error("Error fetching psychometric status:", err);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, [user]);

  function handleLikertChange(qId: number, value: number) {
    setAnswers({ ...answers, [qId]: value });
  }

  function handleSingleChoiceChange(qId: number, idx: number) {
    setAnswers({ ...answers, [qId]: idx });
  }

  function calculateScore() {
    let traitTotals: Record<string, number> = {};
    let totalPoints = 0;
    let totalMax = 0;

    questions.forEach(q => {
      let ans = answers[q.id] ?? 0;
      let score = 0;
      const maxScore = 5;

      if (q.type === "likert") {
        score = ans;
        if (q.reverse) score = maxScore + 1 - score;
      } else if (q.type === "single_choice") {
        const map = scoringMap[q.id];
        score = map && ans < map.length ? map[ans] : 0;
      }

      traitTotals[q.trait] = (traitTotals[q.trait] || 0) + score;
      totalPoints += score;
      totalMax += maxScore;
    });

    const normalizedTraits: Record<string, number> = {};
    Object.keys(traitTotals).forEach(trait => {
      const count = questions.filter(q => q.trait === trait).length;
      normalizedTraits[trait] = traitTotals[trait] / (count * 5); // float between 0–1
    });

    const compositeScore = totalPoints / totalMax; // 0–1
    return { normalizedTraits, compositeScore };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    const { compositeScore } = calculateScore();

    try {
      await fetch(`http://127.0.0.1:8000/save-psychometric`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_user_id: user?.id, psychometric_score: compositeScore }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error saving psychometric score:", err);
      alert("Failed to save your score. Please try again.");
    }
  }

  if (loadingStatus) return <p>Loading test eligibility...</p>;
  if (!canTakeTest && nextEligibleDate)
    return (
      <div className="text-center p-10">
        <p className="text-lg text-gray-700 mb-4">
          You have already taken the psychometric test. Next eligible date:{" "}
          {nextEligibleDate.toLocaleDateString()}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold shadow"
        >
          Back to Dashboard
        </button>
      </div>
    );

  const { normalizedTraits, compositeScore } = submitted ? calculateScore() : { normalizedTraits: {}, compositeScore: 0 };

  const LikertScale = ({ qId, checkedValue, onChange, disabled }: any) => (
    <div className="flex justify-between items-center text-sm font-medium text-gray-600 mt-2">
      <span className="w-1/6 text-left">Strongly Disagree</span>
      {[1, 2, 3, 4, 5].map(i => (
        <label key={i} className="flex flex-col items-center">
          <input
            type="radio"
            name={`q${qId}`}
            value={i}
            checked={checkedValue === i}
            onChange={onChange}
            disabled={disabled}
            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500"
          />
          <span className="mt-1">{i}</span>
        </label>
      ))}
      <span className="w-1/6 text-right">Strongly Agree</span>
    </div>
  );

  const SingleChoice = ({ qId, options, checkedValue, onChange, disabled }: any) => (
    <div className="space-y-3 mt-2">
      {options.map((opt: string, idx: number) => (
        <label key={idx} className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name={`q${qId}`}
            checked={checkedValue === idx}
            onChange={() => onChange(qId, idx)}
            disabled={disabled}
            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500"
          />
          <span className="text-base text-gray-800 font-medium">{opt}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white bg-opacity-95 shadow-2xl rounded-3xl p-8 sm:p-10 border-4 border-white">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Behavioral Assessment</h2>
          <p className="mt-2 text-md text-gray-600">
            Please answer these questions to help us understand your financial behavior.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map(q => (
              <div key={q.id} className="p-6 bg-orange-50 rounded-2xl shadow-inner border border-orange-200">
                <p className="text-lg font-bold text-gray-800 mb-4">{q.text}</p>
                {q.type === "likert" ? (
                  <LikertScale qId={q.id} checkedValue={answers[q.id]} onChange={e => handleLikertChange(q.id, Number(e.target.value))} disabled={submitted} />
                ) : (
                  <SingleChoice qId={q.id} options={q.options} checkedValue={answers[q.id]} onChange={handleSingleChoiceChange} disabled={submitted} />
                )}
              </div>
            ))}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full sm:w-auto bg-orange-600 text-white py-3 px-8 rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg"
              >
                Submit Assessment
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">Your Results</h3>
            <div className="p-8 bg-orange-50 rounded-2xl shadow-inner border border-orange-200 space-y-4">
              <h4 className="text-xl font-semibold text-gray-800">Trait Scores:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base text-gray-700 font-medium">
                {Object.entries(normalizedTraits).map(([trait, val]) => (
                  <li key={trait}>
                    <span className="font-bold text-gray-900">{trait}:</span> {(val as number * 100).toFixed(1)} %
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-orange-200">
                <b className="text-xl font-extrabold text-gray-900">Composite Score:</b>
                <span className="text-2xl font-extrabold text-orange-600 ml-2">{(compositeScore * 100).toFixed(1)} %</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-orange-500 text-white py-3 px-8 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
