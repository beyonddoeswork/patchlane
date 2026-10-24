"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, FileText, Lock, Scale, AlertOctagon } from "lucide-react";

export default function EULAPage() {
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
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">End User License Agreement (EULA)</h1>
          <p className="text-xs text-slate-500 mt-1">Last Updated: {lastUpdated}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 text-xs leading-relaxed text-slate-600">
          <section className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Important Notice — Read Carefully Before Using Patchlane.
                </strong>
                <p className="text-[11px] leading-relaxed">
                  By accessing, creating an account, submitting a bug report, or using the Patchlane platform located at
                  patchlane-iota.vercel.app (or custom domains), you confirm that you have read, understood, and agreed to be legally
                  bound by this End User License Agreement. If you do not accept these terms, do not access or use this software.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              1. Grant of Limited License
            </h2>
            <p>
              Subject to your strict compliance with this Agreement, Patchlane grants you a revocable, non-exclusive, non-transferable,
              non-sublicensable, limited personal license to access and use the Patchlane SaaS web application solely for tracking software issues,
              managing client feedback, and collaborating with assigned agency developers.
            </p>
            <p>
              This is a license grant, not a transfer of title. Patchlane and its licensors retain complete, exclusive ownership of all
              intellectual property rights, source code, designs, algorithms, trademarks, and documentation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              2. License Restrictions
            </h2>
            <p>You agree not to, and you will not permit any third party to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Decompile, reverse-engineer, disassemble, or attempt to derive the source code of Patchlane.</li>
              <li>Rent, lease, lend, resell, distribute, sublicense, or commercially exploit access to the platform without prior written approval.</li>
              <li>Circumvent, disable, or tamper with security features, API rate limits, or Firebase authentication mechanisms.</li>
              <li>Use any robot, spider, crawler, or automated scraper to access or harvest data from any workspace or client report endpoint.</li>
              <li>Transmit malicious scripts, worms, viruses, or illegal materials through ticket descriptions, attachments, or group chat.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              3. Disclaimer of All Warranties ("AS-IS" and "AS-AVAILABLE")
            </h2>
            <p className="font-semibold text-slate-800 uppercase">
              To the maximum extent permitted by applicable law, Patchlane provides the software, client portals, telemetry diagnostics, and notification systems strictly on an "as is" and "as available" basis, with all faults and without warranty of any kind.
            </p>
            <p>
              Patchlane disclaims all representations, warranties, conditions, or guarantees—express, implied, statutory, or otherwise—including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, quiet enjoyment, accuracy of client device telemetry, system uptime, and non-infringement.
            </p>
            <p>
              Patchlane makes no warranty that: (a) the service will meet your or your clients’ requirements; (b) defects or scope classifications will prevent third-party legal claims or agency disputes; (c) the service will be continuous, timely, secure, or free from serverless runtime errors; or (d) emails sent via third-party SMTP relays will be delivered without spam filter rejection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              4. Complete Limitation of Liability & Damages Cap
            </h2>
            <p className="font-semibold text-slate-800 uppercase">
              Under no circumstances shall Patchlane, its founders, contractors, directors, or suppliers be liable for any indirect, incidental, consequential, special, punitive, or exemplary damages whatsoever (including, without limitation, damages for loss of agency profits, business interruption, loss of client contracts, loss or corruption of bug data, or failure of acceptance reports), even if advised of the possibility of such damages.
            </p>
            <p>
              In all events, the aggregate liability of Patchlane arising out of or related to this Agreement or your use of the service—whether in contract, tort (including negligence), strict liability, or otherwise—shall be strictly limited to the greater of: (i) the total subscription fees actually paid by you to Patchlane in the three (3) months preceding the incident, or (ii) one hundred U.S. dollars ($100.00 USD).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Third-Party Dispute Disclaimer (Agency vs. Client Scope Disputes)
            </h2>
            <p>
              Patchlane is solely a communications tool. Patchlane is not a party to any contract, scope statement, warranty clause, or milestone agreement between an agency and its clients. Patchlane shall bear no liability for any fee disputes, refunds, litigation, or non-payment arising from ticket classifications (e.g., whether an item was marked as Warranty Defect or Billable Scope Expansion).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              6. Indemnification by User
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless Patchlane and its owners, agents, and licensors from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or legal fees arising out of or relating to: (a) your violation of this EULA; (b) content or screenshots uploaded to your workspaces; or (c) disputes between you and your clients or assigned contractors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              7. Governing Law, Class Action Waiver, and Binding Arbitration
            </h2>
            <p>
              This Agreement shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any dispute arising out of or relating to this Agreement shall be finally settled by binding individual arbitration.
            </p>
            <p className="font-semibold text-slate-800 uppercase">
              You and Patchlane waive any right to participate in a class-action lawsuit, class-wide arbitration, or private attorney general capacity against Patchlane anywhere in the world.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              8. Termination
            </h2>
            <p>
              This license remains effective until terminated. Your rights under this license terminate automatically without notice if you fail to comply with any of its terms. Upon termination, you must cease all use of the platform.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <p className="text-[11px] text-slate-400">
              For legal inquiries regarding this End User License Agreement, contact: <span className="font-mono text-indigo-600">legal@patchlane.app</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}