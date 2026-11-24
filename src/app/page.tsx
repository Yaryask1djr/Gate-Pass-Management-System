import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  Building2,
  ScanLine,
  ArrowRight,
  Clock,
  QrCode,
  CheckCircle2,
  BellRing,
  Sparkles,
  Zap,
  Lock,
  ChevronRight,
  UserCheck,
  Smartphone
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden pb-20">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Hero Header Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Innovation Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-xs text-slate-300 mb-8 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-medium text-slate-200">PassGuard Architecture 2.0</span>
          <span className="w-1 h-1 rounded-full bg-slate-500" />
          <span className="text-rose-400 font-semibold">Sub-300ms QR Verification</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Campus Transit, Redefined. <br />
          <span className="gradient-text">Zero Gate Queues.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The next-generation gate pass & campus logistics operating system. Replacing congested manual OTPs with cryptographic dynamic QR codes, automated parent consent, and instant warden approvals.
        </p>

        {/* Live Metrics Row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>&lt; 300ms Optical Scan</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>HMAC Rotating TOTP</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Hostel Matrix</span>
          </div>
        </div>
      </section>

      {/* Role Selection Bento Section */}
      <section id="roles" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Choose Your Operational Portal
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Select your assigned role to access customized dashboards, workflows, and security tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Student Resident */}
          <div className="glass-card rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden group border border-white/[0.08] hover:border-rose-500/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
                Residents & Students
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
                Student Portal
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Submit Day, Weekend, or Emergency gate passes in 30 seconds. Generate rotating dynamic QR passes and track review status in real time.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Dynamic Rotating QR Pass (Anti-Counterfeit)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Live Curfew Countdown Timer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Instant Status Push Notifications</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-2.5">
              <Link
                href="/student/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-950/40 transition-all active:scale-[0.98]"
              >
                <span>Login as Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/student/signup"
                className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-xs transition-colors"
              >
                New Resident Registration
              </Link>
            </div>
          </div>

          {/* Card 2: Hostel Warden */}
          <div className="glass-card rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden group border border-white/[0.08] hover:border-indigo-500/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                Campus Life & Warden Desk
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                Warden & Admin Portal
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Approve or reject passes with a single tap. Filter incoming requests by assigned hostel wing, room number, or student attendance history.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Smart Auto-Approval Rules Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>WhatsApp Parent Consent Webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Disciplinary & Overdue Alert Flags</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-2.5">
              <Link
                href="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-950/40 transition-all active:scale-[0.98]"
              >
                <span>Login as Campus Admin / Warden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/signup"
                className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-xs transition-colors"
              >
                Campus Life Staff Onboarding
              </Link>
            </div>
          </div>

          {/* Card 3: Security Guard */}
          <div className="glass-card rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden group border border-white/[0.08] hover:border-emerald-500/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ScanLine className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                Checkpoint Security
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                Guard Scanner PWA
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Sub-second camera scanning station for mobile or tablet. Automatically registers actual out and in timestamps with audio feedback chimes.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sub-Second Camera Barcode & QR Reader</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Audible Ping (Pass) & Buzz (Fail) Chimes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Quick Manual Search & OTP Fallback</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-2.5">
              <Link
                href="/guard/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
              >
                <span>Access Scanner Station</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/guard/signup"
                className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-xs transition-colors"
              >
                Checkpoint Officer Onboarding
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Showcase Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-3">
            Engineered For Throughput
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            How The Enhanced System Solves Campus Bottlenecks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Card 1: Dynamic QR Code Pass (7 cols) */}
          <div className="md:col-span-7 glass-panel rounded-2xl p-7 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                  Feature 01: Frictionless Checkpoint
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300">
                  REFRESH: 15s
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Dynamic Cryptographic QR Passes</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-lg">
                Eliminate fraudulent screenshots and 6-digit OTP queue slowdowns. Every approved pass renders a time-rotating HMAC-SHA256 barcode with dynamic holographic shimmering.
              </p>
            </div>

            {/* Interactive Preview Mock */}
            <div className="mt-6 p-4 rounded-xl bg-[#090e18]/80 border border-white/[0.08] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white p-1 flex items-center justify-center shadow-md">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">Aryan Sharma</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                      APPROVED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">PASS #GP-9421 • Room 304 (NCH-A)</p>
                  <p className="text-[10px] text-rose-400 mt-0.5 font-medium">Valid until 08:30 PM (2h 15m remaining)</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                <span className="text-[10px] text-slate-400 font-mono">SCAN READY</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Parent WhatsApp Consent (5 cols) */}
          <div className="md:col-span-5 glass-panel rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Feature 02: Verification Loop
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300">
                  AUTOMATED
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">1-Tap Parent Consent Flow</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Overnight leave applications trigger an instant interactive message to parents via WhatsApp or SMS.
              </p>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-[#090e18]/80 border border-white/[0.08] space-y-2">
              <div className="text-[11px] text-slate-300">
                <span className="font-semibold text-indigo-300">WhatsApp Alert:</span> &quot;Aryan has applied for a Home Leave Pass until Sunday 8:00 PM.&quot;
              </div>
              <div className="flex gap-2 pt-1">
                <button className="flex-1 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 text-center">
                  ✓ Tap to Approve
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-rose-600/30 border border-rose-500/30 text-[11px] font-medium text-rose-300 text-center">
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
