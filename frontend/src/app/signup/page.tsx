"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Role } from "@/context/AuthContext";
import { 
  User, 
  Stethoscope, 
  ShieldAlert, 
  Mail, 
  Key, 
  MapPin, 
  Building, 
  Hash, 
  Clock, 
  Award,
  Loader2, 
  AlertCircle,
  CheckCircle2,
  HeartPulse
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Common and specific form fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState<number | "">("");

  // Doctor specific fields
  const [mbbsCode, setMbbsCode] = useState("");
  const [specialization, setSpecialization] = useState("General Physician");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("17:00");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint = "/users/signup/";
      let payload: any = {};

      if (role === "user") {
        endpoint = "/users/signup/";
        payload = {
          email,
          username,
          password,
          location: location || "Not provided",
          city: city || "City",
          pin_code: Number(pinCode) || 100001,
        };
      } else if (role === "doctor") {
        endpoint = "/doctor-admin/signup/";
        payload = {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          mbbs_code: mbbsCode,
          specialization,
          location: location || "Clinic Address",
          city: city || "City",
          pin_code: Number(pinCode) || 100001,
          open_time: openTime,
          close_time: closeTime,
        };
      } else if (role === "admin") {
        endpoint = "/admin/signup/";
        payload = {
          email,
          username,
          password,
          first_name: firstName,
          last_name: lastName,
        };
      }

      await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white mx-auto shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
            Create an AegisCare Account
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Join as a patient to receive AI triage, or register as a certified doctor
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[var(--secondary)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => { setRole("user"); setError(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === "user"
                ? "bg-[var(--card)] text-sky-400 shadow-sm border border-[var(--border)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Patient
          </button>

          <button
            type="button"
            onClick={() => { setRole("doctor"); setError(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === "doctor"
                ? "bg-[var(--card)] text-emerald-400 shadow-sm border border-[var(--border)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor
          </button>

          <button
            type="button"
            onClick={() => { setRole("admin"); setError(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === "admin"
                ? "bg-[var(--card)] text-amber-400 shadow-sm border border-[var(--border)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Admin
          </button>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-emerald-400">Account Created Successfully!</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Redirecting to login portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              {role !== "doctor" ? (
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user_handle"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    MBBS Registration Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={mbbsCode}
                    onChange={(e) => setMbbsCode(e.target.value)}
                    placeholder="MED-74892"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              )}
            </div>

            {(role === "doctor" || role === "admin") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              </div>
            )}

            {role === "doctor" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Medical Specialization <span className="text-red-400">*</span>
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
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
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Password <span className="text-red-400">* (min 6 chars, 1 special char)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {role !== "admin" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    PIN Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="110001"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Address / Clinic
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Street / Sector"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-emerald-500 hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                `Complete Signup as ${role.toUpperCase()}`
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[var(--muted-foreground)]">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
