"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowLeft,
  DollarSign
} from "lucide-react";

export default function ClientScopeSignOffPage() {
  const params = useParams();
  const projectSlug = (params?.projectId || params?.projectSlug) as string;
  const ticketId = params?.ticketId as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [auditToken, setAuditToken] = useState("");

  useEffect(() => {
    async function loadTicket() {
      if (!ticketId) return;
      try {
        const res = await fetch(`/api/reports?reportId=${encodeURIComponent(ticketId)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ticket not found");

        setReport(data.report);
        if (data.report.clientEmail) {
          setClientEmail(data.report.clientEmail);
        }
        if (data.report.scopeApproval?.approvalStatus === "approved") {
          setSignedSuccess(true);
          setAuditToken(data.report.scopeApproval?.signOff?.auditToken || "");
        }
      } catch (err: any) {
        setError(err.message || "Could not load scope authorization details.");
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [ticketId]);

  const handleSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !clientName || !clientEmail || !clientPhone) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports/sign-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          clientName,
          clientEmail,
          clientPhone,
          agreed,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign-off failed");

      setAuditToken(data.auditToken);
      setSignedSuccess(true);
    } catch (err: any) {
      alert(err.message || "Authorization error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-xs font-semibold text-slate-500 animate-pulse">Loading authorization portal...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Authorization Link Invalid</h2>
          <p className="text-xs text-slate-500 mb-4">{error || "Unable to locate this scope request."}</p>
          <Link href={`/report/${projectSlug || ""}/status`} className="text-xs font-semibold text-indigo-600 hover:underline">
            Return to Status Board →
          </Link>
        </div>
      </div>
    );
  }

  const estimate = report.scopeApproval?.estimate;
  const currencySymbol = estimate?.currency === "INR" ? "₹" : "$";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 sm:p-10 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="font-black text-2xl tracking-tight text-slate-900">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>
          <Link
            href={`/report/${projectSlug}/status`}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Project Status Board</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm"
        >
          {signedSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Scope Authorized & Signed</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you! Your formal digital signature has been logged and the engineering team has been notified to proceed with development.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Approved Deliverable:</span>
                  <span className="font-semibold text-slate-800">{report.summary}</span>
                </div>
                {estimate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Authorized Cost:</span>
                    <span className="font-bold text-emerald-700">{currencySymbol}{estimate.amount}</span>
                  </div>
                )}
                {auditToken && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Cryptographic Audit Hash</span>
                    <span className="font-mono text-[10px] break-all text-slate-600">{auditToken}</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Link
                  href={`/report/${projectSlug}/status`}
                  className="inline-block bg-slate-900 hover:bg-black text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition"
                >
                  Return to Live Status Board
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Out-of-Warranty Scope Expansion
                  </span>
                  <h1 className="text-lg font-bold text-slate-900 mt-1">Client Scope Authorization</h1>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3 mb-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Item</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{report.summary}</p>
                </div>

                {estimate && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Cost</span>
                      <p className="font-black text-slate-900 text-base flex items-center gap-0.5 mt-0.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>{currencySymbol}{estimate.amount}</span>
                      </p>
                    </div>
                    {estimate.hoursEstimate && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Timeframe</span>
                        <p className="font-bold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{estimate.hoursEstimate} hrs</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {estimate?.developerNotes && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Scope Breakdown & Notes</span>
                    <p className="text-slate-700 mt-1 leading-relaxed italic">"{estimate.developerNotes}"</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSignOff} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Signer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@company.com"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>

                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-700 leading-relaxed">
                      <strong>Digital Sign-Off Declaration:</strong> I confirm that this item falls outside baseline bug-warranty terms, and I formally authorize the quoted work and additional cost of{" "}
                      <strong>{currencySymbol}{estimate?.amount || 0}</strong>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !agreed}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? "Generating Legal Audit Record..." : "Approve & Sign Scope Expansion"}</span>
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}