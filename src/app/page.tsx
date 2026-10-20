"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Laptop, 
  Globe, 
  ExternalLink, 
  Check, 
  X, 
  Copy, 
  Download, 
  CheckCircle2, 
  SlidersHorizontal,
  Clock,
  Layers,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-black text-2xl tracking-tight text-slate-900 flex items-center">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>
          <div className="flex gap-3 sm:gap-4 items-center">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition"
            >
              Agency Login
            </Link>
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg transition shadow-xs"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Client bug reports that developers{" "}
            <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">
              can actually reproduce.
            </span>
          </h1>

          <p className="mt-7 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            One clean feedback link per client. Zero client logins. Captures browser context, viewport sizes, and separates warranty fixes from unpaid scope creep.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row justify-center items-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <span>Start Free Agency Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/report/demo-project"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-xs transition"
            >
              <span>Preview Client Form</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            No credit card required • Unlimited client submissions
          </p>
        </motion.div>
      </section>

      {/* Realistic Product UI Showcase */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-slate-950 rounded-2xl p-2.5 sm:p-4 shadow-2xl border border-slate-800">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-4 text-xs text-slate-400 font-mono">
            <div className="flex gap-1.5 items-center">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="bg-slate-900 border border-slate-800 px-4 py-1 rounded-md text-[11px] text-slate-300">
              Patchlane.app/dashboard
            </span>
            <span className="text-[11px] text-indigo-400 font-sans font-semibold">Live Console</span>
          </div>

          {/* Interactive UI Mock Window */}
          <div className="bg-slate-100 rounded-xl p-4 sm:p-6 border border-slate-200/80">
            {/* Mock Dashboard Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Project:</span>
                <span className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs">
                  Nike Store Launch (/report/nike-launch)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs bg-white text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Client Link</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </span>
              </div>
            </div>

            {/* Mock Cards */}
            <div className="space-y-3">
              {/* Card 1: Billable Scope Expansion */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold mr-2">
                      /checkout
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      "We want to add Apple Pay alongside Stripe"
                    </span>
                    <span className="text-xs text-slate-400 ml-2">from client@brand.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg">
                      Open
                    </span>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg">
                      Scope Expansion (Billable)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2.5 text-xs text-slate-600">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5">Expected:</span>
                    <p>Support Apple Pay and Google Pay express checkouts</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5">Actual:</span>
                    <p>Only credit card inputs were agreed upon in Milestone 1</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Laptop className="w-3.5 h-3.5" /> 1440×900 (Viewport: 1440×789) • Mac OS X • Chrome 124
                  </span>
                  <span className="text-indigo-600 font-semibold cursor-pointer">View Screenshot (1)</span>
                </div>
              </div>

              {/* Card 2: Genuine Warranty Defect */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold mr-2">
                      /products/sneaker-air
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      "Image gallery arrows vanish on mobile Safari"
                    </span>
                    <span className="text-xs text-slate-400 ml-2">from client@brand.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg">
                      In Progress
                    </span>
                    <span className="text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg">
                      Defect (Warranty)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2.5 text-xs text-slate-600">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5">Expected:</span>
                    <p>Previous/Next chevron icons should be visible to swipe photos</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5">Actual:</span>
                    <p>Z-index bug pushes controls behind the hero gradient</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Laptop className="w-3.5 h-3.5" /> 393×852 (iPhone 15 Pro) • iOS 17.4 • Mobile Safari
                  </span>
                  <span className="text-indigo-600 font-semibold cursor-pointer">View Screenshot (1)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Pain: Before Patchlane vs With Patchlane */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Stop losing 5+ hours every sprint decoding client complaints.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-xl mx-auto">
            Clients aren't software engineers. When they find an issue, they send vague messages across 3 different channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Messy Way */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm uppercase tracking-wider mb-4">
              <X className="w-4 h-4" />
              <span>Without Patchlane</span>
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Vague WhatsApp messages:</strong> "The button is broken" with zero page link, device info, or reproduction steps.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Forced tool adoption:</strong> Clients refuse to create Jira or Linear logins, so feedback scatters across emails.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Unpaid scope creep:</strong> Clients disguise brand-new features as "bugs", and your devs end up building them for free.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Disputed signoffs:</strong> No audit trail when the client asks: "Wait, what did we actually test before final payment?"</span>
              </li>
            </ul>
          </div>

          {/* Patchlane Way */}
          <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase tracking-wider mb-4">
              <Check className="w-4 h-4" />
              <span>With Patchlane</span>
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-600 font-bold">✓</span>
                <span><strong>One permanent portal link:</strong> Give the client a dedicated URL they can bookmark on their phone or browser.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-600 font-bold">✓</span>
                <span><strong>Zero-friction forms:</strong> Collects "Expected vs Actual", affected URL, and optional screenshot in 30 seconds.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-600 font-bold">✓</span>
                <span><strong>Silent auto-diagnostics:</strong> Gathers device model, OS, screen resolution, and window viewport automatically.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-600 font-bold">✓</span>
                <span><strong>1-Click scope protection:</strong> Mark items as "Defect (Warranty)" or "Scope Expansion (Billable)" with a clear paper trail.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="bg-slate-100/70 border-y border-slate-200/70 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Frictionless Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-1">
              How it works in your daily agency routine
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Create Project & Send Link</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Spin up a project key in 5 seconds (e.g., <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">/report/tesla</code>). Copy and send it to your client via email or Slack.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Client Logs Issues Directly</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The client opens the page with zero account setup. Patchlane collects structured context and attaches screen diagnostics automatically.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Triage, Fix & Export Proof</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Categorize defects vs billable scope creep. When the milestone is complete, download the clean audit report before final invoice release.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props Grid */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Built for developers delivering real client work
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Every feature is designed to protect your margin and eliminate communication overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Defect vs Scope Creep</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Never let clients slip new features into QA as "bugs". Tag items as billable changes to quote separately without friction.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Automatic Diagnostics</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Captures display resolution, browser window dimensions, and user agent strings on submission so your developers don't have to ask.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Milestone Acceptance Export</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Export every reported item, diagnosis, and resolution note into a structured summary to attach to your final delivery sign-off.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 mb-1.5">
                Do my clients need to create an account?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No. Clients never create an account or install browser plugins. They visit your project's unique link, type their feedback, attach an optional screenshot, and submit in seconds.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 mb-1.5">
                How does this protect my agency from scope creep?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When a client reports something outside the original specification, you mark it as "Scope Expansion (Billable)". This creates a clear acceptance record showing what was a warranty bug versus a paid change request.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 mb-1.5">
                Can I manage multiple client websites at the same time?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Yes. You can create distinct projects for each client or deliverable. Each project gets its own URL and isolated ticket queue.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 mb-1.5">
                What happens when a project is completed?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You can download the full acceptance audit report for your records and delete the project from your dashboard to keep your workspace uncluttered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-slate-950 text-white py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready for cleaner client handoffs?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Set up your agency console in under two minutes and send your first client link today.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition text-sm sm:text-base"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Compliant Footer with Legal Navigation */}
      <footer className="py-10 text-xs text-slate-400 bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Patchlane.</span>
            <span>&copy; {new Date().getFullYear()} BeYonD Corp. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-200 transition underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-slate-200 transition underline underline-offset-4">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}