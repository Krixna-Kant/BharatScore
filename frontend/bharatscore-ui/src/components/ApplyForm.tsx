import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const ApplyForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phoneType: "",
    region: "",
    smsCount: "",
    billHabit: "",
    rechargeHabit: "",
    simTenure: "",
    locationStability: "",
    income: "",
    steadyJob: "",
    fixedSalary: "",
    coopScore: "",
    landVerified: "",
    age: "",
  });

  const mapToModel = () => {
    let bill_on_time_ratio = 0.5;
    if (formData.billHabit === "always") bill_on_time_ratio = 0.95;
    else if (formData.billHabit === "most") bill_on_time_ratio = 0.8;
    else if (formData.billHabit === "sometimes") bill_on_time_ratio = 0.5;
    else if (formData.billHabit === "rarely") bill_on_time_ratio = 0.2;

    let recharge_freq = 1;
    if (formData.rechargeHabit === "always") recharge_freq = 3;
    else if (formData.rechargeHabit === "sometimes") recharge_freq = 2;
    else recharge_freq = 1;

    let sim_tenure = 6;
    if (formData.simTenure === "lt6") sim_tenure = 3;
    else if (formData.simTenure === "6to12") sim_tenure = 9;
    else if (formData.simTenure === "1to3") sim_tenure = 24;
    else if (formData.simTenure === "3plus") sim_tenure = 48;

    let location_stability = 0.6;
    if (formData.locationStability === "rarely") location_stability = 0.9;
    else if (formData.locationStability === "occasionally") location_stability = 0.6;
    else if (formData.locationStability === "frequently") location_stability = 0.3;

    let income_signal = 0.3;
    if (formData.income === "high" && formData.steadyJob === "yes" && formData.fixedSalary === "yes")
      income_signal = 0.9;
    else if (formData.income === "medium" && formData.steadyJob === "yes")
      income_signal = 0.7;
    else if (formData.income === "low") income_signal = 0.4;

    const coop_score = parseFloat(formData.coopScore) / 100;

    const land_verified = formData.landVerified === "yes" ? 1 : 0;

    let age_group = "18-25";
    const ageNum = parseInt(formData.age);
    if (ageNum >= 18 && ageNum <= 25) age_group = "18-25";
    else if (ageNum >= 26 && ageNum <= 35) age_group = "26-35";
    else if (ageNum >= 36 && ageNum <= 50) age_group = "36-50";
    else if (ageNum > 50) age_group = "50+";

    return {
      clerk_user_id: user?.id,
      user_type: formData.phoneType,
      region: formData.region,
      sms_count: Number(formData.smsCount),
      bill_on_time_ratio,
      recharge_freq,
      sim_tenure,
      location_stability,
      income_signal,
      coop_score,
      land_verified,
      age_group,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setLoading(true);
    const payload = mapToModel();

    try {
      const res = await fetch("http://127.0.0.1:8000/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
        navigate("/dashboard");
      } else {
        throw new Error(data.error || "Failed to submit");
      }
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Apply for Bharat Score</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block mb-1 font-medium">What type of phone do you use?</label>
          <select
            value={formData.phoneType}
            onChange={(e) => setFormData({ ...formData, phoneType: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="smartphone">Smartphone</option>
            <option value="feature">Feature Phone</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Where do you live?</label>
          <select
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="urban">Urban</option>
            <option value="rural">Rural</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">How many SMS do you send per week?</label>
          <input
            type="number"
            value={formData.smsCount}
            onChange={(e) => setFormData({ ...formData, smsCount: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">How often do you pay your bills on time?</label>
          <select
            value={formData.billHabit}
            onChange={(e) => setFormData({ ...formData, billHabit: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="always">Always</option>
            <option value="most">Most of the time</option>
            <option value="sometimes">Sometimes</option>
            <option value="rarely">Rarely</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Do you keep your phone recharged regularly?</label>
          <select
            value={formData.rechargeHabit}
            onChange={(e) => setFormData({ ...formData, rechargeHabit: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="always">Always on time</option>
            <option value="sometimes">Sometimes late</option>
            <option value="often">Often left without recharge</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">How long have you used your current SIM?</label>
          <select
            value={formData.simTenure}
            onChange={(e) => setFormData({ ...formData, simTenure: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="lt6">Less than 6 months</option>
            <option value="6to12">6–12 months</option>
            <option value="1to3">1–3 years</option>
            <option value="3plus">3+ years</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">How often do you change your address?</label>
          <select
            value={formData.locationStability}
            onChange={(e) => setFormData({ ...formData, locationStability: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="rarely">Rarely (same place 3+ years)</option>
            <option value="occasionally">Occasionally (1–3 years)</option>
            <option value="frequently">Frequently (less than 1 year)</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">What is your income level?</label>
          <select
            value={formData.income}
            onChange={(e) => setFormData({ ...formData, income: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Do you have a steady job/business?</label>
          <select
            value={formData.steadyJob}
            onChange={(e) => setFormData({ ...formData, steadyJob: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Do you receive salary on fixed dates?</label>
          <select
            value={formData.fixedSalary}
            onChange={(e) => setFormData({ ...formData, fixedSalary: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">How active are you in community/coop groups? (0–100)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.coopScore}
            onChange={(e) => setFormData({ ...formData, coopScore: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Do you own verified land/property documents?</label>
          <select
            value={formData.landVerified}
            onChange={(e) => setFormData({ ...formData, landVerified: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">What is your age?</label>
          <input
            type="number"
            min="18"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default ApplyForm;
