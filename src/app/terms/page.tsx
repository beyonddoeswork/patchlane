import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Patchlane.",
  description: "Terms and conditions governing the use of Patchlane.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 selection:bg-indigo-600 selection:text-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black text-2xl tracking-tight text-slate-900">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 leading-relaxed">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-500 mt-2">Last Updated: October 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-700">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or creating an account on <strong>Patchlane</strong> ("the Platform"), operated by BeYonD Corp., you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, you must discontinue platform use immediately.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Service Description & Scope Management</h2>
            <p>
              Patchlane provides web design and software engineering agencies with client feedback intake portals, automated browser diagnostic extraction, defect triage, and scope differentiation tools. The Platform is an intake and management tool; it does not guarantee resolution of third-party software code defects.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. User Accounts, Team Provisioning & Deletion</h2>
            <p className="mb-2">
              Agencies are responsible for the activities of developers and managers assigned to their project portals. When an agency manager removes a collaborator from a project, credentials and access permissions may be automatically revoked and purged from our authentication databases.
            </p>
            <p>
              You agree to safeguard login credentials and immediately inform Patchlane administrators of any suspected unauthorized access to your account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Client Submissions & Content Guidelines</h2>
            <p>
              Clients submitting bug reports, screenshots, and URLs through project links agree not to upload harmful code, viruses, defamatory, or unlawful materials. Patchlane reserves the right to remove any report or media attachment that violates intellectual property rights or compromises platform security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Limitation of Liability</h2>
            <p>
              Under no circumstances shall Patchlane, BeYonD Corp., or its affiliates be held liable for incidental, indirect, consequential, or punitive damages resulting from system downtime, missed client SLA deadlines, loss of bug report data, or commercial contract disputes between agencies and their respective clients.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Modifications to Service</h2>
            <p>
              Patchlane reserves the right to modify, suspend, or discontinue aspects of the platform at any time with or without notice. Continued use of the platform after updates indicates your agreement to modified terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}