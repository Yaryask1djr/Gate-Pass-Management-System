"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, User, Phone, Home, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { HostelName } from "@/types";

const HOSTELS: HostelName[] = [
  "NCH-A",
  "NCH-B",
  "NC-1",
  "NC-2",
  "NC-3",
  "NC-4",
  "SUKHNA",
  "Govind",
  "Zakir",
];

export default function StudentSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    phone: "",
    hostel: "NCH-A" as HostelName,
    roomNumber: "",
    gender: "Male" as "Male" | "Female" | "Other",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "student",
        studentProfile: {
          rollNumber: formData.rollNumber,
          phone: formData.phone,
          hostel: formData.hostel,
          roomNumber: formData.roomNumber,
          gender: formData.gender,
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          leaveQuotaRemaining: 4,
        },
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/student/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto flex items-center justify-center text-rose-500 shadow-lg shadow-rose-950/40 mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Resident Onboarding
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Register your official student profile to generate and request campus passes
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Academic & Account Identity */}
            <div>
              <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">
                1. Account & Academic Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Roll / Student ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024CS089"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">University Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Hostel & Accommodation */}
            <div className="pt-4 border-t border-white/[0.06]">
              <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">
                2. Accommodation Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hostel Wing</label>
                  <select
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value as HostelName })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    {HOSTELS.map((h) => (
                      <option key={h} value={h} className="bg-slate-900">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 304"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Emergency & Parent Contact */}
            <div className="pt-4 border-t border-white/[0.06]">
              <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">
                3. Parent / Guardian Verification Contacts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Father's Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Father's WhatsApp / Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 11111"
                    value={formData.fatherPhone}
                    onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunita Sharma"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mother's Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 22222"
                    value={formData.motherPhone}
                    onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-rose-950/40 transition-all active:scale-[0.98]"
            >
              <span>{loading ? "Registering Resident..." : "Complete Registration & Launch Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link href="/student/login" className="text-rose-400 hover:text-rose-300 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
