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
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Activity,
  Layers,
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
    color: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: AlertCircle,
  },
  "In Progress": {
    label: "In Progress",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500 animate-pulse",
    icon: Clock,
  },
  Fixed: {
    label: "Resolved",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
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

  const fetchStatus = useCallback(async (isManualRefresh = false) => {
    if (!projectSlug) return;
    if (isManualRefresh) setIsRefreshing(true);
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
    // Auto-refresh every 15 seconds so clients see real-time updates
    const interval = setInterval(() => fetchStatus(true), 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: tickets.length,
      Open: tickets.filter((t) => t.status === "Open").length,
      "In Progress": tickets.filter((t) => t.status === "In Progress").length,
      Fixed: tickets.filter((t) => t.status === "Fixed").length,
    };
  }, [tickets]);

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
        {/* Title Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{projectName}</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Public issue progress tracker & acceptance changelog
            </p>
          </div>

          <Link
            href={`/report/${projectSlug}`}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            <span>+ Report Another Issue</span>
          </Link>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedStatus === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70">
              Total Logged
            </span>
            <span className="text-xl font-black mt-0.5 block">{counts.all}</span>
          </button>

          <button
            onClick={() => setSelectedStatus("Open")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedStatus === "Open"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70">
              Under Review
            </span>
            <span className="text-xl font-black mt-0.5 block">{counts.Open}</span>
          </button>

          <button
            onClick={() => setSelectedStatus("In Progress")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedStatus === "In Progress"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70">
              In Progress
            </span>
            <span className="text-xl font-black mt-0.5 block">{counts["In Progress"]}</span>
          </button>

          <button
            onClick={() => setSelectedStatus("Fixed")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedStatus === "Fixed"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70">
              Resolved
            </span>
            <span className="text-xl font-black mt-0.5 block">{counts.Fixed}</span>
          </button>
        </div>

        {/* Search Bar */}
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

        {/* Tickets Stream */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTickets.map((ticket) => {
              const cfg = statusConfig[ticket.status] || statusConfig.Open;
              const StatusIcon = cfg.icon;

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${cfg.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span>{cfg.label}</span>
                      </span>

                      {ticket.url && (
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded truncate max-w-xs">
                          {ticket.url}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
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

                  <div className="pt-3">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {ticket.summary}
                    </p>
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
                  ? "Try clearing filters to view all project items."
                  : "No feedback items logged for this workspace yet."}
              </p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted read-only client changelog powered by Patchlane.</span>
          </div>
          <div>All ticket progress syncs in real time with the engineering team.</div>
        </div>
      </main>
    </div>
  );
}