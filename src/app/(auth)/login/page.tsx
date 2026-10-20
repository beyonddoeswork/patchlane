"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Briefcase, 
  Lock, 
  Mail, 
  Zap, 
  Layers
} from "lucide-react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingAction(true);

    try {
      if (isRegister) {
        // 1. Firebase Auth Registration
        await signup(email, password);

        // 2. Save Contact Info & Free Access to MongoDB
        await fetch("/api/agency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            agencyName,
            phone,
            plan: "free",
          }),
        });
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar with Clickable Logo */}
      <div className="max-w-4xl w-full mx-auto py-2">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 group transition"
          title="Return to Home"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs group-hover:bg-indigo-700 transition">
            F
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            Patchlane<span className="text-indigo-600">.</span>
          </span>
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center my-6">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-5"
        >
          {/* Left Side: Agency Overview */}
          <div className="md:col-span-2 bg-slate-50/70 p-8 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col justify-between">
            <div>
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 mb-6 hover:bg-indigo-100 transition"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Patchlane for Agencies</span>
              </Link>

              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
                Client reports your developers will actually read.
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Skip unstructured messages and endless back-and-forth. Give your clients a clean, branded link that captures device context automatically.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Distinguish warranty defects from paid changes</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Zero login friction for non-technical clients</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Auto-captured screen size, OS & browser specs</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Multi-project workspace included</span>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:col-span-3 p-8 bg-white flex flex-col justify-center">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {isRegister ? "Create Agency Account" : "Agency Portal"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRegister 
                    ? "Set up your workspace and invite your first client" 
                    : "Access your active client project tickets"}
                </p>
              </div>
              <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
                Free Access
              </span>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleAuth} className="space-y-3.5">
              {/* Work Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="email"
                    required 
                    placeholder="developer@agency.com"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Extra Registration Inputs */}
              <AnimatePresence>
                {isRegister && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-1"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Agency / Studio Name
                        </label>
                        <div className="relative">
                          <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input 
                            type="text"
                            required={isRegister}
                            placeholder="PixelCraft Studios"
                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                            value={agencyName}
                            onChange={(e) => setAgencyName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          WhatsApp / Contact
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input 
                            type="tel"
                            required={isRegister}
                            placeholder="+91 98765 43210"
                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={loadingAction}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loadingAction ? (
                  "Processing..."
                ) : isRegister ? (
                  <>Create Free Account <ArrowRight className="w-4 h-4" /></>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                {isRegister ? "Already running Patchlane for your agency?" : "New agency or freelance team?"}{" "}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-4 ml-1 cursor-pointer transition"
                >
                  {isRegister ? "Sign In" : "Register Agency"}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-2">
        Patchlane &copy; Built for small web design & development agencies.
      </footer>
    </div>
  );
}