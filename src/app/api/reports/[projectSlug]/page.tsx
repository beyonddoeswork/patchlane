"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Upload,
  X,
  Activity,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";

export default function ClientReportPortal() {
  const params = useParams();
  const projectSlug = (params?.projectSlug || params?.slug || params?.id) as string;

  // Workspace & Gatekeeper State
  const [projectName, setProjectName] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState("");

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Report Form State
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // Screenshot Upload / Drag-and-Drop State
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function checkWorkspace() {
      if (!projectSlug) return;
      try {
        const res = await fetch(
          `/api/projects?verifySlug=${encodeURIComponent(projectSlug)}`,
          { cache: "no-store" }
        );
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
            `/api/projects?verifySlug=${encodeURIComponent(projectSlug)}&code=${encodeURIComponent(savedCode)}`,
            { cache: "no-store" }
          );
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.valid) {
            setVerifiedCode(savedCode);
            setIsUnlocked(true);
          } else {
            sessionStorage.removeItem(`patchlane_code_${projectSlug}`);
            setIsUnlocked(false);
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
        `/api/projects?verifySlug=${encodeURIComponent(projectSlug)}&code=${encodeURIComponent(cleanCode)}`,
        { cache: "no-store" }
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

  const handleLockPortal = () => {
    if (projectSlug) {
      sessionStorage.removeItem(`patchlane_code_${projectSlug}`);
    }
    setIsUnlocked(false);
    setVerifiedCode("");
    setAccessCodeInput("");
    setCodeError("");
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert("Image must be under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachmentUrl(reader.result);
        setPreviewName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
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
          attachmentUrl: attachmentUrl || null,
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

  // 1. GATEKEEPER SCREEN (Requires 6-Character Access Code)
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

  // 2. SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Report Sent</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your report has been logged for <strong>{projectName}</strong> along with your environment diagnostics.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => {
                setSummary("");
                setUrl("");
                setExpected("");
                setActual("");
                setAttachmentUrl("");
                setPreviewName("");
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

  // 3. UNLOCKED REPORT AN ISSUE FORM
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-xl">
        {/* Top Utility Bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <Link href="/" className="font-black text-lg tracking-tight text-slate-900">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLockPortal}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Lock portal and re-enter access code"
            >
              <Lock className="w-3 h-3" />
              <span>Lock</span>
            </button>
            <Link
              href={`/report/${projectSlug}/status`}
              className="text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
            >
              <Activity className="w-3 h-3 text-indigo-600" />
              <span>Status Board</span>
            </Link>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Card Header */}
          <div className="flex items-start justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Report an Issue</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Project ID: <span className="font-mono text-slate-700">{projectSlug}</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-full shrink-0">
              <Monitor className="w-3.5 h-3.5 text-slate-500" />
              <span>Diagnostics Auto-Captured</span>
            </span>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Where did it happen? (Page URL)
              </label>
              <input
                type="text"
                placeholder="e.g. /checkout or https://yoursite.com/pricing"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-600 bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Summary *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 'Pay Now' button does nothing on iPhone Safari"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-600 bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  What did you expect?
                </label>
                <textarea
                  rows={3}
                  placeholder="The confirmation page should load"
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-600 bg-white transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  What actually happened?
                </label>
                <textarea
                  rows={3}
                  placeholder="Screen remained blank with spinning icon"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-600 bg-white transition"
                />
              </div>
            </div>

            {/* Drag-and-Drop Screenshot Uploader */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Screenshot / Proof (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processFile(file);
                }}
              />

              {!attachmentUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/60"
                  }`}
                >
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500 font-medium">Click or drag screenshot here</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{previewName || "Screenshot attached"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentUrl("");
                      setPreviewName("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Email (For Updates)
              </label>
              <input
                type="email"
                placeholder="client@company.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-600 bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs py-3.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Sending Report..." : "Send Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}