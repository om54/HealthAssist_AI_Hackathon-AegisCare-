"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { 
  ShieldAlert, 
  Sparkles, 
  Database, 
  Cpu, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Plus, 
  BookOpen, 
  Sliders, 
  RefreshCw,
  Zap,
  Activity
} from "lucide-react";

export default function AdminStudio() {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  const [modelStatus, setModelStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trainingSource, setTrainingSource] = useState<"database" | "manual">("database");
  const [customInstructions, setCustomInstructions] = useState("");
  const [trainingSymptoms, setTrainingSymptoms] = useState("");
  const [trainingSpecialist, setTrainingSpecialist] = useState("General Physician");
  const [trainingConditions, setTrainingConditions] = useState("");
  const [trainingAdvice, setTrainingAdvice] = useState("");
  
  const [isTraining, setIsTraining] = useState(false);
  const [trainResult, setTrainResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (role !== "admin") {
      if (role === "doctor") router.push("/doctor");
      else router.push("/dashboard");
      return;
    }
    fetchModelStatus();
  }, [isAuthenticated, role]);

  const fetchModelStatus = async () => {
    setLoading(true);
    try {
      // First try via Node.js admin gateway
      const data = await apiRequest("/admin/ai-status/");
      setModelStatus(data);
    } catch (err) {
      try {
        // Fallback direct to Python AI microservice
        const data = await apiRequest("/ai/status", {}, true);
        setModelStatus(data);
      } catch (e: any) {
        setError("AI Microservice is not reachable. Ensure python backend is running on port 8000.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTraining(true);
    setError(null);
    setTrainResult(null);

    try {
      const payload: any = {
        source: trainingSource,
        custom_system_instructions: customInstructions || undefined,
        persist_training: true,
        training_examples: [],
      };

      if (trainingSource === "manual" && trainingSymptoms.trim()) {
        payload.training_examples.push({
          symptoms: trainingSymptoms,
          recommended_specialist: trainingSpecialist,
          possible_conditions: trainingConditions.split(",").map(c => c.trim()).filter(Boolean),
          advice: trainingAdvice || undefined,
        });
      }

      const res = await apiRequest("/admin/ai-data-train/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setTrainResult(res);
      fetchModelStatus();
      if (trainingSource === "manual") {
        setTrainingSymptoms("");
        setTrainingConditions("");
        setTrainingAdvice("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to trigger AI training.");
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            AI Operations & Training Control
          </span>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">
            Gemini AI Model Training Studio
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Ground the triage AI model with doctor-verified database cases, fine-tune system rules, and manage few-shot clinical datasets.
          </p>
        </div>

        <button
          onClick={fetchModelStatus}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--card)] flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">AI Service Status</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-[var(--foreground)]">
            {modelStatus?.status === "ready" ? (
              <span className="text-emerald-400 flex items-center gap-1.5 text-xl">
                <CheckCircle className="w-5 h-5" /> Operational
              </span>
            ) : (
              <span className="text-amber-400 text-xl">Configuring</span>
            )}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">Model: {modelStatus?.model_name || "gemini-2.5-flash"}</div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Active Training Dataset</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-[var(--foreground)]">
            {modelStatus?.total_training_examples || 0}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">Grounded clinical cases & few-shot prompts</div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Specialist Categories</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-[var(--foreground)]">
            {modelStatus?.specialists_supported?.length || 8}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">Specialties mapped into prompt schema</div>
        </div>
      </div>

      {/* Main Training Studio Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Model Training Form */}
        <div className="lg:col-span-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="border-b border-[var(--border)] pb-4">
            <h3 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Ground & Train Gemini Model
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Select training source to incorporate new physician-verified knowledge into the AI prompt memory.
            </p>
          </div>

          <form onSubmit={handleTrainModel} className="space-y-5">
            
            {/* Training Mode */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
                Knowledge Training Source
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTrainingSource("database")}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    trainingSource === "database"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
                  }`}
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  Auto-Sync Doctor-Verified DB Solutions
                </button>

                <button
                  type="button"
                  onClick={() => setTrainingSource("manual")}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    trainingSource === "manual"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
                  }`}
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  Add Manual Clinical Case Example
                </button>
              </div>
            </div>

            {/* Custom System Instruction Prompt */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Custom System Instructions & Guidelines (Optional)
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Always evaluate pediatric fevers with extreme care and recommend immediate pediatric triage if body temperature exceeds 102°F..."
                rows={3}
                className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
              />
            </div>

            {/* Manual Training Example Inputs */}
            {trainingSource === "manual" && (
              <div className="p-4 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] space-y-4">
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase">Manual Training Sample</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Reported Symptoms</label>
                  <input
                    type="text"
                    value={trainingSymptoms}
                    onChange={(e) => setTrainingSymptoms(e.target.value)}
                    placeholder="e.g. Sharp chest discomfort worsening on deep inspiration and lying down"
                    required
                    className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Specialist</label>
                    <select
                      value={trainingSpecialist}
                      onChange={(e) => setTrainingSpecialist(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)]"
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Psychologist">Psychologist</option>
                      <option value="Nutritionist">Nutritionist</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Pediatrician">Pediatrician</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Possible Conditions (comma separated)</label>
                    <input
                      type="text"
                      value={trainingConditions}
                      onChange={(e) => setTrainingConditions(e.target.value)}
                      placeholder="Pericarditis, Pleurisy"
                      className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Verified Clinical Advice</label>
                  <input
                    type="text"
                    value={trainingAdvice}
                    onChange={(e) => setTrainingAdvice(e.target.value)}
                    placeholder="Immediate ECG and echocardiogram required."
                    className="w-full p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)]"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {trainResult && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> {trainResult.message || "Model Knowledge Base Updated Successfully!"}
                </div>
                <div>Added Examples: {trainResult.added_examples_count} | Active Knowledge Pool: {trainResult.total_active_training_examples}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isTraining}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isTraining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synchronizing & Training Model...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Apply & Persist AI Model Training
                </>
              )}
            </button>

          </form>

        </div>

        {/* Right Column: Supported Specialties & Architecture Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" /> Supported Medical Domains
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              The model prompt is strictly bounded to route only within these certified clinical specialties:
            </p>
            <div className="space-y-1.5">
              {[
                "General Physician",
                "Cardiologist",
                "Dermatologist",
                "Neurologist",
                "Psychologist",
                "Nutritionist",
                "Orthopedic",
                "Pediatrician"
              ].map((sp, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-between">
                  <span>{sp}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
