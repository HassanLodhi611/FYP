"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Eye, Edit, X, Users, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  StatusBadge,
  Badge,
  UserAvatar,
  FormField,
  Pagination,
  EmptyState,
  SectionCard,
  ConfirmDialog,
  cn,
} from "@/components/ui";
import { mockCommitteeMembers, mockCommittees, DEPARTMENTS } from "@/mock";
import type { CommitteeMember, MemberRole, MemberStatus } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";

// ── Schema ────────────────────────────────────────

const memberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  employeeId: z.string().min(3, "Employee ID is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone is required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
  role: z.enum(["Committee Head", "Committee Member", "Secretary", "Co-ordinator"] as const),
  committeeId: z.string().optional(),
  status: z.enum(["Active", "Inactive", "On Leave"] as const),
});

type MemberFormData = z.infer<typeof memberSchema>;

// ── Add/Edit Member Modal ──────────────────────────

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MemberFormData, editId?: string) => void;
  editMember?: CommitteeMember | null;
}

function MemberModal({ open, onClose, onSave, editMember }: MemberModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "", employeeId: "", email: "", phone: "",
      department: "", designation: "", role: "Committee Member",
      committeeId: "", status: "Active",
    },
  });

  useEffect(() => {
    if (editMember) {
      reset({
        name: editMember.name, employeeId: editMember.employeeId,
        email: editMember.email, phone: editMember.phone,
        department: editMember.department, designation: editMember.designation,
        role: editMember.role, committeeId: editMember.committeeId ?? "",
        status: editMember.status,
      });
    } else {
      reset({ name: "", employeeId: "", email: "", phone: "", department: "", designation: "", role: "Committee Member", committeeId: "", status: "Active" });
    }
  }, [editMember, reset, open]);

  const onSubmit = async (data: MemberFormData) => {
    await new Promise((r) => setTimeout(r, 600));
    onSave(data, editMember?.id);
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
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid #e8edf5" }}>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{editMember ? "Edit Member" : "Add Committee Member"}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{editMember ? "Update member details" : "Add a faculty member to the committee system"}</p>
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
            <FormField label="Designation" required error={errors.designation?.message}>
              <input className={cn("pl-input", errors.designation && "pl-input-error")} placeholder="Associate Professor" {...register("designation")} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message} className="col-span-2">
              <input type="email" className={cn("pl-input", errors.email && "pl-input-error")} placeholder="k.mahmood@comsats.edu.pk" {...register("email")} />
            </FormField>
            <FormField label="Phone" required error={errors.phone?.message}>
              <input className={cn("pl-input", errors.phone && "pl-input-error")} placeholder="+92-300-1111111" {...register("phone")} />
            </FormField>
            <FormField label="Department" required error={errors.department?.message}>
              <select className="pl-select w-full" {...register("department")}>
                <option value="">Select…</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Role" required error={errors.role?.message}>
              <select className="pl-select w-full" {...register("role")}>
                {(["Committee Head", "Committee Member", "Secretary", "Co-ordinator"] as MemberRole[]).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Assign Committee" hint="Optional">
              <select className="pl-select w-full" {...register("committeeId")}>
                <option value="">No Assignment</option>
                {mockCommittees.filter((c) => c.status === "Active").map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Status" required error={errors.status?.message}>
              <select className="pl-select w-full" {...register("status")}>
                {(["Active", "Inactive", "On Leave"] as MemberStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-3" style={{ borderTop: "1px solid #e8edf5" }}>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>{editMember ? "Save Changes" : "Add Member"}</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Member Detail Panel ────────────────────────────

function MemberDetailPanel({ member, onClose, onEdit }: { member: CommitteeMember; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="modal-content"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-7 pt-6 pb-5" style={{ borderBottom: "1px solid #e8edf5" }}>
          <div className="flex items-center gap-4">
            <UserAvatar name={member.name} size="lg" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">{member.name}</h2>
              <p className="text-sm text-slate-500">{member.designation} · {member.department}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="navy">{member.role}</Badge>
                <StatusBadge status={member.status} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="px-7 py-5 space-y-3">
          {[
            ["Employee ID", member.employeeId],
            ["Email", member.email],
            ["Phone", member.phone],
            ["Assigned Committee", member.committeeName ?? "Not Assigned"],
            ["Date Joined", new Date(member.joinedAt).toLocaleDateString("en-PK")],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start py-2.5" style={{ borderBottom: "1px solid #f0f4fb" }}>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400 w-40 flex-shrink-0 pt-0.5">{label}</span>
              <span className="text-sm text-slate-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 px-7 py-4" style={{ borderTop: "1px solid #e8edf5" }}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary" leftIcon={<Edit size={14} />} onClick={onEdit}>Edit</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Main Committee Members Page
// ═══════════════════════════════════════════════════

export default function CommitteeMembersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [members, setMembers] = useState<CommitteeMember[]>(mockCommitteeMembers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<MemberRole | "">("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "">("");
  const [deptFilter, setDeptFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<CommitteeMember | null>(null);
  const [viewMember, setViewMember] = useState<CommitteeMember | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<CommitteeMember | null>(null);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setShowModal(true);
      router.replace("/committee-members");
    }
  }, [searchParams, router]);

  const filtered = useMemo(() => members.filter((m) => {
    const q = search.toLowerCase();
    return (
      (!q || m.name.toLowerCase().includes(q) || m.employeeId.toLowerCase().includes(q)) &&
      (!roleFilter || m.role === roleFilter) &&
      (!statusFilter || m.status === statusFilter) &&
      (!deptFilter || m.department === deptFilter)
    );
  }), [members, search, roleFilter, statusFilter, deptFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (data: MemberFormData, editId?: string) => {
    const committeeInfo = data.committeeId
      ? { committeeId: data.committeeId, committeeName: mockCommittees.find((c) => c.id === data.committeeId)?.name ?? null }
      : { committeeId: null, committeeName: null };

    if (editId) {
      setMembers((prev) => prev.map((m) => m.id === editId ? { ...m, ...data, ...committeeInfo } : m));
      toast.success("Member updated successfully");
    } else {
      const nm: CommitteeMember = {
        ...data,
        ...committeeInfo,
        id: `m${Date.now()}`,
        joinedAt: new Date().toISOString(),
      };
      setMembers((prev) => [nm, ...prev]);
      toast.success("Committee member added successfully");
    }
    setEditMember(null);
  };

  const handleRemove = () => {
    if (!confirmRemove) return;
    setMembers((prev) => prev.filter((m) => m.id !== confirmRemove.id));
    toast.success(`Member "${confirmRemove.name}" removed`);
    setConfirmRemove(null);
  };

  const hasFilters = search || roleFilter || statusFilter || deptFilter;

  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Committee Members</h2>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => { setEditMember(null); setShowModal(true); }}>
            Add Member
          </Button>
        </div>

        <div className="pl-card p-4 flex flex-wrap items-center gap-3">
          <div className="pl-search" style={{ flex: "1 1 280px", maxWidth: 320 }}>
            <Search size={15} className="search-icon" />
            <input className="pl-input" style={{ paddingLeft: "2.375rem" }} placeholder="Search members…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="pl-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as MemberRole | "")}>
            <option value="">All Roles</option>
            {["Committee Head", "Committee Member", "Secretary", "Co-ordinator"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="pl-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MemberStatus | "")}>
            <option value="">All Statuses</option>
            {["Active", "Inactive", "On Leave"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="pl-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {hasFilters && (
            <Button variant="ghost" size="sm" leftIcon={<X size={13} />} onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); setDeptFilter(""); }}>Clear</Button>
          )}
        </div>

        <SectionCard noPadding>
          {paginated.length === 0 ? (
            <EmptyState icon={<Users size={40} />} title="No members found" description="Adjust filters or add a new committee member." action={<Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowModal(true)}>Add Member</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Assigned Committee</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((m, i) => (
                      <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <td>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={m.name} size="sm" />
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">{m.name}</div>
                              <div className="text-xs text-slate-400">{m.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="font-mono text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{m.employeeId}</span></td>
                        <td><span className="text-sm text-slate-600">{m.department}</span></td>
                        <td>
                          <Badge variant={m.role === "Committee Head" ? "navy" : m.role === "Secretary" ? "info" : "neutral"}>
                            {m.role}
                          </Badge>
                        </td>
                        <td>
                          {m.committeeName
                            ? <span className="text-sm text-slate-600">{m.committeeName}</span>
                            : <span className="text-xs text-slate-400">—</span>
                          }
                        </td>
                        <td><StatusBadge status={m.status} /></td>
                        <td><span className="text-xs text-slate-500">{new Date(m.joinedAt).toLocaleDateString("en-PK")}</span></td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700" title="View" onClick={() => setViewMember(m)}><Eye size={15} /></button>
                            <button className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600" title="Edit" onClick={() => { setEditMember(m); setShowModal(true); }}><Edit size={15} /></button>
                            <button className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-500" title="Remove" onClick={() => setConfirmRemove(m)}><X size={15} /></button>
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
      </div>

      <AnimatePresence>
        {showModal && (
          <MemberModal open={showModal} onClose={() => { setShowModal(false); setEditMember(null); }} onSave={handleSave} editMember={editMember} />
        )}
        {viewMember && (
          <MemberDetailPanel member={viewMember} onClose={() => setViewMember(null)} onEdit={() => { setEditMember(viewMember); setViewMember(null); setShowModal(true); }} />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove Committee Member"
        message={`Are you sure you want to remove ${confirmRemove?.name} from the committee system?`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </>
  );
}
