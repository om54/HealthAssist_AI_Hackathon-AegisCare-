"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth, Role } from "@/context/AuthContext";
import { 
  User, 
  Stethoscope, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Key, 
  Loader2, 
  AlertCircle,
  HeartPulse
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [role, setRole] = useState<Role>("user");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint = "/users/login/";
      let payload: any = { password };

      if (role === "doctor") {
        endpoint = "/doctor-admin/login/";
        payload.email = email;
      } else if (role === "admin") {
        endpoint = "/admin/login/";
        payload.username = username;
      } else {
        endpoint = "/users/login/";
        payload.username = username;
      }

      const res = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.token) {
        login(res.token, role, { username, email });
        if (role === "doctor") {
          router.push("/doctor");
        } else if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white mx-auto shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
            Sign In to AegisCare
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Select your account type to access the medical portal
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

        <form onSubmit={handleLogin} className="space-y-4">
          
          {role === "doctor" ? (
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Doctor Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "admin" ? "admin_username" : "patient_username"}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>

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
                Authenticating...
              </>
            ) : (
              `Sign In as ${role.toUpperCase()}`
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[var(--muted-foreground)]">
          Don't have an account?{" "}
          <Link href="/signup" className="text-sky-400 font-bold hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
