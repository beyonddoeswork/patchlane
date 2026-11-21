"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Activity, 
  ArrowRight 
} from "lucide-react";

export default function ClientReportPortal() {
  const params = useParams();
  const projectSlug = params?.projectSlug as string;

  const [projectName, setProjectName] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState("");

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function checkWorkspace() {
      if (!projectSlug) return;
      try {
        const res = await fetch(`/api/projects?verifySlug=${encodeURIComponent(projectSlug)}`);
        const data = await res.json();
        if (!res.ok) {
          setNotFoundError(data.error || "Project workspace not found.");
          setPageLoading(false);
          return;
        }

        setProjectName(data.projectName || projectSlug);

        const savedCode = sessionStorage.getItem(`patchlane_code_${projectSlug}`);
        if (savedCode) {
          const verifyRes = await fetch(
            `/api/projects?verifySlug=${encodeURIComponent(projectSlug)}&code=${encodeURIComponent(savedCode)}`
          );
          if (verifyRes.ok) {
            setVerifiedCode(savedCode);
            setIsUnlocked(true);
          } else {
            sessionStorage.removeItem(`patchlane_code_${projectSlug}`);
          }
        }
      } catch {
        setNotFoundError("Unable to connect to workspace.");
      } finally {
        setPageLoading(false);
      }
    }
    checkWorkspace();
  }, [projectSlug]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) return;

    setIsVerifying(true);
    setCodeError("");
    try {
      const cleanCode = accessCodeInput.trim().toUpperCase();
      const res = await fetch(
        `/api/projects?verifySlug=${encodeURIComponent(projectSlug)}&code=${encodeURIComponent(cleanCode)}`
      );
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCodeError(data.error || "Incorrect access code. Please check with your project lead.");
        return;
      }

      sessionStorage.setItem(`patchlane_code_${projectSlug}`, cleanCode);
      setVerifiedCode(cleanCode);
      setIsUnlocked(true);
    } catch {
      setCodeError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setIsSubmitting(true);
    try {
      const clientMeta = {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectSlug,
          accessCode: verifiedCode,
          summary,
          url,
          expected,
          actual,
          clientEmail,
          attachmentUrl,
          clientMeta,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");

      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-xs font-semibold text-slate-500 animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  if (notFoundError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Workspace Not Found</h2>
          <p className="text-xs text-slate-500">{notFoundError}</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-indigo-600 selection:text-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm"
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-100">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Protected Client Portal
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-2 tracking-tight">{projectName}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter the 6-character workspace access code provided by your agency to log feedback.
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Workspace Access Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. K9X4M2"
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                  className="w-full text-center font-mono text-lg font-bold tracking-[0.25em] uppercase border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                />
              </div>
              {codeError && (
                <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{codeError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || accessCodeInput.trim().length < 4}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isVerifying ? "Verifying Code..." : "Unlock Portal"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href={`/report/${projectSlug}/status`}
              className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>View Public Status Board</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Report Logged</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your feedback has been sent directly to the <strong>{projectName}</strong> engineering team.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => {
                setSummary("");
                setUrl("");
                setExpected("");
                setActual("");
                setAttachmentUrl("");
                setSubmitted(false);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
            >
              Submit Another Issue
            </button>
            <Link
              href={`/report/${projectSlug}/status`}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 rounded-xl transition text-center"
            >
              Track Progress
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 sm:p-10 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-black text-2xl tracking-tight text-slate-900">
              Patchlane<span className="text-indigo-600">.</span>
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Client Acceptance Portal • <strong className="text-slate-800">{projectName}</strong>
            </p>
          </div>
          <Link
            href={`/report/${projectSlug}/status`}
            className="text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Status Board</span>
          </Link>
        </div>

        <form onSubmit={handleSubmitReport} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issue or Request Summary *</label>
            <input
              type="text"
              required
              placeholder="e.g. Checkout button unresponsive on mobile Safari"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Affected Page / URL</label>
              <input
                type="text"
                placeholder="e.g. /checkout or https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email (for updates)</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Behaviour</label>
              <textarea
                rows={3}
                placeholder="What should happen?"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Behaviour</label>
              <textarea
                rows={3}
                placeholder="What happened instead?"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Screenshot / Loom Link <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Submitting Report..." : "Submit Report to Team"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}