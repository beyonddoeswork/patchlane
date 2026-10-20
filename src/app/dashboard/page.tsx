"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, 
  ExternalLink, 
  Smartphone, 
  Globe, 
  Layers, 
  RefreshCw, 
  Plus, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  Users, 
  UserPlus,
  ShieldCheck,
  UserX
} from "lucide-react";

interface ProjectMember {
  email: string;
  role: string;
}

interface Project {
  _id?: string;
  name: string;
  slug: string;
  ownerEmail?: string;
  currentUserRole?: "owner" | "agency_admin" | "developer";
  assignedDevelopers?: ProjectMember[];
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-rose-50 text-rose-700 border-rose-300 focus:ring-rose-200";
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-300 focus:ring-amber-200";
    case "Fixed":
      return "bg-emerald-50 text-emerald-700 border-emerald-300 focus:ring-emerald-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-300 focus:ring-slate-200";
  }
};

const getClassificationStyles = (type: string) => {
  if (type === "Scope Expansion") {
    return "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100";
  }
  return "bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100";
};

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // Form Fields
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [inviteDevEmail, setInviteDevEmail] = useState("");
  const [inviteDevRole, setInviteDevRole] = useState("developer");

  // Removal state
  const [memberToRemove, setMemberToRemove] = useState<string>("");
  const [removalReason, setRemovalReason] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Super Admin Check
  const superAdminList = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  const isSuperAdmin = user?.email && superAdminList.includes(user.email.toLowerCase());

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const loadProjects = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/projects?ownerEmail=${encodeURIComponent(user.email)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        setActiveProject((prev) => {
          if (!prev) return data.projects[0];
          const refreshed = data.projects.find((p: Project) => p.slug === prev.slug);
          return refreshed || data.projects[0];
        });
      } else {
        setProjects([]);
        setActiveProject(null);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    }
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const fetchReports = useCallback(async () => {
    if (!activeProject?.slug) {
      setReports([]);
      return;
    }
    setIsFetching(true);
    try {
      const res = await fetch(`/api/reports?projectId=${encodeURIComponent(activeProject.slug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (e) {
      console.error("Failed to fetch reports", e);
    } finally {
      setIsFetching(false);
    }
  }, [activeProject]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !newProjectName) return;

    setIsCreating(true);
    const generatedSlug = (newProjectSlug || newProjectName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          slug: generatedSlug,
          ownerEmail: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowCreateModal(false);
      setNewProjectName("");
      setNewProjectSlug("");
      await loadProjects();
      setActiveProject(data.project);
    } catch (err: any) {
      alert(err.message || "Could not create project");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !inviteDevEmail) return;

    setIsInviting(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_member",
          projectSlug: activeProject.slug,
          developerEmail: inviteDevEmail,
          role: inviteDevRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowInviteModal(false);
      const invitedEmail = inviteDevEmail;
      setInviteDevEmail("");
      await loadProjects();

      if (data.userProvisioned && data.temporaryPassword) {
        alert(
          `Success: Invitation sent to ${invitedEmail}!\n\nA temporary password was generated:\n${data.temporaryPassword}\n\nLogin credentials have been emailed to the developer.`
        );
      } else {
        alert(`Success: ${invitedEmail} has been added to ${activeProject.name}!`);
      }
    } catch (err: any) {
      alert(err.message || "Could not assign developer");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !memberToRemove) return;

    setIsRemoving(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_member",
          projectSlug: activeProject.slug,
          developerEmail: memberToRemove,
          reason: removalReason,
        }),
      });

      if (!res.ok) throw new Error("Failed to remove developer");

      setShowRemoveModal(false);
      setRemovalReason("");
      setMemberToRemove("");
      await loadProjects();
      alert(`Developer removed. A notification email with the specified reason has been sent.`);
    } catch (err: any) {
      alert(err.message || "Could not remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject || !user?.email) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${activeProject.name}"? All associated tickets will be deleted permanently.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `/api/projects?slug=${encodeURIComponent(activeProject.slug)}&ownerEmail=${encodeURIComponent(user.email)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete project");

      const remaining = projects.filter((p) => p.slug !== activeProject.slug);
      setProjects(remaining);
      setActiveProject(remaining.length > 0 ? remaining[0] : null);
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    }
  };

  const copyClientLink = () => {
    if (!activeProject) return;
    const link = `${window.location.origin}/report/${activeProject.slug}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadReportSummary = () => {
    if (!activeProject || reports.length === 0) {
      alert("No reports available to download.");
      return;
    }

    let markdown = `# Acceptance & Feedback Report: ${activeProject.name}\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n`;
    markdown += `Total Items Logged: ${reports.length}\n\n---\n\n`;

    reports.forEach((r, idx) => {
      markdown += `### ${idx + 1}. [${r.classification.toUpperCase()}] - ${r.summary}\n`;
      markdown += `- **Status**: ${r.status}\n`;
      markdown += `- **URL / Location**: ${r.url || "N/A"}\n`;
      markdown += `- **Expected**: ${r.expected || "N/A"}\n`;
      markdown += `- **Actual**: ${r.actual || "N/A"}\n`;
      markdown += `- **Submitted By**: ${r.clientEmail || "Anonymous"}\n`;
      if (r.clientMeta) {
        markdown += `- **Client Specs**: Resolution: ${r.clientMeta.screenResolution}, Viewport: ${r.clientMeta.viewport}\n`;
      }
      markdown += `\n`;
    });

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeProject.slug}-acceptance-report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateStatus = async (reportId: string, status: string) => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
    await fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
  };

  const toggleWorkType = async (reportId: string, currentType: string) => {
    const nextType = currentType === "Scope Expansion" ? "Defect" : "Scope Expansion";
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, classification: nextType } : r)));
    await fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, classification: nextType }),
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500 animate-pulse">Loading Patchlane Console...</p>
      </div>
    );
  }

  const isProjectManager =
    activeProject?.currentUserRole === "owner" || activeProject?.currentUserRole === "agency_admin";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-black text-2xl tracking-tight text-slate-900" title="Return to Home">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-semibold text-slate-900 tracking-tight leading-tight">Agency Console</h1>
              {activeProject?.currentUserRole && (
                <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.2 rounded">
                  {activeProject.currentUserRole}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-xs">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ONLY DISPLAYED TO DESIGNATED SUPER ADMINS */}
          {isSuperAdmin && (
            <Link
              href="/admin"
              className="text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Website Ops</span>
            </Link>
          )}

          <button
            onClick={() => logout()}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 p-1.5 rounded transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Workspace Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project:</span>
            {projects.length > 0 ? (
              <select
                value={activeProject?.slug || ""}
                onChange={(e) => {
                  const sel = projects.find((p) => p.slug === e.target.value);
                  if (sel) setActiveProject(sel);
                }}
                className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} ({p.slug})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400 italic">No accessible projects</span>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium px-2.5 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>

          {activeProject && (
            <div className="flex items-center gap-2">
              {isProjectManager && (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                    title="Add developer teammates to this project"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Developer</span>
                  </button>

                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                    title="Manage team and remove members"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Manage Team</span>
                  </button>
                </>
              )}

              <button
                onClick={copyClientLink}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copySuccess ? "Link Copied!" : "Copy Client Link"}</span>
              </button>

              <a
                href={`/report/${activeProject.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 p-1.5"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={downloadReportSummary}
                className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>

              {activeProject.currentUserRole === "owner" && (
                <button
                  onClick={handleDeleteProject}
                  className="inline-flex items-center gap-1.5 text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 p-1.5 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Ticket List */}
      <main className="max-w-6xl w-full mx-auto p-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {activeProject ? `Reports for ${activeProject.name}` : "Workspace"} ({reports.length})
            </h2>
          </div>
          {activeProject && (
            <button
              onClick={fetchReports}
              disabled={isFetching}
              className="text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-white transition flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {reports.map((report) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded mr-2">
                      {report.url || "General"}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">{report.summary}</span>
                    {report.clientEmail && (
                      <span className="text-xs text-slate-400 ml-2">from {report.clientEmail}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={report.status || "Open"}
                      onChange={(e) => updateStatus(report.id, e.target.value)}
                      className={`text-xs font-medium border rounded-lg px-2.5 py-1 outline-none cursor-pointer transition shadow-xs ${getStatusStyles(
                        report.status || "Open"
                      )}`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Fixed">Fixed</option>
                    </select>

                    <button
                      onClick={() => toggleWorkType(report.id, report.classification)}
                      className={`text-xs font-medium px-3 py-1 rounded-lg border transition shadow-xs cursor-pointer ${getClassificationStyles(
                        report.classification
                      )}`}
                    >
                      {report.classification === "Scope Expansion" ? "Scope Expansion (Billable)" : "Defect (Warranty)"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs text-slate-600">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1">Expected:</span>
                    <p className="whitespace-pre-wrap">{report.expected || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1">Actual:</span>
                    <p className="whitespace-pre-wrap">{report.actual || "N/A"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    {report.clientMeta && (
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" />
                        Screen: {report.clientMeta.screenResolution} ({report.clientMeta.viewport})
                      </span>
                    )}
                  </div>
                  {report.attachmentUrl && (
                    <a
                      href={report.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      View Attached Screenshot
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Modal 1: Team Roster & Removal */}
      {showTeamModal && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Team Members</h3>
                <p className="text-xs text-slate-500">Manage developers assigned to {activeProject.name}</p>
              </div>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mb-4">
              {activeProject.assignedDevelopers && activeProject.assignedDevelopers.length > 0 ? (
                activeProject.assignedDevelopers.map((dev) => (
                  <div key={dev.email} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{dev.email}</p>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{dev.role}</span>
                    </div>

                    {dev.role !== "owner" && dev.email.toLowerCase() !== user.email?.toLowerCase() && (
                      <button
                        onClick={() => {
                          setMemberToRemove(dev.email);
                          setShowTeamModal(false);
                          setShowRemoveModal(true);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded flex items-center gap-1 transition"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No other developers assigned.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-xs text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal 2: Removal Reason */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Remove Developer</h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify the reason for removing <strong className="text-slate-800">{memberToRemove}</strong>. They will receive this message via email.
            </p>

            <form onSubmit={handleRemoveDeveloper} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Removal</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Milestone 1 scope concluded, developer reallocated to another account."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500"
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRemoveModal(false)}
                  className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRemoving}
                  className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {isRemoving ? "Removing & Notifying..." : "Confirm Removal & Send Email"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal 3: Add Developer */}
      {showInviteModal && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Developer to Project</h3>
            <form onSubmit={handleInviteDeveloper} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Developer Email</label>
                <input
                  type="email"
                  required
                  placeholder="developer@agency.com"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={inviteDevEmail}
                  onChange={(e) => setInviteDevEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Role</label>
                <select
                  value={inviteDevRole}
                  onChange={(e) => setInviteDevRole(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white cursor-pointer"
                >
                  <option value="developer">Developer</option>
                  <option value="agency_admin">Agency Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {isInviting ? "Inviting..." : "Add Developer"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal 4: Create Project */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create New Client Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Redesign"
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (!newProjectSlug) {
                      setNewProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"));
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="acme-redesign"
                  className="w-full text-sm font-mono border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs font-medium text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}