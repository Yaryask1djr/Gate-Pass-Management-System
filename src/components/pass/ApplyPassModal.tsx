"use client";

import React, { useState } from "react";
import { X, Send, Sparkles, AlertCircle, Clock, Calendar, MapPin, FileText, CheckCircle2 } from "lucide-react";
import { PassType } from "@/types";

interface ApplyPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplyPassModal({ isOpen, onClose, onSuccess }: ApplyPassModalProps) {
  const [passType, setPassType] = useState<PassType>("Day");
  const [destination, setDestination] = useState("");
  const [reason, setReason] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [expectedReturnTime, setExpectedReturnTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-fill sensible default dates for demo ease
  const handleQuickPreset = (type: PassType) => {
    setPassType(type);
    const now = new Date();
    const depart = new Date(now.getTime() + 30 * 60 * 1000);
    const isoDepart = depart.toISOString().slice(0, 16);
    setDepartureTime(isoDepart);

    if (type === "Day") {
      const ret = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      setExpectedReturnTime(ret.toISOString().slice(0, 16));
      setDestination("City Center & Technical Bookstore");
      setReason("Project supplies and reference material procurement");
    } else if (type === "Overnight") {
      const ret = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      setExpectedReturnTime(ret.toISOString().slice(0, 16));
      setDestination("Family Residence (Delhi NCR)");
      setReason("Weekend family visit and sister's birthday");
    } else {
      const ret = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      setExpectedReturnTime(ret.toISOString().slice(0, 16));
      setDestination("Campus Health Center / City Hospital");
      setReason("Emergency medical checkup and dental appointment");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passType,
          destination,
          reason,
          departureTime: new Date(departureTime).toISOString(),
          expectedReturnTime: new Date(expectedReturnTime).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit gate pass request");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl glass-panel rounded-2xl p-6 sm:p-7 border border-white/[0.12] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
            Resident Request Desk
          </div>
          <h2 className="text-xl font-bold text-white">Apply for Gate Pass</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit your itinerary for warden clearance and digital QR issuance
          </p>
        </div>

        {/* Pass Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {(["Day", "Overnight", "Emergency"] as PassType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleQuickPreset(type)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                passType === type
                  ? "bg-rose-600/30 border-rose-500 text-rose-200 shadow-sm"
                  : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12]"
              }`}
            >
              {type === "Day" && "Day Pass (<4h)"}
              {type === "Overnight" && "Home / Night Out"}
              {type === "Emergency" && "Emergency"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Destination & Address</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. City Center, Central Library, or Home Address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Reason for Leave</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="State clear purpose of visit..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Planned Departure Time</span>
              </label>
              <input
                type="datetime-local"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Expected Return Curfew</span>
              </label>
              <input
                type="datetime-local"
                required
                value={expectedReturnTime}
                onChange={(e) => setExpectedReturnTime(e.target.value)}
                className="w-full bg-[#0d1320] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-rose-950/40 transition-all active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Submitting Itinerary..." : "Submit Pass Application"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
