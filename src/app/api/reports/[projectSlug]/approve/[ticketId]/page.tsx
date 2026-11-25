"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft 
} from "lucide-react";

export default function ScopeSignOffPage() {
  const params = useParams();
  const projectSlug = (params?.projectId || params?.projectSlug) as string;
  const ticketId = params?.ticketId as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedRecord, setSignedRecord] = useState<any>(null);

  useEffect(() => {
    async function loadTicket() {
      if (!ticketId) return;
      try {
        const res = await fetch(`/api/reports?reportId=${encodeURIComponent(ticketId)}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load ticket quotation");

        setTicket(data.report);
        if (data.report?.clientEmail) {
          setEmail(data.report.clientEmail);
        }
        if (data.report?.scopeApproval?.signOff) {
          setSignedRecord(data.report.scopeApproval.signOff);
        }
      } catch (err: any) {
        setError(err.message || "Could not retrieve scope details");
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [ticketId]);

  const handleSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports/sign-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          projectSlug,
          fullName,
          email,
          phone,
          declaration: "I confirm that I am an authorized client stakeholder and approve the scope quote above.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit digital authorization");

      setSignedRecord(data.record);
    } catch (err: any) {
      alert(err.message || "Failed to submit authorization");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <p className="text-xs font-semibold text-slate-500 animate-pulse">Loading scope authorization details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Quote Unavailable</h2>
          <p className="text-xs text-slate-500 mb-4">{error || "Ticket not found or closed"}</p>
          <Link
            href={`/report/${projectSlug}/status`}
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition inline-block"
          >
            Go to Project Status Board
          </Link>
        </div>
      </div>
    );
  }

  const estimate = ticket.scopeApproval?.estimate || {};
  const formattedPrice = estimate.currency === "INR" ? `₹${estimate.amount}` : `$${estimate.amount}`;

  if (signedRecord) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 selection:bg-indigo-600 selection:text-white">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg w-full shadow-sm text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Scope Expansion Authorized</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Your digital authorization has been cryptographically recorded. The engineering team has been notified to proceed.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 text-left text-xs space-y-2 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized Signer</span>
              <span className="font-semibold text-slate-900">{signedRecord.clientName} ({signedRecord.clientEmail})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Contact</span>
              <span className="font-mono text-slate-800">{signedRecord.clientPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Timestamp & Verification Hash</span>
              <span className="font-mono text-slate-800">{new Date(signedRecord.signedAt).toISOString()}</span>
              <span className="font-mono text-[9px] break-all block bg-white border border-slate-200 p-1.5 rounded mt-1 text-indigo-700">
                {signedRecord.auditToken}
              </span>
            </div>
          </div>

          <Link
            href={`/report/${projectSlug}/status`}
            className="inline-block w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-lg transition shadow-xs text-center"
          >
            View Live Project Status Board
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="font-black text-2xl tracking-tight text-slate-900 inline-block mb-2">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>
          <h2 className="text-lg font-bold text-slate-900">Scope Authorization Agreement</h2>
          <p className="text-xs text-slate-500 mt-1">Review quotation & submit digital authorization</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Feedback Ticket</span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">"{ticket.summary}"</p>
              {ticket.url && (
                <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded inline-block mt-1">
                  {ticket.url}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Authorized Quote</span>
                <div className="text-xl font-black text-indigo-600">{formattedPrice}</div>
              </div>
              {estimate.hoursEstimate && (
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Allocated Time</span>
                  <div className="text-sm font-bold text-slate-900">{estimate.hoursEstimate} hrs</div>
                </div>
              )}
            </div>

            {estimate.developerNotes && (
              <div className="border-t border-slate-200/80 pt-2 text-xs">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Scope Notes</span>
                <p className="text-slate-600 leading-relaxed italic text-[11px]">{estimate.developerNotes}</p>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 text-[11px] leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              This item represents an out-of-warranty scope expansion. By signing below, you authorize the dev team to proceed with work at the price stated above.
            </span>
          </div>

          <form onSubmit={handleSignOff} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  required
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 leading-relaxed select-none">
                  <strong>I agree and authorize:</strong> I declare that I am authorized to approve expenditures for this project, and I confirm the requested work should be executed at the agreed quote.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!hasAgreed || isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Generating Tamper-Evident Signature..." : "Digitally Sign & Authorize Scope"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href={`/report/${projectSlug}/status`} className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Status Board</span>
          </Link>
        </div>
      </div>
    </div>
  );
}