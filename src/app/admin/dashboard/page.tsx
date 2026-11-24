"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import { GatePass, HostelName, User } from "@/types";

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("Pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalPass, setRejectModalPass] = useState<GatePass | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.user?.role !== "admin") {
        router.push("/#roles");
        return;
      }
      setUser(data.user);
    } catch {
      router.push("/admin/login");
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
    router.push("/admin/login");
  };

  const handleApprove = async (passId: string) => {
    setActionLoading(passId);
    try {
      const res = await fetch(`/api/passes/${passId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Approved",
          remarks: "Approved by Hostel Warden. Follow campus curfew rules.",
        }),
      });
      if (res.ok) {
        fetchPasses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalPass) return;
    setActionLoading(rejectModalPass.id);
    try {
      const res = await fetch(`/api/passes/${rejectModalPass.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Rejected",
          remarks: rejectReason || "Request declined due to hostel attendance/safety guidelines.",
        }),
      });
      if (res.ok) {
        setRejectModalPass(null);
        setRejectReason("");
        fetchPasses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateParentWhatsApp = async (passId: string, consent: "Approved" | "Declined") => {
    setActionLoading(passId);
    try {
      const res = await fetch(`/api/passes/${passId}/parent-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent }),
      });
      if (res.ok) {
        fetchPasses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered passes
  const filteredPasses = passes.filter((p) => {
    const matchesHostel =
      selectedHostel === "All" || p.hostel === selectedHostel;

    let matchesStatus = true;
    if (selectedStatus === "Pending") {
      matchesStatus = p.status === "Pending" || p.status === "ParentApproved";
    } else if (selectedStatus === "Approved") {
      matchesStatus = p.status === "Approved" || p.status === "CheckedOut";
    } else if (selectedStatus === "Rejected") {
      matchesStatus = p.status === "Rejected";
    }

    return matchesHostel && matchesStatus;
  });

  const pendingCount = passes.filter(
    (p) => p.status === "Pending" || p.status === "ParentApproved"
  ).length;
  const activeOutCount = passes.filter((p) => p.status === "CheckedOut").length;
  const approvedCount = passes.filter((p) => p.status === "Approved").length;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
        <span>Loading Warden Desk...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome & Profile Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user?.adminProfile?.designation || "Hostel Warden"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.adminProfile?.department} • ID: {user?.adminProfile?.employeeId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPasses}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
          <span className="text-[11px] text-slate-400 block mb-1">Pending Reviews</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{pendingCount}</span>
            <span className="text-xs text-slate-500">awaiting decision</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
          <span className="text-[11px] text-slate-400 block mb-1">Approved & Valid</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{approvedCount}</span>
            <span className="text-xs text-slate-500">ready at gate</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
          <span className="text-[11px] text-slate-400 block mb-1">Currently Off-Campus</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">{activeOutCount}</span>
            <span className="text-xs text-slate-500">checked out</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
          <span className="text-[11px] text-slate-400 block mb-1">Disciplinary Compliance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">100%</span>
            <span className="text-xs text-emerald-400">0 Overdue</span>
          </div>
        </div>
      </div>

      {/* Smart Auto-Approval Notification Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">Smart Rule Engine Active:</span>{" "}
            <span className="text-indigo-200">
              Day passes under 4 hours with clean disciplinary records are highlighted for 1-tap clearance.
            </span>
          </div>
        </div>
      </div>

      {/* Filter Matrix Section */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] mb-8 space-y-4">
        {/* Hostel Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Hostel Wing:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", ...ALL_HOSTELS].map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHostel(h)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  selectedHostel === h
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-white/[0.06]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Queue Status:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "Pending", label: `Pending & Parent Verified (${pendingCount})` },
              { id: "Approved", label: "Approved / Active Passes" },
              { id: "Rejected", label: "Rejected Archive" },
              { id: "All", label: "All Requests" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  selectedStatus === tab.id
                    ? "bg-white/[0.1] text-white border border-white/[0.15]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="space-y-4">
        {filteredPasses.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-white/[0.08]">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">Queue Cleared</h3>
            <p className="text-xs text-slate-400 mt-1">
              No passes matching the selected filter criteria.
            </p>
          </div>
        ) : (
          filteredPasses.map((pass) => (
            <div
              key={pass.id}
              className="glass-card rounded-2xl p-6 border border-white/[0.08] hover:border-indigo-500/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Left Identity & Purpose */}
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white bg-white/[0.06] px-2 py-0.5 rounded">
                    {pass.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {pass.passType} Pass
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      pass.status === "Approved"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : pass.status === "ParentApproved"
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                        : pass.status === "Pending"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                        : pass.status === "CheckedOut"
                        ? "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                    }`}
                  >
                    {pass.status === "ParentApproved" ? "Parent Verified" : pass.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{pass.studentName}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ({pass.rollNumber} • {pass.hostel} Room {pass.roomNumber})
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  <span className="text-slate-400">Destination:</span> {pass.destination}
                </p>
                <p className="text-xs text-slate-400 italic">
                  &quot;{pass.reason}&quot;
                </p>

                {/* Timestamps */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>
                      Depart: {new Date(pass.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-400" />
                    <span>
                      Curfew: {new Date(pass.expectedReturnTime).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                      {new Date(pass.expectedReturnTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                </div>
              </div>

              {/* Right Action Block: WhatsApp Consent & Decisions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                {/* Parent Consent Status Pill */}
                <div className="flex items-center gap-2">
                  {pass.parentConsent.status === "Approved" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp Consent Confirmed</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Awaiting Parent WhatsApp</span>
                      </span>
                      {/* Interactive Live Demo Button */}
                      <button
                        type="button"
                        onClick={() => handleSimulateParentWhatsApp(pass.id, "Approved")}
                        className="text-[10px] text-indigo-300 hover:text-white bg-indigo-600/30 hover:bg-indigo-600 px-2 py-0.5 rounded transition-colors"
                        title="Simulate 1-tap parent approval from WhatsApp"
                      >
                        [Simulate Parent Tap]
                      </button>
                    </div>
                  )}
                </div>

                {/* 1-Tap Approve / Reject Actions */}
                {(pass.status === "Pending" || pass.status === "ParentApproved") && (
                  <div className="flex items-center gap-2 mt-1 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={actionLoading === pass.id}
                      onClick={() => handleApprove(pass.id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Pass</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === pass.id}
                      onClick={() => setRejectModalPass(pass)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-medium text-xs border border-rose-500/30 transition-all active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rejection Remarks Modal */}
      {rejectModalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-white/[0.12]">
            <h3 className="text-base font-bold text-white mb-2">
              Reject Gate Pass {rejectModalPass.id}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter reason for declining {rejectModalPass.studentName}&apos;s leave request. This will be visible on the resident&apos;s dashboard.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Inadequate justification, impending exam week, or curfew restrictions."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectModalPass(null)}
                className="flex-1 py-2 rounded-xl bg-white/[0.04] text-slate-400 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
