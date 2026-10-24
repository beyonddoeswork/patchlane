"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database, Eye, Globe2, Trash2 } from "lucide-react";

export default function PrivacyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GDPR, CCPA & DPDP Compliant</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">Last Updated: {lastUpdated}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 text-xs leading-relaxed text-slate-600">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              1. Information We Collect
            </h2>
            <p>Patchlane collects only data necessary to fulfill its bug tracking and developer triage service:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials</strong>: Email addresses, display names, job titles, and avatar preferences stored in Firebase Authentication and MongoDB.</li>
              <li><strong>Silent Client Diagnostics (Auto-Captured)</strong>: When a client opens a bug report URL (<code>/report/[slug]</code>), the browser captures screen resolution, window viewport dimensions, device operating system, language, and user-agent details strictly to assist developers in reproducing issues.</li>
              <li><strong>Bug Reports & Screenshots</strong>: Expected behavior, actual behavior, page URLs, optional client contact email, and screenshot image attachments.</li>
              <li><strong>Project Team Messages</strong>: Internal workspace messages exchanged between assigned developers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              2. How We Use and Process Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide, maintain, and secure the Patchlane platform.</li>
              <li>To send automated transactional notification emails via Google SMTP (invitations, credentials, removal notices, receipt confirmations).</li>
              <li>To prevent unauthorized access and maintain project-level access controls.</li>
            </ul>
            <p className="font-semibold text-slate-800">
              We never sell your personal data, agency project information, or client bug reports to third-party data brokers, marketers, or advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-indigo-600" />
              3. Automated Account Deletion & Data Retention
            </h2>
            <p>
              In compliance with the GDPR Principle of Data Minimization, when an agency lead removes a developer from a project workspace and the developer has no remaining project assignments anywhere on the platform, Patchlane automatically purges their Firebase Authentication user record and login credentials.
            </p>
            <p>
              When a project is deleted by its owner, all linked ticket records, screenshots, and chat messages are permanently deleted from MongoDB Atlas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-indigo-600" />
              4. International Privacy Rights (GDPR, CCPA/CPRA, India DPDP Act)
            </h2>
            <p>Regardless of your geographic location, you hold the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Right of Access & Portability</strong>: You may export all project reports in machine-readable Markdown format at any time using the "Export Report" tool.</li>
              <li><strong>Right to Rectification</strong>: You can update your display name and title directly inside your profile settings.</li>
              <li><strong>Right to Erasure ("Right to be Forgotten")</strong>: Project owners may delete projects and request complete account purging by emailing patchlanee@gmail.com.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Third-Party Sub-Processors
            </h2>
            <p>Patchlane utilizes trusted enterprise cloud infrastructure:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Vercel Inc.</strong>: Application hosting and edge serverless execution.</li>
              <li><strong>MongoDB Atlas</strong>: Database storage with encryption at rest and in transit.</li>
              <li><strong>Google Cloud Platform & Firebase</strong>: Identity management and Google SMTP transactional email delivery.</li>
            </ul>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <p className="text-[11px] text-slate-400">
              For privacy requests or inquiries, reach out to our privacy officer at <span className="font-mono text-indigo-600">patchlanee@gmail.com</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}