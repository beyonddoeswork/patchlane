"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  FolderGit2, 
  Plus, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  ArrowLeft, 
  RefreshCw,
  Trash2,
  CheckCircle2,
  Briefcase
} from "lucide-react";

interface Company {
  id: string;
  agencyName: string;
  email: string;
  phone: string;
  plan: string;
  createdAt?: string;
}

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  assignedDevelopers: { email: string; role: string; assignedAt: string }[];
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState("");

  // Form Fields
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newCompanyPhone, setNewCompanyPhone] = useState("");
  
  const [assignDevEmail, setAssignDevEmail] = useState("");
  const [assignDevRole, setAssignDevRole] = useState("developer");
  const [statusMessage, setStatusMessage] = useState("");

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/companies", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setCompanies(data.companies || []);
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error("Admin fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else {
      loadAdminData();
    }
  }, [user, loading, router, loadAdminData]);

  // Onboard Client Company
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_company",
          companyName: newCompanyName,
          ownerEmail: newOwnerEmail,
          phone: newCompanyPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowCompanyModal(false);
      setNewCompanyName("");
      setNewOwnerEmail("");
      setNewCompanyPhone("");
      setStatusMessage("Company onboarded successfully.");
      setTimeout(() => setStatusMessage(""), 4000);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to onboard company");
    }
  };

  // Assign Developer to Project
  const handleAssignDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_member",
          projectSlug: selectedProjectSlug,
          developerEmail: assignDevEmail,
          role: assignDevRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowAssignModal(false);
      setAssignDevEmail("");
      setStatusMessage(`Assigned ${assignDevEmail} to ${selectedProjectSlug}`);
      setTimeout(() => setStatusMessage(""), 4000);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to assign developer");
    }
  };

  // Remove Member
  const handleRemoveMember = async (projectSlug: string, developerEmail: string) => {
    if (!confirm(`Remove ${developerEmail} from ${projectSlug}?`)) return;
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_member",
          projectSlug,
          developerEmail,
        }),
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading Patchlane Admin Operations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App Console</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-slate-900 tracking-tight">
                Patchlane<span className="text-indigo-600">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                Super Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Data</span>
            </button>
            <button
              onClick={() => setShowCompanyModal(true)}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Company</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-6 sm:p-8 flex-1 space-y-8">
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Client Companies</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{companies.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Workspaces</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{projects.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Developer Seats</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {projects.reduce((acc, p) => acc + (p.assignedDevelopers?.length || 0), 0)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Section 1: Projects & Assigned Developer Teams */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Project Teams & Developer Assignments</h2>
              <p className="text-xs text-slate-500">Manage multiple developers assigned to individual client feedback portals</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {projects.map((proj) => (
              <div key={proj.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{proj.name}</span>
                      <span className="font-mono text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                        /report/{proj.slug}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Primary Owner: <span className="text-slate-600">{proj.ownerEmail}</span></p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProjectSlug(proj.slug);
                      setShowAssignModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Developer to Project</span>
                  </button>
                </div>

                {/* Team Roster */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Assigned Project Staff ({proj.assignedDevelopers?.length || 0})
                  </div>
                  
                  {proj.assignedDevelopers && proj.assignedDevelopers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {proj.assignedDevelopers.map((dev) => (
                        <div key={dev.email} className="bg-white border border-slate-200 px-3 py-2 rounded-md flex items-center justify-between text-xs">
                          <div className="truncate mr-2">
                            <p className="font-semibold text-slate-800 truncate">{dev.email}</p>
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              dev.role === "owner" || dev.role === "agency_admin"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {dev.role}
                            </span>
                          </div>
                          {dev.role !== "owner" && (
                            <button
                              onClick={() => handleRemoveMember(proj.slug, dev.email)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition"
                              title="Remove from project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No developers assigned yet besides owner.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Onboarded Client Companies */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Provisioned Client Companies</h2>
            <p className="text-xs text-slate-500">Agencies and companies closed under enterprise or retainer deals</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Agency / Client Name</th>
                  <th className="px-6 py-3">Primary Contact</th>
                  <th className="px-6 py-3">Phone / WhatsApp</th>
                  <th className="px-6 py-3">Tier Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{c.agencyName}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-mono">{c.email}</td>
                    <td className="px-6 py-3.5 text-slate-600">{c.phone || "—"}</td>
                    <td className="px-6 py-3.5">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                        Contract Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal 1: Provision Client Company */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Provision Client Company</h3>
            <p className="text-xs text-slate-500 mb-4">Set up an agency or client after a deal has closed.</p>
            <form onSubmit={handleCreateCompany} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Studio Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HyperScale Media"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@hyperscale.com"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Phone Contact</label>
                <input
                  type="text"
                  placeholder="+91 99887 76655"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={newCompanyPhone}
                  onChange={(e) => setNewCompanyPhone(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal 2: Assign Developer Role to Project */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Assign Developer to Project</h3>
            <p className="text-xs text-slate-500 mb-4">Project: <span className="font-mono text-indigo-600">/report/{selectedProjectSlug}</span></p>
            <form onSubmit={handleAssignDeveloper} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Developer Email</label>
                <input
                  type="email"
                  required
                  placeholder="dev@agency.com"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-600"
                  value={assignDevEmail}
                  onChange={(e) => setAssignDevEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Permissions</label>
                <select
                  value={assignDevRole}
                  onChange={(e) => setAssignDevRole(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white cursor-pointer"
                >
                  <option value="developer">Developer (Triage, Change Status, Mark Billable)</option>
                  <option value="agency_admin">Agency Admin (Full Project Settings & Exports)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Grant Project Access
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}