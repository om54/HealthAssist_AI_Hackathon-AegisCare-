import React from "react";
import Link from "next/link";
import { HeartPulse, Shield, Stethoscope, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-24 text-[var(--muted-foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                AegisCare Health System
              </span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed">
              Intelligent triage and specialist routing platform powered by Google Gemini AI, designed with dedicated high-comfort accessibility for fever and eye-strain relief.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              AI Triage & Doctor Verification Online
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Specialist Services</h4>
            <ul className="space-y-2 text-xs">
              <li>General Physician</li>
              <li>Cardiologist & Heart Care</li>
              <li>Dermatology & Skin Health</li>
              <li>Neurology & Cognitive Care</li>
              <li>Psychology & Mental Health</li>
              <li>Nutrition & Dietetics</li>
              <li>Orthopedic & Joint Care</li>
              <li>Pediatrics & Child Wellness</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Portals & Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-[var(--foreground)] transition-colors">Patient Login</Link></li>
              <li><Link href="/login" className="hover:text-[var(--foreground)] transition-colors">Doctor Portal</Link></li>
              <li><Link href="/login" className="hover:text-[var(--foreground)] transition-colors">Admin Studio</Link></li>
              <li><Link href="/#ai-triage" className="hover:text-[var(--foreground)] transition-colors">Instant AI Triage</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[var(--border)] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} AegisCare. All medical guidance is AI-assisted and verified by licensed physicians.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> HIPAA & Privacy Aligned</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
