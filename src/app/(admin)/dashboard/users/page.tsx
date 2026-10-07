"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiGet("/admin/users?limit=50");
      setUsers(json.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await apiPost("/admin/users", form);
      setShowModal(false);
      setForm({ full_name: "", email: "", password: "", role: "ADMIN" });
      fetchUsers();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    if (user.role === "SUPER_ADMIN") return; // protect super admin
    setToggling(user.id);
    try {
      await apiPut(`/admin/users/${user.id}`, { is_active: !user.is_active });
      fetchUsers();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">Team Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage staff accounts and access levels.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <i className="fa-solid fa-plus"></i> Add Staff Member
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div>
          </div>
        ) : error ? (
          <div className="py-24 text-center text-slate-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Staff Member</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Last Login</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E36727]/80 to-amber-600/80 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">
                          {user.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${user.role === "SUPER_ADMIN" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                        {user.role === "SUPER_ADMIN" ? "Super Admin" : "Store Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.is_active} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString("en-LK") : "Never"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString("en-LK")}
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== "SUPER_ADMIN" && (
                        <button
                          disabled={toggling === user.id}
                          onClick={() => toggleActive(user)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${user.is_active
                            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          } disabled:opacity-50`}
                        >
                          {toggling === user.id ? "..." : user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormError(null); }} title="Add Staff Member">
        <form onSubmit={handleCreate} className="space-y-5">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>{formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Dulani Perera"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <input
              required
              type="email"
              placeholder="e.g. dulani@catering.lk"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Temporary Password</label>
            <input
              required
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors cursor-pointer"
            >
              <option value="ADMIN">Store Admin — Day-to-day operations</option>
              <option value="SUPER_ADMIN">Super Admin — Full access</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
