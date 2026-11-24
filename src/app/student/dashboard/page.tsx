"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  QrCode,
  Sparkles,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { GatePass, User } from "@/types";
import { DynamicPassQR } from "@/components/pass/DynamicPassQR";
import { ApplyPassModal } from "@/components/pass/ApplyPassModal";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/student/login");
        return;
      }
      const data = await res.json();
      if (data.user?.role !== "student") {
        router.push("/#roles");
        return;
      }
      setUser(data.user);
    } catch (err) {
      router.push("/student/login");
    }
  };

  const fetchPasses = async () => {
    try {
      const res = await fetch("/api/passes");
      if (res.ok) {
        const data = await res.json();
        setPasses(data.passes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPasses();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/student/login");
  };

  // Find active pass that is approved or checked out
  const activePass = passes.find(
    (p) => p.status === "Approved" || p.status === "CheckedOut"
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
        <span>Loading Resident Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome & Profile Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Resident
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Roll: {user?.studentProfile?.rollNumber} • {user?.studentProfile?.hostel} (Room{" "}
              {user?.studentProfile?.roomNumber})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-950/40 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Gate Pass</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Grid: QR Pass + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Main Bento Column (Dynamic QR Pass) */}
        <div className="lg:col-span-7 flex flex-col">
          {activePass ? (
            <DynamicPassQR pass={activePass} />
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-white/[0.08] flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 mb-4">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-white">No Active Gate Pass Issued</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                You do not currently have an approved gate pass. Click below to submit an outing or weekend leave request.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Pass Request</span>
              </button>
            </div>
          )}
        </div>

        {/* Side Bento Column (Quick Metrics & Timeline) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Metrics Bento Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Monthly Leave Quota</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">3</span>
                <span className="text-xs text-slate-500">/ 4 left</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-3">
                <div className="bg-rose-500 h-1 rounded-full w-3/4" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Hostel Curfew</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">08:30</span>
                <span className="text-xs text-slate-500">PM</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">Night security gates active</p>
            </div>
          </div>

          {/* Pass Status Pipeline */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Active Itinerary Pipeline
              </h3>
              {activePass && (
                <span className="text-[11px] font-mono text-rose-400">
                  {activePass.passType} Pass
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Itinerary Submitted</p>
                  <p className="text-[11px] text-slate-400">Form and destination details registered</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Parent WhatsApp Verified</p>
                  <p className="text-[11px] text-slate-400">Automated 1-tap guardian consent confirmed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  activePass ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.05] text-slate-500"
                }`}>
                  {activePass ? "✓" : "3"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Hostel Warden Approved</p>
                  <p className="text-[11px] text-slate-400">Dr. Vikram Sethi sign-off recorded</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  activePass?.status === "CheckedOut"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/[0.05] text-slate-500"
                }`}>
                  {activePass?.status === "CheckedOut" ? "✓" : "4"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Gate Optical Checkpoint</p>
                  <p className="text-[11px] text-slate-400">Present dynamic QR to guard scanner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Passes List */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Pass Applications & Request History</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Archive of all current, historical and approved gate passes
            </p>
          </div>
          <button
            onClick={fetchPasses}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Pass ID</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Destination</th>
                <th className="pb-3 font-semibold">Departure</th>
                <th className="pb-3 font-semibold">Curfew Return</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {passes.map((pass) => (
                <tr key={pass.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-mono text-white font-medium">{pass.id}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.05] border border-white/[0.08]">
                      {pass.passType}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-white max-w-[200px] truncate">
                    {pass.destination}
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {new Date(pass.departureTime).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                    {new Date(pass.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {new Date(pass.expectedReturnTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        pass.status === "Approved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : pass.status === "Pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : pass.status === "CheckedOut"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {pass.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pass Application Modal */}
      <ApplyPassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchPasses}
      />
    </div>
  );
}
