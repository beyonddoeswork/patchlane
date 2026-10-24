"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, 
  ExternalLink, 
  Smartphone, 
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
  UserX,
  MessageSquare,
  Send,
  KeyRound,
  X
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

interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderColor: string;
  text: string;
  createdAt: string;
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

  // Profile State
  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [avatarColor, setAvatarColor] = useState("#4f46e5");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Group Chat State
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  // Project Creation & Dev Invitation Fields
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const [inviteDevEmail, setInviteDevEmail] = useState("");
  const [inviteDevRole, setInviteDevRole] = useState("developer");

  // Removal state
  const [memberToRemove, setMemberToRemove] = useState<string>("");
  const [removalReason, setRemovalReason] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  // Password reset state for manager
  const [targetMemberEmail, setTargetMemberEmail] = useState("");
  const [customNewPassword, setCustomNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

  // Real-time debounce check for slug availability
  useEffect(() => {
    if (!newProjectSlug.trim()) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const res = await fetch(`/api/projects?checkSlug=${encodeURIComponent(newProjectSlug)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [newProjectSlug]);

  // Load User Profile
  const loadProfile = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/user/profile?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.profile) {
        setDisplayName(data.profile.displayName);
        setJobTitle(data.profile.title);
        setAvatarColor(data.profile.avatarColor || "#4f46e5");
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          displayName,
          title: jobTitle,
          avatarColor,
        }),
      });
      if (!res.ok) throw new Error("Could not update profile");
      setShowProfileModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Load Projects
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

  // Load Reports
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

  // Load Team Chat Messages
  const fetchMessages = useCallback(async () => {
    if (!activeProject?.slug) return;
    try {
      const res = await fetch(`/api/projects/messages?projectSlug=${encodeURIComponent(activeProject.slug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error("Failed to load team messages", e);
    }
  }, [activeProject]);

  useEffect(() => {
    if (activeProject && showChat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [activeProject, showChat, fetchMessages]);

  useEffect(() => {
    if (showChat) {
      chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeProject?.slug || !user?.email) return;

    const currentText = chatInput;
    setChatInput("");
    setIsSendingMsg(true);

    try {
      const res = await fetch("/api/projects/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug: activeProject.slug,
          senderEmail: user.email,
          text: currentText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !newProjectName) return;

    setIsCreating(true);
    const generatedSlug = (newProjectSlug || newProjectName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

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
      setSlugAvailable(null);
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

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned status ${res.status}.`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign developer");

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
      alert(`Developer removed. Credentials cleaned up if no other projects remain, and notification email sent.`);
    } catch (err: any) {
      alert(err.message || "Could not remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleManagerPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberEmail) return;

    setIsResettingPassword(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          targetEmail: targetMemberEmail,
          customPassword: customNewPassword || undefined,
          resetBy: `${user?.email} (Project Lead)`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setShowPasswordResetModal(false);
      setCustomNewPassword("");
      alert(
        `Password reset for ${targetMemberEmail}!\nNew Password: ${data.newPassword}\n\nAn email with the updated credentials has been dispatched to the user.`
      );
    } catch (err: any) {
      alert(err.message || "Failed to reset password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject || !user?.email) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${activeProject.name}"? All associated tickets, messages, and the URL slug will be permanently deleted and freed.`
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
      if (r.attachmentUrl) {
        markdown += `- **Screenshot Proof**: ${r.attachmentUrl}\n`;
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
    <div className="min-h-screen bg-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-black text-2xl tracking-tight text-slate-900" title="Return to Home">
            Patchlane<span className="text-indigo-600">.</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile Trigger */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2.5 p-1 hover:bg-slate-50 rounded-lg transition text-left cursor-pointer"
            title="Edit your developer profile"
          >
            <div
              className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-2xs"
              style={{ backgroundColor: avatarColor }}
            >
              {(displayName || user.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">{displayName || user.email?.split("@")[0]}</span>
                {activeProject?.currentUserRole && (
                  <span className="text-[9px] uppercase font-bold bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded">
                    {activeProject.currentUserRole}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-none">{jobTitle || user.email}</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Team Chat Trigger Button */}
          {activeProject && (
            <button
              onClick={() => setShowChat((prev) => !prev)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                showChat
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Project Chat</span>
            </button>
          )}

          {/* Super Admin Restricted Button */}
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
              onClick={() => {
                setNewProjectName("");
                setNewProjectSlug("");
                setSlugAvailable(null);
                setShowCreateModal(true);
              }}
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
                    title="Manage team, reset passwords and remove members"
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

      {/* Main Ticket Workspace with Responsive Chat Drawer */}
      <div className="flex-1 flex overflow-hidden">
        <main className="max-w-6xl w-full mx-auto p-6 flex-1 transition-all">
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

            {reports.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-xl text-slate-400 text-sm">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-700 font-medium">No reports logged for this project yet</p>
                <p className="text-xs text-slate-400 mt-1">Share the client link above to begin receiving items.</p>
              </div>
            )}
          </div>
        </main>

        {/* Floating / Sliding Team Group Chat Drawer */}
        <AnimatePresence>
          {showChat && activeProject && (
            <motion.aside
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-84 sm:w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col z-20 h-[calc(100vh-105px)] sticky top-[105px]"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{activeProject.name} Chat</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-500">Live communication for assigned devs</p>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                    <p>No messages yet.</p>
                    <p className="text-[11px]">Start the conversation with your team!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderEmail.toLowerCase() === user.email?.toLowerCase();
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                            style={{ backgroundColor: m.senderColor || "#4f46e5" }}
                          >
                            {(m.senderName || "U")[0].toUpperCase()}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700">
                            {isMe ? "You" : m.senderName}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div
                          className={`text-xs px-3.5 py-2 rounded-2xl max-w-[85%] break-words leading-relaxed shadow-2xs ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatScrollRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a team update..."
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingMsg}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2 rounded-lg transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Modal 1: Edit User Profile */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Developer Profile</h3>
            <p className="text-xs text-slate-500 mb-4">Update your display information shown to your teammates in project chats.</p>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Frontend Engineer"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Color</label>
                <div className="flex items-center gap-2 mt-1">
                  {["#4f46e5", "#0284c7", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${avatarColor === color ? "scale-125 ring-2 ring-indigo-500 ring-offset-2" : "hover:scale-110"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal 2: Team Roster & Removal & Password Reset */}
      {showTeamModal && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Team Members</h3>
                <p className="text-xs text-slate-500">Manage developers assigned to {activeProject.name}</p>
              </div>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mb-4">
              {activeProject.assignedDevelopers && activeProject.assignedDevelopers.length > 0 ? (
                activeProject.assignedDevelopers.map((dev) => (
                  <div key={dev.email} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{dev.email}</p>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{dev.role}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isProjectManager && (
                        <button
                          onClick={() => {
                            setTargetMemberEmail(dev.email);
                            setShowTeamModal(false);
                            setShowPasswordResetModal(true);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded flex items-center gap-1 transition cursor-pointer"
                          title="Reset password for this teammate"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>
                      )}

                      {dev.role !== "owner" && dev.email.toLowerCase() !== user.email?.toLowerCase() && (
                        <button
                          onClick={() => {
                            setMemberToRemove(dev.email);
                            setShowTeamModal(false);
                            setShowRemoveModal(true);
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded flex items-center gap-1 transition cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No other developers assigned.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-xs text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal 3: Removal Reason */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Remove Developer</h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify the reason for removing <strong className="text-slate-800">{memberToRemove}</strong>. They will receive this message via email and their credentials will be wiped if no other projects exist.
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
                  className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRemoving}
                  className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isRemoving ? "Removing & Notifying..." : "Confirm Removal & Send Email"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal 4: Add Developer */}
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
                  className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isInviting ? "Inviting..." : "Add Developer"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal 5: Create Project with Live Slug Availability */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create New Client Project</h3>
            <p className="text-xs text-slate-500 mb-4">Each project gets a globally unique URL slug for client feedback intake.</p>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Studio"
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    const generated = e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9-_]/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, "");
                    setNewProjectSlug(generated);
                  }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">URL Slug</label>
                  {checkingSlug && <span className="text-[10px] text-slate-400">Checking availability...</span>}
                  {!checkingSlug && slugAvailable === true && (
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Available</span>
                  )}
                  {!checkingSlug && slugAvailable === false && (
                    <span className="text-[10px] text-amber-600 font-semibold">⚠ Taken (Auto-suffix will be applied)</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="acme-studio"
                  className="w-full text-sm font-mono border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Client URL: <code className="text-indigo-600 font-mono">/report/{newProjectSlug || "slug"}</code>
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProjectName("");
                    setNewProjectSlug("");
                    setSlugAvailable(null);
                  }}
                  className="text-xs font-medium text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal 6: Manager Password Reset */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Teammate Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Reset login credentials for <strong className="text-slate-800">{targetMemberEmail}</strong>. A notification with the updated password will be emailed to them immediately.
            </p>

            <form onSubmit={handleManagerPasswordReset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password <span className="text-slate-400 font-normal">(Leave empty to auto-generate)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SecurePass2026!"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 font-mono"
                  value={customNewPassword}
                  onChange={(e) => setCustomNewPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordResetModal(false);
                    setCustomNewPassword("");
                  }}
                  className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isResettingPassword ? "Updating & Emailing..." : "Confirm & Send Password"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}