import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Stethoscope, 
  ShieldCheck, 
  Flame, 
  ArrowRight, 
  Activity, 
  UserCheck, 
  Clock,
  HeartPulse
} from "lucide-react";
import AITriageWidget from "@/components/AITriageWidget";
import SpecialistsGrid from "@/components/SpecialistsGrid";

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-500/20 via-emerald-500/15 to-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--secondary)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Next-Gen AI Healthcare Triage & Doctor Second-Opinion Network
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.15]">
            Smart Medical Care,{" "}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Verified by Doctors
            </span>
          </h1>

          <p className="text-base sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Report symptoms with instant Google Gemini AI triage. Our platform routes cases to verified specialists who review, validate, and correct AI solutions in real-time.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#ai-triage"
              className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-emerald-500 hover:opacity-95 shadow-xl shadow-sky-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Start Instant AI Triage
            </a>
            
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-xl font-bold text-sm bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--card)] transition-all flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-sky-400" />
              Join as Doctor or Patient
            </Link>
          </div>

          {/* Key Trust Signals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 text-left">
            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">Gemini AI</div>
                <div className="text-xs text-[var(--muted-foreground)]">Instant Clinical Triage</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">Doctor Verified</div>
                <div className="text-xs text-[var(--muted-foreground)]">Physician Correction</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">Fever Comfort</div>
                <div className="text-xs text-[var(--muted-foreground)]">Low Eye-Strain View</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">8 Specialties</div>
                <div className="text-xs text-[var(--muted-foreground)]">Targeted Care Routing</div>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* AI Triage Interactive Tool */}
      <AITriageWidget />

      {/* Specialist Domains Grid */}
      <SpecialistsGrid />

      {/* Doctor & AI Verification Workflow Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Fail-Safe Clinical Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mt-2 mb-4">
              How AI & Doctors Work Together to Protect You
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-8">
              When you submit a health issue, the Gemini model generates preliminary triage guidance and posts the case to our central medical queue. Licensed specialists review every analysis: if the AI made any mistakes, doctors submit verified clinical corrections.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-black text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-[var(--foreground)]">User Reports Symptoms</h4>
                <p className="text-xs text-[var(--muted-foreground)]">Immediate AI classification and triage urgency scoring.</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-[var(--foreground)]">Logged to Medical Queue</h4>
                <p className="text-xs text-[var(--muted-foreground)]">Problem stored in database with comprehensive symptom history.</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-[var(--foreground)]">Doctor Reviews & Corrects</h4>
                <p className="text-xs text-[var(--muted-foreground)]">Doctors approve or provide corrected medical prescriptions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
