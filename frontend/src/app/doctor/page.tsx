"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Sparkles, 
  User, 
  AlertCircle, 
  Loader2,
  FileCheck,
  Send,
  MessageSquare,
  Activity,
  Pill,
  Trash2,
  Plus
} from "lucide-react";

export default function DoctorPortal() {
  const { isAuthenticated, role, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"problems" | "appointments">("problems");
  const [problems, setProblems] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review / Solution modal state
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  const [verifyIsTrue, setVerifyIsTrue] = useState(true);
  const [solutionText, setSolutionText] = useState("");
  const [medicinesList, setMedicinesList] = useState<any[]>([]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedPurpose, setNewMedPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (role !== "doctor") {
      if (role === "admin") router.push("/admin");
      else router.push("/dashboard");
      return;
    }
    fetchDoctorData();
  }, [isAuthenticated, role]);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [probRes, appRes] = await Promise.allSettled([
        apiRequest("/doctor-admin/get-all-user-problems/"),
        apiRequest("/doctor-admin/all-appointments/"),
      ]);

      if (probRes.status === "fulfilled") {
        setProblems(probRes.value.UserProblems || []);
      }
      if (appRes.status === "fulfilled") {
        setAppointments(appRes.value.DoctorsAppointments || []);
      }
    } catch (e) {
      console.error("Doctor data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (prob: any) => {
    setSelectedProblem(prob);
    setVerifyIsTrue(true);
    setSolutionText(prob.ai_analysis?.analysis_summary || "");
    const initialMeds = prob.ai_analysis?.recommended_medicines || [];
    setMedicinesList(initialMeds.map((m: any) => ({
      name: m.name || "",
      dosage: m.dosage || "",
      purpose: m.purpose || "",
      instructions: m.advice || "Prescribed by physician"
    })));
    setNewMedName("");
    setNewMedDosage("");
    setNewMedPurpose("");
    setSuccessMessage(null);
  };

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;
    setMedicinesList([
      ...medicinesList,
      {
        name: newMedName.trim(),
        dosage: newMedDosage.trim(),
        purpose: newMedPurpose.trim(),
        instructions: "Prescribed & verified by physician"
      }
    ]);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedPurpose("");
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicinesList(medicinesList.filter((_, i) => i !== index));
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem) return;
    setSubmitting(true);

    try {
      const res = await apiRequest(`/doctor-admin/solution-of-user-problem/${selectedProblem._id}`, {
        method: "POST",
        body: JSON.stringify({
          verifyIsTrue,
          solution: solutionText || (verifyIsTrue ? "AI recommendation approved by physician." : "Corrected clinical guidance provided."),
          corrected_medicines: medicinesList
        }),
      });

      setSuccessMessage(res.message || "Medical evaluation and prescription submitted successfully!");
      setTimeout(() => {
        setSelectedProblem(null);
        setSuccessMessage(null);
        fetchDoctorData();
      }, 1500);
    } catch (err: any) {
      alert("Error submitting clinical review: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAppointment = async (appointmentId: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/doctor-admin/appointment/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify({
          done_by_doctor: !currentStatus,
        }),
      });
      fetchDoctorData();
    } catch (err: any) {
      alert("Error updating appointment: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Physician Clinical Studio
          </span>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">
            Doctor Review & Verification Center
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Review patient symptoms, audit Gemini AI triage outputs, and correct medical advice for patient safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4" /> Certified Specialist
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab("problems")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "problems"
              ? "bg-[var(--secondary)] text-emerald-400 border border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Activity className="w-4 h-4" /> Patient Triage Queue ({problems.length})
        </button>

        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "appointments"
              ? "bg-[var(--secondary)] text-emerald-400 border border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Calendar className="w-4 h-4" /> Consultations & Appointments ({appointments.length})
        </button>
      </div>

      {/* TAB 1: Problems Queue */}
      {activeTab === "problems" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading clinical cases...
            </div>
          ) : problems.length === 0 ? (
            <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-[var(--foreground)]">All Patient Cases Reviewed</h3>
              <p className="text-xs text-[var(--muted-foreground)]">No new incoming AI health triage cases pending doctor review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {problems.map((prob) => (
                <div
                  key={prob._id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-4 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <span>Specialty: {prob.type?.name || "General Health"}</span>
                        {prob.ai_analysis?.triage_urgency && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Urgency: {prob.ai_analysis.triage_urgency}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[var(--foreground)] mt-0.5">
                        {prob.problem}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleOpenReview(prob)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" /> Review & Submit Solution
                    </button>
                  </div>

                  <div className="text-xs text-[var(--foreground)]">
                    <strong>Reported Patient Symptoms:</strong>
                    <p className="mt-1 text-[var(--muted-foreground)] bg-[var(--secondary)] p-3 rounded-xl border border-[var(--border)]">
                      {prob.description}
                    </p>
                  </div>

                  {/* AI Prediction Details */}
                  {prob.ai_analysis && (
                    <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-sky-400">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Initial Assessment
                        </span>
                        <span>Rec: {prob.ai_analysis.recommended_specialist}</span>
                      </div>
                      <p className="text-[var(--muted-foreground)]">
                        {prob.ai_analysis.analysis_summary}
                      </p>
                      {prob.ai_analysis.possible_conditions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {prob.ai_analysis.possible_conditions.map((c: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[11px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-1">
                    <span>
                      Patient: {prob.user?.username ? `${prob.user.username} (${prob.user.city || "Location N/A"})` : (
                        prob.patient_profile?.age || prob.patient_profile?.gender ? (
                          `Direct/Guest Patient (${[prob.patient_profile.gender, prob.patient_profile.age ? `${prob.patient_profile.age} yrs` : null].filter(Boolean).join(", ")})`
                        ) : "Direct AI Triage Case"
                      )}
                    </span>
                    <span>Status: <span className="font-semibold text-sky-400 uppercase">{prob.status?.replace(/_/g, " ") || "PENDING"}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Appointments */}
      {activeTab === "appointments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((app) => (
              <div
                key={app._id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400">Consultation #{app._id.slice(-6)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    app.done_by_doctor ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {app.done_by_doctor ? "Completed" : "Scheduled"}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[var(--foreground)]">
                  <div><strong>Date:</strong> {new Date(app.appointment_date).toLocaleDateString()}</div>
                  <div><strong>Time:</strong> {app.appointment_time}</div>
                </div>

                <button
                  onClick={() => handleToggleAppointment(app._id, app.done_by_doctor)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                    app.done_by_doctor
                      ? "bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]"
                      : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }`}
                >
                  {app.done_by_doctor ? "Mark as Incomplete" : "Mark as Completed"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution & AI Correction Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="border-b border-[var(--border)] pb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase">Clinical Audit</span>
              <h3 className="text-xl font-bold text-[var(--foreground)] mt-0.5">
                Verify or Correct AI Solution
              </h3>
              <div className="mt-2 p-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-xs space-y-1">
                <span className="font-bold text-[var(--foreground)] block">Reported Symptoms & Clinical Profile:</span>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {selectedProblem.symptoms || selectedProblem.description || selectedProblem.problem}
                </p>
                {selectedProblem.patient_profile && (
                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-sky-400 font-semibold">
                    {selectedProblem.patient_profile.duration && <span>Duration: {selectedProblem.patient_profile.duration}</span>}
                    {selectedProblem.patient_profile.medical_history && <span>History/Allergies: {selectedProblem.patient_profile.medical_history}</span>}
                    {selectedProblem.patient_profile.age && <span>Age: {selectedProblem.patient_profile.age}</span>}
                    {selectedProblem.patient_profile.gender && <span>Gender: {selectedProblem.patient_profile.gender}</span>}
                  </div>
                )}
              </div>
            </div>

            {successMessage ? (
              <div className="p-6 rounded-2xl bg-emerald-500/20 text-emerald-400 text-center font-bold text-sm">
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmitSolution} className="space-y-5">
                
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
                    Did Gemini AI generate the accurate diagnosis & routing?
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVerifyIsTrue(true)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        verifyIsTrue
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30"
                          : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Approve AI Diagnosis
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerifyIsTrue(false)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        !verifyIsTrue
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                          : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-amber-400" />
                      AI Made a Mistake / Correct
                    </button>
                  </div>
                </div>

                {/* Medicine Verification & Correction Section */}
                <div className="space-y-3 p-4 rounded-2xl bg-[var(--secondary)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-emerald-400" />
                      Prescription & Medications Audit
                    </label>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {medicinesList.length} medications listed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {medicinesList.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between gap-2"
                      >
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--foreground)]">{med.name}</span>
                            {med.dosage && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {med.dosage}
                              </span>
                            )}
                          </div>
                          {med.purpose && (
                            <p className="text-[11px] text-[var(--muted-foreground)]">{med.purpose}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove medication"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add / Modify Medication Input Bar */}
                  <div className="pt-2 border-t border-[var(--border)] space-y-2">
                    <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">Add or Replace Prescribed Medication:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Paracetamol)"
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        className="p-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)]"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 500mg SOS)"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="p-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)]"
                      />
                      <input
                        type="text"
                        placeholder="Purpose (e.g. Fever & headache)"
                        value={newMedPurpose}
                        onChange={(e) => setNewMedPurpose(e.target.value)}
                        className="p-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add / Update Prescription
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1.5">
                    {verifyIsTrue ? "Physician Approval Notes & Advice" : "Physician Clinical Correction & Prescribed Next Steps"} <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    rows={4}
                    required
                    placeholder={verifyIsTrue ? "Confirmed appropriate triage. Recommended standard hydration and clinic follow-up." : "AI misdiagnosed condition. Patient requires immediate orthopedic evaluation and MRI."}
                    className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] p-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProblem(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {verifyIsTrue ? "Approve & Submit Solution" : "Submit Corrected Solution"}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
