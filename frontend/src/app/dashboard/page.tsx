"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { 
  HeartPulse, 
  Sparkles, 
  Users, 
  Calendar, 
  MapPin, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Stethoscope, 
  Clock,
  UserPlus,
  ArrowUpRight,
  Loader2,
  FileText
} from "lucide-react";
import AITriageWidget from "@/components/AITriageWidget";

export default function PatientDashboard() {
  const { isAuthenticated, role, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"problems" | "family" | "doctors" | "triage">("problems");
  const [problems, setProblems] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [doctorsNearMe, setDoctorsNearMe] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New family member modal/form state
  const [newMemberModal, setNewMemberModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  // New appointment modal/form state
  const [appointmentModal, setAppointmentModal] = useState<any | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (role !== "user") {
      if (role === "doctor") router.push("/doctor");
      if (role === "admin") router.push("/admin");
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [probRes, famRes, docRes] = await Promise.allSettled([
        apiRequest("/users/all-problems/"),
        apiRequest("/users/all-family-members/"),
        apiRequest("/users/doctors-near-me/"),
      ]);

      if (probRes.status === "fulfilled") {
        setProblems(probRes.value.userProblems || []);
        setSolutions(probRes.value.solutions || []);
      }
      if (famRes.status === "fulfilled") {
        setFamilyMembers(famRes.value.familyMembers || []);
      }
      if (docRes.status === "fulfilled") {
        setDoctorsNearMe(docRes.value.doctors || []);
      }
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberSubmitting(true);
    try {
      await apiRequest("/users/add-family-member/", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
        }),
      });
      setFirstName("");
      setLastName("");
      setDob("");
      setNewMemberModal(false);
      fetchDashboardData();
    } catch (err: any) {
      alert("Error adding family member: " + err.message);
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleBookAppointment = async (doctorId: string) => {
    if (!selectedProblemId) {
      alert("Please select a reported health problem to link with this appointment.");
      return;
    }

    try {
      await apiRequest(`/users/new-appointment/${doctorId}/${selectedProblemId}`, {
        method: "POST",
        body: JSON.stringify({
          appointment_date: appointmentDate || undefined,
          appointment_time: appointmentTime || "10:00",
        }),
      });
      setBookingSuccess("Appointment scheduled successfully!");
      setTimeout(() => {
        setAppointmentModal(null);
        setBookingSuccess(null);
      }, 1500);
    } catch (err: any) {
      alert("Error booking appointment: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "doctor_verified") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Doctor Verified & Approved
        </span>
      );
    }
    if (status === "doctor_corrected") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Doctor Corrected Clinical Solution
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
        <Clock className="w-3 h-3 animate-spin" /> Pending Doctor Review
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            Patient Care Portal
          </span>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">
            Welcome back, {user?.username || "Patient"}
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Track AI triage cases, doctor second opinions, family members, and local clinical consultations.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("triage")}
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-500 to-emerald-500 hover:opacity-95 shadow-md flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Report New Symptom (AI Triage)
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("problems")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "problems"
              ? "bg-[var(--secondary)] text-sky-400 border border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <FileText className="w-4 h-4" /> My Health Problems ({problems.length})
        </button>

        <button
          onClick={() => setActiveTab("doctors")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "doctors"
              ? "bg-[var(--secondary)] text-sky-400 border border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Stethoscope className="w-4 h-4" /> Doctors Near Me ({doctorsNearMe.length})
        </button>

        <button
          onClick={() => setActiveTab("family")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "family"
              ? "bg-[var(--secondary)] text-sky-400 border border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Users className="w-4 h-4" /> Family Members ({familyMembers.length})
        </button>

        <button
          onClick={() => setActiveTab("triage")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "triage"
              ? "bg-[var(--secondary)] text-sky-400 border border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Live AI Health Assessment
        </button>
      </div>

      {/* TAB 1: Problems & Doctor Solutions */}
      {activeTab === "problems" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your medical history...
            </div>
          ) : problems.length === 0 ? (
            <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center space-y-3">
              <HeartPulse className="w-10 h-10 text-sky-400 mx-auto" />
              <h3 className="text-base font-bold text-[var(--foreground)]">No health problems reported yet</h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                Use the AI Triage tool to evaluate your symptoms and submit your problem for doctor verification.
              </p>
              <button
                onClick={() => setActiveTab("triage")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white shadow-md inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Start First Assessment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {problems.map((prob) => {
                const solution = solutions.find((s) => s.user_problem === prob._id || (s.user_problem?._id === prob._id));
                return (
                  <div
                    key={prob._id}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-4 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                      <div>
                        <span className="text-xs font-semibold text-sky-400">
                          {prob.type?.name || prob.ai_analysis?.recommended_specialist || "Health Concern"}
                        </span>
                        <h3 className="text-lg font-bold text-[var(--foreground)] mt-0.5">
                          {prob.problem}
                        </h3>
                      </div>
                      <div>{getStatusBadge(prob.status || "pending_doctor_review")}</div>
                    </div>

                    <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      <strong>Detailed Symptoms:</strong> {prob.description}
                    </div>

                    {/* AI Analysis Summary Box */}
                    {prob.ai_analysis && (
                      <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            AI Triage Recommendation:
                          </span>
                          <span className="font-semibold text-sky-400">
                            {prob.ai_analysis.recommended_specialist} ({prob.ai_analysis.triage_urgency || "Routine"})
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {prob.ai_analysis.analysis_summary}
                        </p>
                      </div>
                    )}

                    {/* Doctor's Solution & Correction Feedback */}
                    {solution ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            Doctor's Verified Clinical Solution
                          </span>
                          <span>
                            Dr. {solution.doctor?.first_name || ""} {solution.doctor?.last_name || ""} ({solution.doctor?.specialization || "Specialist"})
                          </span>
                        </div>
                        <p className="text-xs text-[var(--foreground)] leading-relaxed">
                          {solution.solution}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>A specialist doctor is currently reviewing this case. You will see verified solutions and prescription advice here once approved.</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-[11px] text-[var(--muted-foreground)]">
                      <span>Reported: {new Date(prob.created_at || Date.now()).toLocaleDateString()}</span>
                      {prob.name && (
                        <span>Patient: {prob.name.first_name} {prob.name.last_name}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Doctors Near Me */}
      {activeTab === "doctors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorsNearMe.map((doc: any) => (
              <div
                key={doc._id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">
                        Dr. {doc.first_name} {doc.last_name}
                      </h4>
                      <span className="text-xs font-semibold text-emerald-400">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--muted-foreground)]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span>{doc.city}, PIN: {doc.pin_code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hours: {doc.open_time} - {doc.close_time}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setAppointmentModal(doc)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Consultation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Family Members */}
      {activeTab === "family" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Family Dependents</h3>
            <button
              onClick={() => setNewMemberModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Add Family Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((fam) => (
              <div
                key={fam._id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {fam.first_name?.[0]}{fam.last_name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--foreground)]">
                      {fam.first_name} {fam.last_name}
                    </h4>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      DOB: {new Date(fam.date_of_birth).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Live AI Triage Assessment */}
      {activeTab === "triage" && (
        <div className="space-y-4">
          <AITriageWidget />
        </div>
      )}

      {/* Add Family Member Modal */}
      {newMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Add New Family Member</h3>
            <form onSubmit={handleAddFamilyMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={memberSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white"
                >
                  {memberSubmitting ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {appointmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              Schedule with Dr. {appointmentModal.first_name} {appointmentModal.last_name}
            </h3>

            {bookingSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
                {bookingSuccess}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Select Reported Health Problem <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedProblemId}
                    onChange={(e) => setSelectedProblemId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)]"
                  >
                    <option value="">-- Choose Problem --</option>
                    {problems.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.problem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Date</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Time</label>
                    <input
                      type="text"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      placeholder="10:30"
                      className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBookAppointment(appointmentModal._id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
