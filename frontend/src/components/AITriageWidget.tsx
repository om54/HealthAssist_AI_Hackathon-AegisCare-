"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Stethoscope, 
  HeartHandshake, 
  HelpCircle, 
  ShieldAlert,
  Loader2,
  Activity,
  Users,
  UserPlus,
  Lock,
  Pill
} from "lucide-react";

type FamilyMember = {
  _id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
};

type MedicineItem = {
  name: string;
  dosage?: string;
  purpose?: string;
  advice: string;
};

type TriageResult = {
  identified_health_problem?: string;
  recommended_specialist: string;
  triage_urgency: string;
  analysis_summary: string;
  recommended_medicines?: MedicineItem[];
  possible_conditions?: string[];
  suggested_questions_for_doctor?: string[];
  general_health_advice?: string[];
  disclaimer?: string;
};

export default function AITriageWidget() {
  const { isAuthenticated, role } = useAuth();
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [duration, setDuration] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const data = await apiRequest("/users/all-family-members/") as { familyMembers?: FamilyMember[] };
      const members = data.familyMembers || [];
      setFamilyMembers(members);
      if (members.length > 0) {
        setSelectedFamilyMemberId(members[0]._id);
      }
    } catch (e) {
      console.error("Error fetching family members for AI triage:", e);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && role === "user") {
      const timeoutId = window.setTimeout(() => {
        void fetchMembers();
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [fetchMembers, isAuthenticated, role]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAuthenticated && role === "user" && familyMembers.length === 0) {
      setError("You must have at least one family member attached to your account to use Live AI Health Assessment.");
      return;
    }

    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setError("Please describe symptoms with at least 5 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data: TriageResult;
      // If user is authenticated in Node.js backend
      if (isAuthenticated && role === "user") {
        data = await apiRequest("/users/ai-analyze-health/", {
          method: "POST",
          body: JSON.stringify({
            symptoms,
            age: age ? Number(age) : null,
            gender: gender || null,
            duration: duration || null,
            medical_history: medicalHistory || null,
            family_member_id: selectedFamilyMemberId || undefined,
          }),
        }) as TriageResult;
      } else {
        // Direct call to Python AI microservice
        data = await apiRequest("/ai/analyze-problem", {
          method: "POST",
          body: JSON.stringify({
            symptoms,
            age: age ? Number(age) : null,
            gender: gender || null,
            duration: duration || null,
            medical_history: medicalHistory || null,
          }),
        }, true) as TriageResult;
      }

      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setError(message || "Failed to analyze symptoms. Please make sure the Python AI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const u = (urgency || "").toLowerCase();
    if (u.includes("emergency") || u.includes("critical")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" /> Emergency Priority
        </span>
      );
    }
    if (u.includes("urgent")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <AlertCircle className="w-3.5 h-3.5" /> Urgent Attention
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <CheckCircle className="w-3.5 h-3.5" /> Routine Consultation
      </span>
    );
  };

  return (
    <section id="ai-triage" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-sky-500/20 blur-[120px]" />
      </div>

      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Google Gemini Powered Medical Triage
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          Instant AI Health Triage & Specialist Matching
        </h2>
        <p className="mt-3 text-base text-[var(--muted-foreground)] leading-relaxed">
          Choose the family member who needs help, describe the problem they are facing, and the AI will gauge urgency and match them with the right specialist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Triage Input Form */}
        <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xl relative transition-colors duration-300">
          
          {/* Family Member Restriction Warning if logged in and no family member */}
          {isAuthenticated && role === "user" && !loadingMembers && familyMembers.length === 0 ? (
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Family Member Required for AI Triage
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-sm mx-auto">
                Live AI Health Assessment is personalized per patient profile. Please add at least one family member attached to your account to unlock AI triage.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-500 text-white shadow-md hover:bg-sky-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Add Family Member in Dashboard
              </Link>
            </div>
          ) : isAuthenticated && role === "user" && loadingMembers ? (
            <div className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Loading your family members...
              </p>
            </div>
          ) : (
            <form onSubmit={handleAnalyze} className="space-y-5">
              
              {/* Family member selector if user is logged in */}
              {isAuthenticated && role === "user" && familyMembers.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-400" />
                    Who in your family needs AI triage? <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedFamilyMemberId}
                    onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] p-2.5 text-xs text-[var(--foreground)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    {familyMembers.map((fam) => (
                      <option key={fam._id} value={fam._id}>
                        {fam.first_name} {fam.last_name} (DOB: {new Date(fam.date_of_birth).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[11px] text-[var(--muted-foreground)]">
                    The AI will use this family member&apos;s profile while reviewing the health problem.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
                  What problem are they facing? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. My mother has had high fever with chills since yesterday, a throbbing headache on the right temple, and sensitivity to bright room lights..."
                  rows={4}
                  required
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] p-3.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
                />
                <p className="mt-1.5 text-[11px] text-[var(--muted-foreground)]">
                  Include symptoms, pain location, severity, duration, and anything that makes it better or worse.
                </p>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 28"
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] p-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] p-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3 days"
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] p-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Medical History / Known Allergies
              </label>
              <input
                type="text"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="e.g. Asthmatic, Penicillin allergy, Hypertension"
                className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] p-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 hover:opacity-95 shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Evaluate Health & Find Specialist
                </>
              )}
            </button>
          </form>
          )}
        </div>

        {/* Right Column: AI Triage Output */}
        <div className="lg:col-span-6">
          {result ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 transition-all animate-fadeIn">
              
              {/* Header result with problem identification and specialist badge */}
              <div className="space-y-3 border-b border-[var(--border)] pb-4">
                {result.identified_health_problem && (
                  <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400">
                      Identified Health Problem
                    </span>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mt-0.5">
                      {result.identified_health_problem}
                    </h3>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                      Recommended Specialist
                    </span>
                    <h3 className="text-xl font-black text-sky-400 mt-0.5 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-sky-400" />
                      {result.recommended_specialist}
                    </h3>
                  </div>
                  {getUrgencyBadge(result.triage_urgency)}
                </div>
              </div>

              {/* Analysis summary */}
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1.5">
                  Clinical Assessment
                </h4>
                <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--secondary)] p-3.5 rounded-xl border border-[var(--border)]">
                  {result.analysis_summary}
                </p>
              </div>

              {/* Recommended Medicines List */}
              {result.recommended_medicines && result.recommended_medicines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-emerald-400" />
                    Recommended Supportive Medicines / Remedies
                  </h4>
                  <div className="space-y-2">
                    {result.recommended_medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--foreground)]">{med.name}</span>
                            {med.dosage && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {med.dosage}
                              </span>
                            )}
                          </div>
                          {med.purpose && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{med.purpose}</p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {med.advice || "Ask the nearby specialist before intake"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Possible conditions tags */}
              {result.possible_conditions && result.possible_conditions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
                    Possible Differential Considerations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.possible_conditions.map((cond: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested questions for doctor consultation */}
              {result.suggested_questions_for_doctor && result.suggested_questions_for_doctor.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    Recommended Questions to Ask Your Doctor
                  </h4>
                  <ul className="space-y-1.5">
                    {result.suggested_questions_for_doctor.map((q: string, idx: number) => (
                      <li key={idx} className="text-xs text-[var(--foreground)] flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General Health Advice */}
              {result.general_health_advice && result.general_health_advice.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    Immediate Safe Comfort Measures
                  </h4>
                  <ul className="space-y-1.5">
                    {result.general_health_advice.map((adv: string, idx: number) => (
                      <li key={idx} className="text-xs text-[var(--muted-foreground)] flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted-foreground)] flex items-start gap-2 italic">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>{result.disclaimer || "AI analysis is for informational and routing purposes and does not substitute direct clinical diagnosis by a licensed physician."}</span>
              </div>

            </div>
          ) : (
            <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4">
                <Activity className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                Awaiting Symptom Details
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm">
                Enter your health details on the left to receive immediate AI specialty recommendations, triage urgency, and questions for your doctor.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
