"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Menu, X, ArrowUpRight, Lock } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-[1px] shadow-lg shadow-rose-950/40">
              <div className="w-full h-full bg-[#0d131f] rounded-[11px] flex items-center justify-center transition group-hover:bg-[#111928]">
                <ShieldCheck className="w-5 h-5 text-rose-500 transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-rose-400 transition-colors">
                  PassGuard<span className="text-rose-500">.</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Campus Gate Pass Management OS</p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full p-1 px-3">
            <Link
              href="/#roles"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.05] transition-all"
            >
              Role Portals
            </Link>
            <Link
              href="/admin/analytics"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.05] transition-all"
            >
              Analytics
            </Link>
            <Link
              href="/History"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.05] transition-all"
            >
              Pass Archives
            </Link>
            <Link
              href="/#features"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.05] transition-all"
            >
              Architecture
            </Link>
          </nav>

          {/* Right Status Badge & Primary CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-[11px]">Checkpoint Active</span>
            </div>

            <Link
              href="/#roles"
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-medium rounded-xl group bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-900/30 hover:shadow-rose-700/50 transition-all active:scale-95"
            >
              <span className="relative px-3.5 py-1.5 transition-all ease-in duration-75 bg-[#0e1422] rounded-[10px] group-hover:bg-transparent flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-colors" />
                <span>Enter Portal</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0d1320] px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/#roles"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/[0.05]"
          >
            Role Portals
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/[0.05]"
          >
            System Features
          </Link>
          <Link
            href="/#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/[0.05]"
          >
            Security & QR Engine
          </Link>
          <div className="pt-2">
            <Link
              href="/#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-rose-600 text-white font-medium text-sm shadow-md"
            >
              Select Your Role to Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
