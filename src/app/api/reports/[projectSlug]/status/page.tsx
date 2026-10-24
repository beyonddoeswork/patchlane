"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowLeft,
  Activity,
  Layers,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface PublicTicket {
  id: string;
  summary: string;
  status: "Open" | "In Progress" | "Fixed";
  url: string;
  createdAt: string;
  updatedAt: string;
  reportedBy: string;
}

const statusConfig = {
  Open: {
    label: "Under Review",
    stepIndex: 1,
    color: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  "In Progress": {
    label: "In Progress",
    stepIndex: 2,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500 animate-pulse",
  },
  Fixed: {
    label: "Resolved",
    stepIndex: 3,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export default function ClientProjectStatusPage() {
  const params = useParams();
  const projectSlug = params?.projectSlug as string;

  const [projectName, setProjectName] = useState("");
  const [tickets, setTickets] = useState<PublicTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = useCallback(async (isManual = false) => {
    if (!projectSlug) return;
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/reports/status?slug=${encodeURIComponent(projectSlug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load status board");

      setProjectName(data.projectName || projectSlug);
      setTickets(data.reports || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load project updates");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(true), 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Calculations for the global progress bar
  const totalTickets = tickets.length;
  const resolvedTickets = useMemo(() => tickets.filter((t) => t.status === "Fixed").length, [tickets]);
  const inProgressTickets = useMemo(() => tickets.filter((t) => t.status === "In Progress").length, [tickets]);
  const openTickets = useMemo(() => tickets.filter((t) => t.status === "Open").length, [tickets]);

  const completionPercentage = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, selectedStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading live status updates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Status Unavailable</h2>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <Link
            href={`/report/${projectSlug}`}
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition inline-block"
          >
            Submit Feedback Instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/report/${projectSlug}`}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Submit Ticket</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-slate-900">
                Patchlane<span className="text-indigo-600">.</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                Live Status Board
              </span>
            </div>
          </div>

          <button
            onClick={() => fetchStatus(true)}
            disabled={isRefreshing}
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto p-6 sm:p-8 flex-1 space-y-6">
        {/* Title & Overall Progress Bar Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{projectName}</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time milestone resolution & acceptance tracker
              </p>
            </div>

            <Link
              href={`/report/${projectSlug}`}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-xs"
            >
              <span>+ Report New Issue</span>
            </Link>
          </div>

          {/* THE GLOBAL PROGRESS BAR */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Overall Project Resolution</span>
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {resolvedTickets} of {totalTickets} Resolved ({completionPercentage}%)
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0}%` }}
                className="bg-emerald-500 h-full transition-all duration-500 ease-out"
                title={`Resolved: ${resolvedTickets}`}
              />
              <div
                style={{ width: `${totalTickets > 0 ? (inProgressTickets / totalTickets) * 100 : 0}%` }}
                className="bg-amber-400 h-full transition-all duration-500 ease-out"
                title={`In Progress: ${inProgressTickets}`}
              />
              <div
                style={{ width: `${totalTickets > 0 ? (openTickets / totalTickets) * 100 : 0}%` }}
                className="bg-rose-400 h-full transition-all duration-500 ease-out"
                title={`Under Review: ${openTickets}`}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Resolved ({resolvedTickets})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                In Progress ({inProgressTickets})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Under Review ({openTickets})
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedStatus === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-70">
              Total Logged
            </span>
            <span className="text-lg font-black mt-0.5 block">{totalTickets}</span>
          </button>

          <button
            onClick={() => setSelectedStatus("Open")}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedStatus === "Open"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-70">
              Under Review
            </span>
            <span className="text-lg font-black mt-0.5 block">{openTickets}</span>
          </button>

          <button
            onClick={() => setSelectedStatus("In Progress")}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedStatus === "In Progress"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-70">
              In Progress
            </span>
            <span className="text-lg font-black mt-0.5 block">{inProgressTickets}</span>
          </button>

          <button
            onClick={() => setSelectedStatus("Fixed")}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedStatus === "Fixed"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-70">
              Resolved
            </span>
            <span className="text-lg font-black mt-0.5 block">{resolvedTickets}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tickets by keyword or affected page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-indigo-600 transition shadow-2xs"
          />
        </div>

        {/* Tickets Stream with Individual 3-Step Progress Indicators */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTickets.map((ticket) => {
              const cfg = statusConfig[ticket.status] || statusConfig.Open;
              const currentStep = cfg.stepIndex;

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                      {ticket.summary}
                    </span>

                    <div className="text-[11px] text-slate-400 shrink-0 flex items-center gap-2">
                      <span>Logged by {ticket.reportedBy}</span>
                      <span>•</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {ticket.url && (
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded w-fit max-w-full truncate">
                      {ticket.url}
                    </div>
                  )}

                  {/* 3-Step Timeline Bar for this Ticket */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between relative">
                      {/* Connecting Line */}
                      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-100 z-0" />
                      <div
                        className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-indigo-500 z-0 transition-all duration-300"
                        style={{
                          width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                        }}
                      />

                      {/* Step 1: Under Review */}
                      <div className="relative z-10 flex flex-col items-center bg-white px-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            currentStep >= 1
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 mt-1">Under Review</span>
                      </div>

                      {/* Step 2: In Progress */}
                      <div className="relative z-10 flex flex-col items-center bg-white px-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            currentStep >= 2
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {currentStep >= 2 ? "•" : "2"}
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 mt-1">In Progress</span>
                      </div>

                      {/* Step 3: Resolved */}
                      <div className="relative z-10 flex flex-col items-center bg-white px-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            currentStep === 3
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {currentStep === 3 ? "✓" : "3"}
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 mt-1">Resolved</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredTickets.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No matching items found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {searchQuery || selectedStatus !== "all"
                  ? "Try clearing your filters to view all project items."
                  : "No feedback items logged for this workspace yet."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted read-only client changelog powered by Patchlane.</span>
          </div>
          <div>All ticket progress syncs automatically with the agency team.</div>
        </div>
      </main>
    </div>
  );
}