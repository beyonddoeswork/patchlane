"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, FileCheck, Users, Ban, Scale } from "lucide-react";

export default function TermsPage() {
  const lastUpdated = "October 24, 2026";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight text-slate-900">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-500 mt-1">Last Updated: {lastUpdated}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 text-xs leading-relaxed text-slate-600">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "Agency", or "Client") and Patchlane.
              By accessing our platform, creating client workspaces, assigning developers, or submitting bug reports, you agree to be bound by these Terms,
              our End User License Agreement (EULA), and our Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              2. Accounts & Agency Team Management
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Authorized Agency Leads</strong>: Agency owners are solely responsible for all activities that occur under their workspaces and for assigning appropriate roles (Owner, Agency Admin, Developer).</li>
              <li><strong>Temporary Passwords</strong>: Patchlane automatically generates temporary credentials for provisioned developers. Users must change temporary credentials upon initial login. Patchlane holds zero liability for unauthorized access resulting from leaked credentials or weak passwords.</li>
              <li><strong>Orphaned Credential Deletion</strong>: When an agency manager removes a developer from a project and that user is not assigned to any other workspace on the platform, Patchlane automatically purges their Firebase Authentication credentials in compliance with data minimization laws.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              3. Scope Creep & Warranty Defect Classification
            </h2>
            <p>
              Patchlane provides ticketing toggles for "Warranty Defect" and "Scope Expansion (Billable)". These categorizations are provided as an internal workflow mechanism for agencies. Patchlane does not provide legal, contractual, or financial advice. The agency remains entirely responsible for validating and confirming billing terms with its respective clients.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Ban className="w-4 h-4 text-indigo-600" />
              4. Prohibited Uses & Content Standards
            </h2>
            <p>You agree not to use Patchlane to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Upload screenshots or chat content containing child sexual abuse material (CSAM), hate speech, terroristic threats, or defamatory material.</li>
              <li>Upload unredacted personally identifiable information, financial account numbers, credit card data, or sensitive government credentials.</li>
              <li>Send unsolicited bulk emails (spam) via the client submission notifications or SMTP triggers.</li>
            </ul>
            <p>We reserve the right to immediately terminate any workspace or user account that violates these standards without notice or refund.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Intellectual Property & Customer Data
            </h2>
            <p>
              <strong>Your Data</strong>: You retain all rights to tickets, screenshots, files, and project names you submit to Patchlane. You grant Patchlane a worldwide, royalty-free license to host, store, and display your data strictly for providing the service.
            </p>
            <p>
              <strong>Platform IP</strong>: The software architecture, UI design, Patchlane wordmark, logos, and code are the exclusive property of Patchlane.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              6. Limitation of Liability & Indemnity
            </h2>
            <p className="font-semibold text-slate-800 uppercase">
              In no event shall Patchlane be liable for loss of profits, agency revenue, customer goodwill, or punitive damages. Your exclusive remedy for any dissatisfaction with the service is to terminate your account.
            </p>
            <p>
              You agree to indemnify and hold harmless Patchlane from any claims or damages arising from your violation of these Terms or infringement on any third party’s intellectual property rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              7. Service Modifications & Pricing
            </h2>
            <p>
              Patchlane reserves the right to modify, suspend, or discontinue any aspect of the service with or without notice. We reserve the right to establish subscription pricing tiers upon notice.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <p className="text-[11px] text-slate-400">
              Questions regarding these Terms of Service should be directed to <span className="font-mono text-indigo-600">patchlanee@gmail.com</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}