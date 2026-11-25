"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  ShieldCheck,
  FileSignature,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

export default function ClientStatusBoardPage() {
  const params = useParams();
  const projectId = (params?.projectId || params?.projectSlug) as string;

  const [projectName, setProjectName] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBoardData = async () => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const projRes = await fetch(
        `/api/projects?verifySlug=${encodeURIComponent(projectId)}`,
        { cache: "no-store" }
      );
      const projData = await projRes.json();
      if (!projRes.ok) {
        throw new Error(projData.error || "Project workspace not found.");
      }
      setProjectName(projData.projectName || projectId);

      const repRes = await fetch(
        `/api/reports?projectId=${encodeURIComponent(projectId)}`,
        { cache: "no-store" }
      );
      const repData = await repRes.json();
      if (!repRes.ok) {
        throw new Error(repData.error || "Failed to load project status.");
      }
      setReports(repData.reports || []);
    } catch (err: any) {
      setError(err.message || "Unable to load status board.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [projectId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Fixed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Fixed</span>
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            <span>Open</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Loading live project status...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Status Board Unavailable</h2>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <Link
            href={`/report/${projectId}`}
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition inline-block"
          >
            Go to Report Portal
          </Link>
        </div>
      </main>
    );
  }

  const fixedCount = reports.filter((r) => r.status === "Fixed").length;
  const billableCount = reports.filter((r) => r.classification === "Scope Expansion").length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-3xl mx-auto">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-slate-900">
                Patchlane<span className="text-indigo-600">.</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                Live Status & Billing
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Workspace: <strong className="text-slate-800">{projectName}</strong> ({projectId})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBoardData}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              href={`/report/${projectId}`}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Log New Issue</span>
            </Link>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Logged
            </span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{reports.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Resolved
            </span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{fixedCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Billable Scope Items
            </span>
            <p className="text-xl font-black text-blue-700 mt-0.5">{billableCount}</p>
          </div>
        </div>

        {/* Ticket List */}
        <div className="space-y-3.5">
          {reports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No items reported yet</p>
              <p className="text-xs mt-1">
                Submitted issues and scope requests will appear here with real-time status and billing classification.
              </p>
            </div>
          ) : (
            reports.map((report) => {
              const isBillable = report.classification === "Scope Expansion";
              const approvalStatus = report.scopeApproval?.approvalStatus || "none";
              const estimate = report.scopeApproval?.estimate;
              const priceLabel = estimate
                ? `${estimate.currency === "INR" ? "₹" : "$"}${estimate.amount}`
                : "";

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Warranty vs Payable Badge */}
                        {isBillable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            <DollarSign className="w-3 h-3" />
                            <span>Payable Scope Expansion</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Warranty / Included (Free)</span>
                          </span>
                        )}

                        {report.url && (
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {report.url}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 pt-0.5">{report.summary}</h3>
                    </div>

                    {getStatusBadge(report.status || "Open")}
                  </div>

                  {/* Payable Scope Details & Sign-Off Action */}
                  {isBillable && (
                    <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-blue-950">
                          {estimate
                            ? `Quoted Fee: ${priceLabel}${estimate.hoursEstimate ? ` (${estimate.hoursEstimate} hrs)` : ""}`
                            : "Out-of-Warranty Work — Quote Pending"}
                        </p>
                        {estimate?.developerNotes && (
                          <p className="text-[11px] text-slate-600 italic">"{estimate.developerNotes}"</p>
                        )}
                      </div>

                      {approvalStatus === "approved" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-lg shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved & Signed</span>
                        </span>
                      ) : approvalStatus === "pending_review" ? (
                        <Link
                          href={`/report/${projectId}/approve/${report.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg transition shadow-2xs shrink-0"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Review & Sign Quote</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] font-semibold text-blue-700">
                          Awaiting Agency Quote
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>
                      Logged {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ""}
                    </span>
                    <span>{isBillable ? "Billable Out-of-Scope" : "Covered Under Warranty"}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}