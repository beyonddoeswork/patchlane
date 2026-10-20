"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Upload, Laptop, Loader2, AlertCircle } from "lucide-react";

export default function ClientReportPage() {
  const routeParams = useParams();
  const projectId = (routeParams?.projectId as string) || "demo-project";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [formData, setFormData] = useState({
    url: "",
    summary: "",
    expected: "",
    actual: "",
    clientEmail: ""
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
        language: navigator.language
      });
    }
  }, []);

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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s safety timeout

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          ...formData,
          clientMeta,
          attachmentBase64: fileBase64
        }),
        signal: controller.signal
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
            className="mt-6 inline-block text-xs text-indigo-600 font-semibold hover:underline"
          >
            Submit another report
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 rounded-lg shadow-sm transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
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