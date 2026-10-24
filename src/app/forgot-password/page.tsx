"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowLeft, KeyRound, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      // Directs the user back to the login page of the current active origin
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      if (err.code === "auth/user-not-found") {
        setErrorMessage("No account exists with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else {
        setErrorMessage(err.message || "Unable to send password reset email. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-black text-3xl tracking-tight text-slate-900 inline-block mb-3">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Account Recovery</h2>
          <p className="text-xs text-slate-500 mt-1">Recover your agency or developer workspace access</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm"
        >
          {status === "success" ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We've sent password reset instructions to <strong className="text-slate-800">{email}</strong>. 
                  Check your inbox and follow the link to establish your new password.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/login"
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-lg transition shadow-xs text-center"
                >
                  Return to Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setEmail("");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 transition block w-full py-1.5"
                >
                  Send to a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Forgot your password?</h3>
                  <p className="text-[11px] text-slate-500">Enter your registered email to receive a secure recovery link.</p>
                </div>
              </div>

              {status === "error" && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="developer@agency.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition shadow-xs cursor-pointer"
              >
                {status === "loading" ? "Sending Reset Link..." : "Send Reset Link"}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Remember your password? Sign in</span>
                </Link>
              </div>
            </form>
          )}
        </motion.div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Patchlane Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}