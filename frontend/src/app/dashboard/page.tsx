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

  const [activeTab, setActiveTab] = useState<"problems" | "appointments" | "doctors" | "family" | "triage">("problems");
  const [problems, setProblems] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
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
  const [appointmentTime, setAppointmentTime] = useState("10:00 am");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

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
      const [probRes, apptRes, famRes, docRes] = await Promise.allSettled([
        apiRequest("/users/all-problems/"),
        apiRequest("/users/my-appointments/"),
        apiRequest("/users/all-family-members/"),
        apiRequest("/users/doctors-near-me/"),
      ]);

      if (probRes.status === "fulfilled") {
        setProblems(probRes.value.userProblems || []);
        setSolutions(probRes.value.solutions || []);
      }
      if (apptRes.status === "fulfilled") {
        setAppointments(apptRes.value.appointments || []);
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
      setBookingError("Please select a reported health problem to link with this appointment.");
      return;
    }

    setBookingError(null);
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
        setBookingError(null);
        fetchDashboardData();
        setActiveTab("appointments");
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || "Failed to schedule appointment.");
    }
  };

  const handleConfirmConsultationOver = async (appointmentId: string, doctorId: string) => {
    try {
      await apiRequest(`/users/appointment/${doctorId}/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify({
          done_by_user: true
        })
      });
      alert("Consultation marked as completed! If your condition has not improved, you can now schedule a follow-up appointment.");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error completing appointment: " + err.message);
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
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "appointments"
              ? "bg-[var(--secondary)] text-sky-400 border border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-400" /> My Appointments ({appointments.length})
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
                const medicines = prob.ai_analysis?.recommended_medicines || [];

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
                      <div className="flex items-center gap-2">
                        {getStatusBadge(prob.status || "pending_doctor_review")}
                        <button
                          onClick={() => {
                            setSelectedProblemId(prob._id);
                            if (doctorsNearMe.length > 0) {
                              setAppointmentModal(doctorsNearMe[0]);
                            } else {
                              setActiveTab("doctors");
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500 hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Book Follow-Up
                        </button>
                      </div>
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

                    {/* Recommended Medicines / Supportive Remedies */}
                    {medicines.length > 0 && (
                      <div className="p-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Recommended Medications / Supportive Remedies
                          </span>
                          <span className="text-[11px] font-normal text-amber-400">
                            Audited by attending physician
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {medicines.map((med: any, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold text-[var(--foreground)]">
                                <span>{med.name}</span>
                                {med.dosage && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {med.dosage}
                                  </span>
                                )}
                              </div>
                              {med.purpose && (
                                <p className="text-[11px] text-[var(--muted-foreground)]">{med.purpose}</p>
                              )}
                              <p className="text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0 text-amber-400" />
                                {med.advice || "Ask the nearby specialist before intake"}
                              </p>
                            </div>
                          ))}
                        </div>
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

      {/* TAB: My Appointments */}
      {activeTab === "appointments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">My Clinical Appointments</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Track your active doctor consultations. If a health problem has not resolved after your consultation, mark it completed to schedule a follow-up appointment.
              </p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center space-y-3">
              <Calendar className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-[var(--foreground)]">No Scheduled Consultations</h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                Explore nearby doctors and schedule a consultation linked to one of your reported health problems.
              </p>
              <button
                onClick={() => setActiveTab("doctors")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-md inline-flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" /> Find Nearby Specialist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {appointments.map((appt: any) => {
                const isCompleted = appt.done_by_doctor && appt.done_by_user;
                const isPendingUser = appt.done_by_doctor && !appt.done_by_user;

                return (
                  <div
                    key={appt._id}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-400">
                            Dr. {appt.doctor?.first_name} {appt.doctor?.last_name} ({appt.doctor?.specialization})
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            • {appt.doctor?.city} (PIN: {appt.doctor?.pin_code})
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[var(--foreground)] mt-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-sky-400" />
                          Problem: {appt.problem?.problem || "Consultation Case"}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Consultation Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Active Appointment
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] space-y-1">
                        <span className="text-[11px] text-[var(--muted-foreground)]">Date & Time:</span>
                        <p className="font-bold text-[var(--foreground)]">
                          {new Date(appt.appointment_date || Date.now()).toLocaleDateString()} at {appt.appointment_time}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] space-y-1">
                        <span className="text-[11px] text-[var(--muted-foreground)]">Doctor Review Status:</span>
                        <p className="font-bold text-[var(--foreground)] flex items-center gap-1">
                          {appt.done_by_doctor ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Reviewed by Doctor
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Pending Doctor Session
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] space-y-1">
                        <span className="text-[11px] text-[var(--muted-foreground)]">Patient Resolution:</span>
                        <p className="font-bold text-[var(--foreground)]">
                          {appt.done_by_user ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Verified by You
                            </span>
                          ) : (
                            <span className="text-sky-400">In Progress / Ongoing</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar for completion & follow-ups */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {isCompleted ? (
                          "Problem still persists? You can book another appointment with any specialist."
                        ) : (
                          "Only 1 active consultation allowed per problem at a time."
                        )}
                      </p>

                      <div className="flex items-center gap-2">
                        {!appt.done_by_user && (
                          <button
                            onClick={() => handleConfirmConsultationOver(appt._id, appt.doctor?._id || appt.doctor)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Consultation Done
                          </button>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => {
                              setSelectedProblemId(appt.problem?._id || appt.problem);
                              setAppointmentModal(appt.doctor);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center gap-1.5"
                          >
                            <Calendar className="w-4 h-4" /> Schedule Follow-Up
                          </button>
                        )}
                      </div>
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
                {bookingError && (
                  <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}
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
