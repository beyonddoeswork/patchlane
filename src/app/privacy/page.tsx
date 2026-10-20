import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Patchlane.",
  description: "Privacy Policy and data collection practices for Patchlane.",
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-100">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-2">Last Updated: October 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-700">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Information We Collect</h2>
            <p className="mb-3">Patchlane collects minimal operational data necessary to facilitate bug triage:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Agency Account Data:</strong> Email address, workspace agency name, and phone contact for authentication and billing records.</li>
              <li><strong>Client Bug Diagnostic Data:</strong> Viewport resolution, screen size, user-agent details (browser and operating system), submitted issue URLs, and optional client contact emails.</li>
              <li><strong>File Attachments:</strong> Screenshots uploaded by clients solely for bug reproduction purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. How Information Is Used</h2>
            <p>
              Collected data is used strictly to present reproduction context to developers, dispatch notification emails (such as team invitations, access revocations, and ticket receipt confirmations), and secure authorized project access. We do not sell or monetize personal diagnostic information to third-party ad networks.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. Account Deletion & Right to Erasure (GDPR / Privacy Laws)</h2>
            <p>
              When a developer is removed from a project by an agency owner and holds no remaining seats across Patchlane workspaces, their authentication record is deleted from Firebase Auth. You may request full erasure of your agency account and related ticket histories at any time by contacting our administrators.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Third-Party Infrastructure</h2>
            <p className="mb-2">
              Patchlane uses industry-standard cloud providers to operate safely:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Firebase (Google Cloud):</strong> Authentication and credential management.</li>
              <li><strong>MongoDB Atlas:</strong> Encrypted ticket storage and relational metadata.</li>
              <li><strong>Google SMTP:</strong> Transactional email dispatch for alerts and invites.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Security Measures</h2>
            <p>
              All communication with Patchlane is enforced via HTTPS using TLS 1.3 encryption. Diagnostic data is isolated by project workspace keys and guarded by role-based authorization checks.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}