"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Search, Eye, Edit, X, UserCog, Shield,
  Key, UserCheck, CheckCircle, XCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Button, StatusBadge, Badge, UserAvatar, FormField,
  Pagination, EmptyState, SectionCard, ConfirmDialog,
  Toggle, Divider, cn,
} from "@/components/ui";
import { mockSystemUsers, mockRolePermissions, allPermissions, DEPARTMENTS } from "@/mock";
import type { SystemUser, UserRole, UserStatus, CreateUserFormData, RolePermission } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";

// ── User schema ────────────────────────────────────

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  employeeId: z.string().min(3, "Employee ID is required"),
  email: z.string().email("Valid email required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
  role: z.enum(["Administrator", "Committee Head", "Committee Member", "Teacher"] as const),
  status: z.enum(["Active", "Inactive", "Suspended", "Pending"] as const),
});

// ── Create/Edit User Modal ─────────────────────────

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateUserFormData, editId?: string) => void;
  editUser?: SystemUser | null;
}

function UserModal({ open, onClose, onSave, editUser }: UserModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateUserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", employeeId: "", email: "", department: "", designation: "", role: "Teacher", status: "Active" },
  });

  useEffect(() => {
    if (editUser) {
      reset({ name: editUser.name, employeeId: editUser.employeeId, email: editUser.email, department: editUser.department, designation: editUser.designation, role: editUser.role, status: editUser.status });
    } else {
      reset({ name: "", employeeId: "", email: "", department: "", designation: "", role: "Teacher", status: "Active" });
    }
  }, [editUser, reset, open]);

  const onSubmit = async (data: CreateUserFormData) => {
    await new Promise((r) => setTimeout(r, 600));
    onSave(data, editUser?.id);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="modal-content"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid #e8edf5" }}>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{editUser ? "Edit User" : "Create User Account"}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{editUser ? "Update user details" : "Create a new system user account"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required error={errors.name?.message} className="col-span-2">
              <input className={cn("pl-input", errors.name && "pl-input-error")} placeholder="Dr. Khalid Mahmood" {...register("name")} />
            </FormField>
            <FormField label="Employee ID" required error={errors.employeeId?.message}>
              <input className={cn("pl-input", errors.employeeId && "pl-input-error")} placeholder="EMP-CS-001" {...register("employeeId")} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <input type="email" className={cn("pl-input", errors.email && "pl-input-error")} placeholder="user@comsats.edu.pk" {...register("email")} />
            </FormField>
            <FormField label="Department" required error={errors.department?.message}>
              <select className="pl-select w-full" {...register("department")}>
                <option value="">Select…</option>
                <option value="Administration">Administration</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Designation" required error={errors.designation?.message}>
              <input className={cn("pl-input", errors.designation && "pl-input-error")} placeholder="Associate Professor" {...register("designation")} />
            </FormField>
            <FormField label="Role" required error={errors.role?.message}>
              <select className="pl-select w-full" {...register("role")}>
                {(["Administrator", "Committee Head", "Committee Member", "Teacher"] as UserRole[]).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Status" required error={errors.status?.message}>
              <select className="pl-select w-full" {...register("status")}>
                {(["Active", "Inactive", "Suspended", "Pending"] as UserStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-3" style={{ borderTop: "1px solid #e8edf5" }}>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>{editUser ? "Save Changes" : "Create User"}</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Permissions Panel ──────────────────────────────

const roleColors: Record<UserRole, string> = {
  Administrator: "#1e3d8a",
  "Committee Head": "#16a34a",
  "Committee Member": "#7c3aed",
  Teacher: "#d97706",
};

const roleModules = ["Students", "Committees", "Users & Access", "System", "Dashboard", "Cases", "Incidents", "Notifications"];

function PermissionsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("Administrator");
  const [permissions, setPermissions] = useState<RolePermission[]>(mockRolePermissions);

  const current = permissions.find((p) => p.role === selectedRole)?.permissions ?? [];

  const toggle = (key: string) => {
    setPermissions((prev) =>
      prev.map((rp) =>
        rp.role === selectedRole
          ? { ...rp, permissions: current.includes(key) ? current.filter((k) => k !== key) : [...current, key] }
          : rp
      )
    );
  };

  const handleSave = () => {
    toast.success(`Permissions updated for ${selectedRole}`);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="modal-content"
        style={{ maxWidth: 720, width: "95vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid #e8edf5" }}>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Role & Permission Management</h2>
            <p className="text-sm text-slate-500 mt-0.5">Configure access permissions for each system role</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="flex" style={{ height: "calc(80vh - 140px)", minHeight: 400 }}>
          {/* Role tabs */}
          <div className="flex flex-col gap-1 p-4" style={{ width: 200, borderRight: "1px solid #e8edf5", flexShrink: 0, overflowY: "auto" }}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">Select Role</p>
            {(["Administrator", "Committee Head", "Committee Member", "Teacher"] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm font-medium"
                style={{
                  background: selectedRole === role ? "#eef2fb" : "transparent",
                  color: selectedRole === role ? roleColors[role] : "#596578",
                  borderLeft: selectedRole === role ? `3px solid ${roleColors[role]}` : "3px solid transparent",
                }}
              >
                <Shield size={14} />
                {role}
              </button>
            ))}
          </div>

          {/* Permissions list */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center rounded-lg" style={{ width: 36, height: 36, background: `${roleColors[selectedRole]}15` }}>
                <Shield size={18} color={roleColors[selectedRole]} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{selectedRole}</h3>
                <p className="text-xs text-slate-500">{current.length} permission{current.length !== 1 ? "s" : ""} enabled</p>
              </div>
            </div>

            {roleModules.map((mod) => {
              const modPerms = allPermissions.filter((p) => p.module === mod);
              if (modPerms.length === 0) return null;
              return (
                <div key={mod} className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{mod}</h4>
                  <div className="space-y-2">
                    {modPerms.map((perm) => (
                      <div
                        key={perm.key}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: current.includes(perm.key) ? "#f8faff" : "#fafafa", border: `1px solid ${current.includes(perm.key) ? "#d0dbf4" : "#e8edf5"}` }}
                      >
                        <div className="flex items-start gap-3">
                          {current.includes(perm.key)
                            ? <CheckCircle size={16} color="#16a34a" className="mt-0.5 flex-shrink-0" />
                            : <XCircle size={16} color="#9aadc4" className="mt-0.5 flex-shrink-0" />}
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{perm.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{perm.description}</p>
                          </div>
                        </div>
                        <Toggle
                          checked={current.includes(perm.key)}
                          onChange={() => toggle(perm.key)}
                          disabled={selectedRole === "Administrator"}
                          id={`perm-${selectedRole}-${perm.key}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {selectedRole === "Administrator" && (
              <p className="text-xs text-slate-400 mt-2">Administrator has full system access. Permissions cannot be restricted.</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-7 py-4" style={{ borderTop: "1px solid #e8edf5" }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Permissions</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Main Users Page
// ═══════════════════════════════════════════════════

export default function UsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [users, setUsers] = useState<SystemUser[]>(mockSystemUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [viewUser, setViewUser] = useState<SystemUser | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<SystemUser | null>(null);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowModal(true);
      router.replace("/users");
    }
  }, [searchParams, router]);

  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (!q || u.name.toLowerCase().includes(q) || u.employeeId.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!roleFilter || u.role === roleFilter) &&
      (!statusFilter || u.status === statusFilter)
    );
  }), [users, search, roleFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const roleVariant = (role: UserRole) => {
    if (role === "Administrator") return "danger";
    if (role === "Committee Head") return "success";
    if (role === "Committee Member") return "navy";
    return "warning";
  };

  const handleSave = (data: CreateUserFormData, editId?: string) => {
    if (editId) {
      setUsers((prev) => prev.map((u) => u.id === editId ? { ...u, ...data, updatedAt: new Date().toISOString() } : u));
      toast.success("User updated successfully");
    } else {
      const nu: SystemUser = {
        ...data,
        id: `u${Date.now()}`,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUsers((prev) => [nu, ...prev]);
      toast.success("User account created successfully");
    }
    setEditUser(null);
  };

  const handleDeactivate = () => {
    if (!confirmDeactivate) return;
    setUsers((prev) => prev.map((u) => u.id === confirmDeactivate.id ? { ...u, status: "Inactive" as UserStatus } : u));
    toast.warning(`Account for "${confirmDeactivate.name}" has been deactivated`);
    setConfirmDeactivate(null);
  };

  const handleResetPassword = (user: SystemUser) => {
    toast.success(`Password reset link sent to ${user.email}`);
  };

  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Users & Access Management</h2>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" leftIcon={<Shield size={15} />} onClick={() => setShowPermissions(true)}>
              Manage Permissions
            </Button>
            <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => { setEditUser(null); setShowModal(true); }}>
              Create User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="pl-card p-4 flex flex-wrap items-center gap-3">
          <div className="pl-search" style={{ flex: "1 1 280px", maxWidth: 340 }}>
            <Search size={15} className="search-icon" />
            <input className="pl-input" style={{ paddingLeft: "2.375rem" }} placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="pl-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}>
            <option value="">All Roles</option>
            {["Administrator", "Committee Head", "Committee Member", "Teacher"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="pl-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as UserStatus | "")}>
            <option value="">All Statuses</option>
            {["Active", "Inactive", "Suspended", "Pending"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || roleFilter || statusFilter) && (
            <Button variant="ghost" size="sm" leftIcon={<X size={13} />} onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); }}>Clear</Button>
          )}
        </div>

        <SectionCard noPadding>
          {paginated.length === 0 ? (
            <EmptyState icon={<UserCog size={40} />} title="No users found" description="Adjust filters or create a new user account." action={<Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowModal(true)}>Create User</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Employee ID</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <td>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={u.name} size="sm" />
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">{u.name}</div>
                              <div className="text-xs text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="font-mono text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{u.employeeId}</span></td>
                        <td><Badge variant={roleVariant(u.role)}>{u.role}</Badge></td>
                        <td><span className="text-sm text-slate-600">{u.department}</span></td>
                        <td><StatusBadge status={u.status} /></td>
                        <td>
                          {u.lastLogin
                            ? <span className="text-xs text-slate-500">{new Date(u.lastLogin).toLocaleDateString("en-PK")}</span>
                            : <span className="text-xs text-slate-400">Never</span>}
                        </td>
                        <td><span className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-PK")}</span></td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700" title="View" onClick={() => setViewUser(u)}><Eye size={15} /></button>
                            <button className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600" title="Edit" onClick={() => { setEditUser(u); setShowModal(true); }}><Edit size={15} /></button>
                            <button className="p-1.5 rounded hover:bg-amber-50 text-slate-500 hover:text-amber-600" title="Reset Password" onClick={() => handleResetPassword(u)}><Key size={15} /></button>
                            {u.status === "Active" && u.role !== "Administrator" && (
                              <button className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-500" title="Deactivate" onClick={() => setConfirmDeactivate(u)}><XCircle size={15} /></button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #f0f4fb" }}>
                <p className="text-xs text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
              </div>
            </>
          )}
        </SectionCard>

        {/* User Detail */}
        <AnimatePresence>
          {viewUser && (
            <div className="modal-overlay" onClick={() => setViewUser(null)}>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="modal-content"
                style={{ maxWidth: 460 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between px-7 pt-6 pb-5" style={{ borderBottom: "1px solid #e8edf5" }}>
                  <div className="flex items-center gap-4">
                    <UserAvatar name={viewUser.name} size="lg" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{viewUser.name}</h2>
                      <p className="text-sm text-slate-500">{viewUser.designation}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={roleVariant(viewUser.role)}>{viewUser.role}</Badge>
                        <StatusBadge status={viewUser.status} />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setViewUser(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
                </div>
                <div className="px-7 py-5 space-y-1">
                  {[
                    ["Employee ID", viewUser.employeeId],
                    ["Email", viewUser.email],
                    ["Department", viewUser.department],
                    ["Last Login", viewUser.lastLogin ? new Date(viewUser.lastLogin).toLocaleString("en-PK") : "Never"],
                    ["Account Created", new Date(viewUser.createdAt).toLocaleDateString("en-PK")],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start py-2.5" style={{ borderBottom: "1px solid #f0f4fb" }}>
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400 w-36 flex-shrink-0 pt-0.5">{label}</span>
                      <span className="text-sm text-slate-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 px-7 py-4" style={{ borderTop: "1px solid #e8edf5" }}>
                  <Button variant="ghost" onClick={() => setViewUser(null)}>Close</Button>
                  <Button variant="primary" leftIcon={<Edit size={14} />} onClick={() => { setEditUser(viewUser); setViewUser(null); setShowModal(true); }}>Edit</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <UserModal open={showModal} onClose={() => { setShowModal(false); setEditUser(null); }} onSave={handleSave} editUser={editUser} />
        )}
        {showPermissions && (
          <PermissionsPanel open={showPermissions} onClose={() => setShowPermissions(false)} />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDeactivate}
        title="Deactivate User Account"
        message={`Are you sure you want to deactivate the account for "${confirmDeactivate?.name}"? They will lose access to the system.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmDeactivate(null)}
      />
    </>
  );
}
