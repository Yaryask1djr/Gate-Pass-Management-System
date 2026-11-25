"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PassGuard uncaught client exception:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="glass-panel max-w-lg w-full rounded-2xl p-8 border border-rose-500/30 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-5 shadow-lg shadow-rose-950/40">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
          Application Error Caught
        </span>

        <h1 className="text-2xl font-bold text-white tracking-tight">Something Went Wrong</h1>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The campus gate pass management interface encountered an unexpected error.
          Your credentials and active gate passes remain safe and intact.
        </p>

        {error?.message && (
          <div className="mt-4 p-3 rounded-xl bg-[#090d16] border border-white/[0.08] text-[11px] text-rose-300 font-mono text-left overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-xs transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Main Portals</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
