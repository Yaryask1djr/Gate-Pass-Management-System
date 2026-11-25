"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ScanLine,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  LogOut,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  Camera,
  Zap,
  AlertTriangle,
  User,
  ArrowRight,
  Sparkles,
  QrCode
} from "lucide-react";
import { GatePass, CheckpointLog, User as UserType } from "@/types";
import { playSuccessChime, playWarningBuzzer } from "@/lib/audio-chime";
import { CameraQRScanner } from "@/components/pass/CameraQRScanner";

export default function GuardDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [approvedPasses, setApprovedPasses] = useState<GatePass[]>([]);
  const [logs, setLogs] = useState<CheckpointLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Scanner State
  const [inputCode, setInputCode] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanResult, setScanResult] = useState<{
    status: "success" | "error";
    message: string;
    pass?: GatePass;
    action?: "OUT" | "IN";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/guard/login");
        return;
      }
      const data = await res.json();
      if (data.user?.role !== "guard") {
        router.push("/#roles");
        return;
      }
      setUser(data.user);
    } catch {
      router.push("/guard/login");
    }
  };

  const fetchPassesAndLogs = async () => {
    try {
      const [passesRes, logsRes] = await Promise.all([
        fetch("/api/passes"),
        fetch("/api/passes/logs"),
      ]);

      if (passesRes.ok) {
        const pData = await passesRes.json();
        setApprovedPasses(pData.passes || []);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPassesAndLogs();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/guard/login");
  };

  const processScan = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    let targetPassId = codeToVerify.trim();
    let qrPayload: string | undefined = undefined;

    if (targetPassId.startsWith("{")) {
      try {
        const parsed = JSON.parse(targetPassId);
        if (parsed.passId) {
          qrPayload = targetPassId;
          targetPassId = parsed.passId;
        }
      } catch {
        // Fallback to raw string
      }
    }

    try {
      const res = await fetch("/api/passes/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passId: targetPassId, qrPayload }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (soundEnabled) playWarningBuzzer();
        setScanResult({
          status: "error",
          message: data.error || "Scan verification rejected",
          pass: data.pass,
        });
      } else {
        if (soundEnabled) playSuccessChime();
        setScanResult({
          status: "success",
          message: data.message,
          pass: data.pass,
          action: data.action,
        });
        fetchPassesAndLogs();
      }
    } catch (err: any) {
      if (soundEnabled) playWarningBuzzer();
      setScanResult({
        status: "error",
        message: err.message || "Network communication error with gate controller",
      });
    } finally {
      setInputCode("");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScan(inputCode);
  };

  // Filter approved passes
  const filteredApproved = approvedPasses.filter(
    (p) =>
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
        <span>Initializing Security Checkpoint Station...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome & Gate Info */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Security Officer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Station: {user?.guardProfile?.assignedGate} • Shift: {user?.guardProfile?.shift}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs ${
              soundEnabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-white/[0.04] border-white/[0.06] text-slate-500"
            }`}
            title="Toggle Audio Feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Audio Mute"}</span>
          </button>
          <button
            onClick={fetchPassesAndLogs}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors"
            title="Sync Registry"
          >
            <RefreshCw className="w-4 h-4" />
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

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Column: High-Throughput Camera / Optical Scanner View (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Optical Viewfinder
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                SUB-300MS SENSOR READY
              </span>
            </div>

            {/* Live Camera Optical QR Scanner */}
            <CameraQRScanner onScan={(decoded) => processScan(decoded)} />

            {/* 1-Tap Quick Demo & Manual Code Input Form */}
            <div className="mt-6 space-y-4">
              {/* Quick Demo Scan Button */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Test Active Resident Pass:</span>
                </div>
                <button
                  type="button"
                  onClick={() => processScan("GP-9421")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Tap Scan GP-9421 (Aryan)</span>
                </button>
              </div>

              {/* Manual Barcode / Pass ID Input Form */}
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Scan barcode or enter Pass ID (e.g. GP-9421)..."
                    className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Verify
                </button>
              </form>
            </div>
          </div>

          {/* Verification Result Display Banner */}
          {scanResult && (
            <div
              className={`rounded-2xl p-6 border transition-all ${
                scanResult.status === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    scanResult.status === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {scanResult.status === "success" ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      {scanResult.status === "success"
                        ? `CHECKPOINT ${scanResult.action === "OUT" ? "EXIT APPROVED" : "ENTRY APPROVED"}`
                        : "ACCESS DENIED / INVALID PASS"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white mt-1">
                    {scanResult.message}
                  </p>

                  {scanResult.pass && (
                    <div className="mt-3 pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Student Name</span>
                        <span className="font-semibold text-white">
                          {scanResult.pass.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {scanResult.pass.rollNumber} • {scanResult.pass.hostel} (
                          {scanResult.pass.roomNumber})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Curfew Deadline</span>
                        <span className="font-semibold text-emerald-400">
                          {new Date(scanResult.pass.expectedReturnTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Pass Type: {scanResult.pass.passType}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Approved Registry & Real-Time Audit Logs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active Approved Passes for Today */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Valid Passes Queue ({filteredApproved.length})
              </h3>
              <span className="text-[10px] text-slate-400">Live Gate Sync</span>
            </div>

            {/* Quick Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredApproved.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No active approved passes found.
                </p>
              ) : (
                filteredApproved.map((pass) => (
                  <div
                    key={pass.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 hover:bg-white/[0.05] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          {pass.studentName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300">
                          {pass.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {pass.rollNumber} • {pass.hostel}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[160px]">
                        {pass.destination}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => processScan(pass.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 text-[11px] font-medium transition-all"
                    >
                      {pass.status === "Approved" ? "Verify Exit" : "Verify In"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Checkpoint Audit Logs */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Checkpoint Audit Log Feed
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No gate scans logged yet today.
                </p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="text-xs p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.action === "OUT" ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                        />
                        <span className="font-semibold text-white">
                          {log.studentName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({log.rollNumber})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Action: <span className="font-semibold text-white">{log.action}</span> • Gate: {log.gate}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
