"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  RefreshCw
} from "lucide-react";
import { GatePass } from "@/types";

export default function HistoryPage() {
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/passes")
      .then((res) => res.json())
      .then((data) => setPasses(data.passes || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = passes.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "All" || p.passType === filterType;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    const headers = ["PassID,StudentName,RollNumber,Hostel,Room,Type,Destination,Status,ActualOut,ActualIn\n"];
    const rows = passes.map(
      (p) =>
        `"${p.id}","${p.studentName}","${p.rollNumber}","${p.hostel}","${p.roomNumber}","${p.passType}","${p.destination}","${p.status}","${p.actualOutTime || ""}","${p.actualInTime || ""}"`
    );
    const blob = new Blob([...headers, rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PassGuard_Complete_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
            Historical Audit Registry
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pass Archives & Campus Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete institutional record of leaves, gate passages, timestamps and approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive CSV</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student, roll no, or pass ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Filter Type:</span>
          {["All", "Day", "Overnight", "Emergency"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterType === t
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Pass ID</th>
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Hostel & Room</th>
                <th className="pb-3 font-semibold">Pass Type</th>
                <th className="pb-3 font-semibold">Destination</th>
                <th className="pb-3 font-semibold">Actual Exit</th>
                <th className="pb-3 font-semibold">Actual Entry</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((pass) => (
                <tr key={pass.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-mono text-white font-medium">{pass.id}</td>
                  <td className="py-3.5 text-white font-semibold">
                    {pass.studentName}
                    <span className="block text-[10px] text-slate-400 font-mono font-normal">
                      {pass.rollNumber}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300">
                    {pass.hostel} • Room {pass.roomNumber}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.05] border border-white/[0.08]">
                      {pass.passType}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300 max-w-[180px] truncate">
                    {pass.destination}
                  </td>
                  <td className="py-3.5 text-slate-400 font-mono">
                    {pass.actualOutTime
                      ? new Date(pass.actualOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="py-3.5 text-slate-400 font-mono">
                    {pass.actualInTime
                      ? new Date(pass.actualInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        pass.status === "Approved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : pass.status === "Pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : pass.status === "CheckedOut"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : pass.status === "Completed"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
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
    </div>
  );
}
