"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowLeft, KeyRound, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password In-Page Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resetErrorMsg, setResetErrorMsg] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.code === "auth/invalid-credential"
          ? "Invalid email or password. You can reset your password below if needed."
          : err.message || "Failed to log in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelfPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetStatus("loading");
    setResetErrorMsg("");

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim(), {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      setResetStatus("success");
    } catch (err: any) {
      setResetStatus("error");
      setResetErrorMsg(
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.message || "Failed to dispatch reset email."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-black text-3xl tracking-tight text-slate-900 inline-block mb-3">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Sign in to Agency Console</h2>
          <p className="text-xs text-slate-500 mt-1">Access your client bug workspaces and developer assignments</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetStatus("idle");
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition cursor-pointer"
                  >
                    Quick Reset
                  </button>
                  <span className="text-slate-300 text-xs">|</span>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition shadow-xs cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Assigned by an agency? Use the credentials emailed to you or{" "}
              <Link href="/forgot-password" className="text-indigo-600 hover:underline">
                reset your password
              </Link>.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Patchlane Home</span>
          </Link>
        </div>
      </div>

      {/* Quick Modal Fallback for in-page resets */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
            </div>

            {resetStatus === "success" ? (
              <div className="space-y-3 py-2">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    A password reset link has been dispatched to <strong>{resetEmail}</strong>. Follow the instructions in the email.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 rounded-lg transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSelfPasswordReset} className="space-y-3.5 mt-3">
                <p className="text-xs text-slate-500">
                  Enter your account email and we'll dispatch a secure recovery link.
                </p>

                {resetStatus === "error" && (
                  <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                    {resetErrorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@agency.com"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetStatus === "loading"}
                    className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {resetStatus === "loading" ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}