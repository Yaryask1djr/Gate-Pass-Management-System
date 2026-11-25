"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, User, Phone, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { HostelName } from "@/types";

const ALL_HOSTELS: HostelName[] = [
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

export default function AdminSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "Campus Life & Student Affairs",
    designation: "Hostel Warden",
    phone: "",
    assignedHostels: ["NCH-A", "NCH-B"] as HostelName[],
    staffSecret: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleHostel = (hostel: HostelName) => {
    if (formData.assignedHostels.includes(hostel)) {
      setFormData({
        ...formData,
        assignedHostels: formData.assignedHostels.filter((h) => h !== hostel),
      });
    } else {
      setFormData({
        ...formData,
        assignedHostels: [...formData.assignedHostels, hostel],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "admin",
        staffSecret: formData.staffSecret,
        adminProfile: {
          employeeId: formData.employeeId,
          department: formData.department,
          designation: formData.designation,
          phone: formData.phone,
          assignedHostels: formData.assignedHostels,
        },
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register staff account");
      }

      router.push("/admin/dashboard");
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
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-950/40 mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Staff & Warden Onboarding
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Create your administrative profile for pass reviews, leave rules & student logistics
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
            <div>
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                1. Faculty / Staff Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name & Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Vikram Sethi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Employee / Staff ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADM-9042"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="warden@campus.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
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
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-amber-300">
                    Institutional Staff Authorization Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, staffSecret: "CAMPUS-STAFF-2025" })}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Use Demo Key (CAMPUS-STAFF-2025)
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter institutional onboarding security code..."
                  value={formData.staffSecret}
                  onChange={(e) => setFormData({ ...formData, staffSecret: e.target.value })}
                  className="w-full bg-[#0d1320] border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Prevents unauthorized self-registration of administrative accounts.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                2. Department & Designation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="Campus Life & Student Affairs"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Hostel Warden"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  3. Assigned Hostel Wings (Select all that apply)
                </h3>
                <span className="text-[11px] text-slate-400">
                  {formData.assignedHostels.length} selected
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ALL_HOSTELS.map((hostel) => {
                  const selected = formData.assignedHostels.includes(hostel);
                  return (
                    <button
                      type="button"
                      key={hostel}
                      onClick={() => toggleHostel(hostel)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        selected
                          ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.15]"
                      }`}
                    >
                      {hostel}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-indigo-950/40 transition-all active:scale-[0.98]"
            >
              <span>{loading ? "Registering Supervisor..." : "Complete Onboarding & Enter Desk"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link href="/admin/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign In to Warden Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
