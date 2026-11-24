import React from "react";
import { ShieldCheck, Heart, Terminal, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070a12] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">PassGuard Enterprise OS</p>
            <p className="text-xs text-slate-500">Autonomous Campus & Hostel Logistics Protocol</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sub-second TOTP Engine
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Auto-Approval Rules
          </span>
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
            Next.js 15 & PostgreSQL
          </span>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right">
          © {new Date().getFullYear()} PassGuard Systems. Built for High-Throughput Verification.
        </div>
      </div>
    </footer>
  );
}
