"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { 
  HeartPulse, 
  Flame, 
  Moon, 
  Sun, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const { theme, setTheme, toggleFeverMode, isFeverMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] glass-panel transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                AegisCare
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                AI Health
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link 
              href="/#specialists" 
              className="px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)]"
            >
              Specialists
            </Link>
            <Link 
              href="/#ai-triage" 
              className="px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)] flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Triage
            </Link>

            {isAuthenticated && role === "user" && (
              <Link 
                href="/dashboard" 
                className="px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)]"
              >
                Patient Portal
              </Link>
            )}

            {isAuthenticated && role === "doctor" && (
              <Link 
                href="/doctor" 
                className="px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)]"
              >
                Doctor Studio
              </Link>
            )}

            {isAuthenticated && role === "admin" && (
              <Link 
                href="/admin" 
                className="px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)]"
              >
                AI Admin Center
              </Link>
            )}
          </div>

          {/* Right Action Tools: Fever Comfort Toggle, Theme Toggle & Auth */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* FEVER / EYE-CARE COMFORT MODE TOGGLE BUTTON */}
            <button
              onClick={toggleFeverMode}
              title="Fever & Eye-Care Comfort Mode (Soft Warm Tone & Low Eye-Strain)"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                isFeverMode 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30" 
                  : "bg-stone-800/40 text-stone-300 border-stone-700/50 hover:border-amber-500/40 hover:text-amber-400"
              }`}
            >
              <Flame className={`w-4 h-4 ${isFeverMode ? "text-amber-400 fill-amber-400 animate-pulse" : "text-amber-500"}`} />
              <span>{isFeverMode ? "Fever Comfort ON" : "Fever Comfort"}</span>
            </button>

            {/* Standard Light/Dark toggle */}
            {!isFeverMode && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)]"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] uppercase tracking-wider">
                  {role}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:opacity-90 shadow-md shadow-sky-500/20 transition-opacity"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleFeverMode}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                isFeverMode ? "bg-amber-500/20 text-amber-300 border-amber-500" : "border-[var(--border)] text-amber-500"
              }`}
            >
              <Flame className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--foreground)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[var(--foreground)]" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)] px-4 pt-3 pb-6 space-y-3">
          <Link 
            href="/#specialists" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[var(--foreground)]"
          >
            Specialists
          </Link>
          <Link 
            href="/#ai-triage" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[var(--foreground)]"
          >
            AI Triage
          </Link>
          {isAuthenticated && (
            <Link 
              href={role === "doctor" ? "/doctor" : role === "admin" ? "/admin" : "/dashboard"} 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-sky-400"
            >
              Go to Dashboard ({role})
            </Link>
          )}
          <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold text-center border border-red-500/20"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-center block"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold text-center block"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
