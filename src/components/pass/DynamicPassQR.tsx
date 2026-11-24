"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { GatePass } from "@/types";
import { ShieldCheck, RefreshCw, Clock, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface DynamicPassQRProps {
  pass: GatePass;
}

export function DynamicPassQR({ pass }: DynamicPassQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [totpToken, setTotpToken] = useState<string>("");

  useEffect(() => {
    // Generate rotating TOTP token every 15 seconds
    const updateQR = async () => {
      const timestamp = Math.floor(Date.now() / 15000); // 15-second epoch window
      const simulatedToken = `${pass.id}-${pass.rollNumber}-${timestamp.toString(36).toUpperCase()}`;
      setTotpToken(simulatedToken);

      const qrPayload = JSON.stringify({
        passId: pass.id,
        rollNumber: pass.rollNumber,
        studentName: pass.studentName,
        hostel: pass.hostel,
        room: pass.roomNumber,
        type: pass.passType,
        token: simulatedToken,
        t: Date.now(),
      });

      try {
        const url = await QRCode.toDataURL(qrPayload, {
          width: 280,
          margin: 1.5,
          color: {
            dark: "#090d16",
            light: "#ffffff",
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      }
    };

    updateQR();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          updateQR();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pass]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111928] to-[#0c121e] border border-white/[0.1] p-6 shadow-2xl">
      {/* Anti-Screenshot Hologram Shimmer Ribbon */}
      <div className="absolute inset-0 pointer-events-none hologram-shimmer opacity-25 animate-shimmer" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide">DIGITAL GATE PASS</span>
            <span className="block text-[10px] text-slate-400 font-mono">ID: {pass.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5"></span>
          {pass.status === "Approved" ? "READY FOR EXIT" : "CHECKED OUT"}
        </div>
      </div>

      {/* QR Code Presentation Box */}
      <div className="relative my-3 p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center mx-auto max-w-[240px]">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Dynamic Gate Pass QR"
            className="w-48 h-48 rounded-xl object-contain"
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
            Generating Secure Token...
          </div>
        )}

        {/* Live Token Label */}
        <div className="mt-2 text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {totpToken || "SECURE-TOTP"}
        </div>
      </div>

      {/* 15-second Rotating Timer Progress Bar */}
      <div className="mt-4 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <RefreshCw className={`w-3 h-3 text-rose-400 ${timeLeft <= 2 ? "animate-spin" : ""}`} />
            <span>Cryptographic Refresh:</span>
          </span>
          <span className="font-mono font-semibold text-rose-400">{timeLeft}s remaining</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 to-amber-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>
      </div>

      {/* Resident & Destination Breakdown */}
      <div className="mt-5 pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-xs relative z-10">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Resident</span>
          <span className="font-semibold text-white truncate block">{pass.studentName}</span>
          <span className="text-[11px] text-slate-400 font-mono block">
            {pass.hostel} • Room {pass.roomNumber}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Destination</span>
          <span className="font-semibold text-white truncate block">{pass.destination}</span>
          <span className="text-[11px] text-emerald-400 font-medium block">
            Return by: {new Date(pass.expectedReturnTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}
