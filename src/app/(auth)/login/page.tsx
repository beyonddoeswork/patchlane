"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowLeft, KeyRound, Mail, Lock, CheckCircle2, AlertCircle, Building2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");

  // Sign In / Register Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resetErrorMsg, setResetErrorMsg] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "signin") {
        await login(email.trim(), password);
        router.push("/dashboard");
      } else {
        // 1. Create Firebase Auth account
        await createUserWithEmailAndPassword(auth, email.trim(), password);

        // 2. Register agency & user details in MongoDB
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            agencyName: agencyName.trim() || `${fullName}'s Studio`,
            displayName: fullName.trim() || email.split("@")[0],
          }),
        });

        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. You can reset your password below if needed.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please switch to Sign In.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed.");
      }
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
      // Calling sendPasswordResetEmail without restrictive actionCodeSettings
      // prevents the 'auth/unauthorized-continue-uri' error.
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus("success");
    } catch (err: any) {
      setResetStatus("error");
      if (err.code === "auth/user-not-found") {
        setResetErrorMsg("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setResetErrorMsg("Please enter a valid email address.");
      } else {
        setResetErrorMsg(err.message || "Failed to dispatch reset email.");
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
          <h2 className="text-xl font-bold text-slate-900">
            {activeTab === "signin" ? "Sign in to Agency Console" : "Register Your Web Agency"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === "signin"
              ? "Access your client bug workspaces and developer assignments"
              : "Set up your studio and start accepting frictionless client bug tickets"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setError("");
              }}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition cursor-pointer ${
                activeTab === "signin"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setError("");
              }}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Register Agency
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {activeTab === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agency / Studio Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pixelcraft Digital"
                      className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@agency.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {activeTab === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetStatus("idle");
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition shadow-xs cursor-pointer mt-2"
            >
              {loading
                ? activeTab === "signin"
                  ? "Signing in..."
                  : "Creating agency account..."
                : activeTab === "signin"
                ? "Sign In"
                : "Create Agency Account"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            {activeTab === "signin" ? (
              <p className="text-xs text-slate-400">
                New agency?{" "}
                <button
                  onClick={() => {
                    setActiveTab("register");
                    setError("");
                  }}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already registered?{" "}
                <button
                  onClick={() => {
                    setActiveTab("signin");
                    setError("");
                  }}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Patchlane Home</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
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
                    A password reset link has been dispatched to <strong>{resetEmail}</strong>. Check your inbox and spam folder.
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
                  Enter your account email and we'll send you a password reset link.
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