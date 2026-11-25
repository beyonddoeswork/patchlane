"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Upload,
  Laptop,
  Loader2,
  AlertCircle,
  KeyRound,
  Lock,
  ArrowRight,
  Activity,
} from "lucide-react";

export default function ClientReportPage() {
  const routeParams = useParams();
  const projectId = (routeParams?.projectId as string) || "demo-project";

  // Workspace & Gatekeeper State
  const [projectName, setProjectName] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState("");

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Original Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    url: "",
    summary: "",
    expected: "",
    actual: "",
    clientEmail: "",
  });

  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [clientMeta, setClientMeta] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientMeta({
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
      });
    }
  }, []);

  // Verify Project & Check Cached Access Code
  useEffect(() => {
    async function checkWorkspace() {
      if (!projectId) return;
      try {
        const res = await fetch(
          `/api/projects?verifySlug=${encodeURIComponent(projectId)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok) {
          setNotFoundError(data.error || "Project workspace not found.");
          setPageLoading(false);
          return;
        }

        setProjectName(data.projectName || projectId);

        const savedCode = sessionStorage.getItem(`patchlane_code_${projectId}`);
        if (savedCode) {
          const verifyRes = await fetch(
            `/api/projects?verifySlug=${encodeURIComponent(projectId)}&code=${encodeURIComponent(savedCode)}`,
            { cache: "no-store" }
          );
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.valid) {
            setVerifiedCode(savedCode);
            setIsUnlocked(true);
          } else {
            sessionStorage.removeItem(`patchlane_code_${projectId}`);
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
  }, [projectId]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) return;

    setIsVerifying(true);
    setCodeError("");
    try {
      const cleanCode = accessCodeInput.trim().toUpperCase();
      const res = await fetch(
        `/api/projects?verifySlug=${encodeURIComponent(projectId)}&code=${encodeURIComponent(cleanCode)}`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCodeError(data.error || "Incorrect access code. Please check with your project lead.");
        return;
      }

      sessionStorage.setItem(`patchlane_code_${projectId}`, cleanCode);
      setVerifiedCode(cleanCode);
      setIsUnlocked(true);
    } catch {
      setCodeError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLockPortal = () => {
    if (projectId) {
      sessionStorage.removeItem(`patchlane_code_${projectId}`);
    }
    setIsUnlocked(false);
    setVerifiedCode("");
    setAccessCodeInput("");
    setCodeError("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("File size exceeds 3MB limit. Please attach a smaller image.");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          accessCode: verifiedCode,
          ...formData,
          clientMeta,
          attachmentBase64: fileBase64,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server returned error (${res.status})`);
      }

      setIsDone(true);
    } catch (err: any) {
      console.error("Submission failed:", err);
      if (err.name === "AbortError") {
        setErrorMessage("Request timed out. Please check your MongoDB connection.");
      } else {
        setErrorMessage(err.message || "Failed to submit report. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-xs font-semibold text-slate-500 animate-pulse">Loading workspace...</p>
      </main>
    );
  }

  if (notFoundError) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Workspace Not Found</h2>
          <p className="text-xs text-slate-500">{notFoundError}</p>
        </div>
      </main>
    );
  }

  // 1. GATEKEEPER SCREEN (Requires 6-Character Access Code)
  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-indigo-600 selection:text-white">
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
              href={`/report/${projectId}/status`}
              className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>View Public Status Board</span>
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // 2. SUCCESS SCREEN
  if (isDone) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm"
        >
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900">Feedback Received</h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            The engineering team has received your ticket along with browser and screen specs.
          </p>
          <button
            onClick={() => {
              setIsDone(false);
              setFormData({ url: "", summary: "", expected: "", actual: "", clientEmail: "" });
              setFileBase64(null);
              setFileName("");
            }}
            className="mt-6 inline-block text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Submit another report
          </button>
        </motion.div>
      </main>
    );
  }

  // 3. UNLOCKED REPORT FORM
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full flex items-center justify-between mb-3 px-1">
        <span className="font-black text-lg tracking-tight text-slate-900">
          Patchlane<span className="text-indigo-600">.</span>
        </span>
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
            href={`/report/${projectId}/status`}
            className="text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
          >
            <Activity className="w-3 h-3 text-indigo-600" />
            <span>Status Board</span>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Report an Issue</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Project ID: <span className="font-mono text-slate-700 font-medium">{projectId}</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <Laptop className="w-3.5 h-3.5" />
            <span>Diagnostics Auto-Captured</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Where did it happen? (Page URL)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. /checkout or https://yoursite.com/pricing"
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Issue Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 'Pay Now' button does nothing on iPhone Safari"
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                What did you expect?
              </label>
              <textarea
                rows={4}
                placeholder="The confirmation page should load"
                className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition resize-none custom-scrollbar"
                value={formData.expected}
                onChange={(e) => setFormData({ ...formData, expected: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                What actually happened?
              </label>
              <textarea
                rows={4}
                placeholder="Screen remained blank with spinning icon"
                className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition resize-none custom-scrollbar"
                value={formData.actual}
                onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Screenshot / Proof (Optional)
            </label>
            <div className="border border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-600 truncate px-2">
                {fileName ? fileName : "Click or drag screenshot here"}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Your Email (for updates)
            </label>
            <input
              type="email"
              placeholder="client@company.com"
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 rounded-lg shadow-sm transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Report...</span>
              </>
            ) : (
              "Send Report"
            )}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}