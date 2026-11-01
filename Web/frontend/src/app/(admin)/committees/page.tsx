"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Users,
  UserCheck,
  X,
  Shield,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
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
import {
  mockCommittees,
  mockCommitteeMembers,
  DEPARTMENTS,
} from "@/mock";
import type {
  Committee,
  CommitteeStatus,
  CreateCommitteeFormData,
} from "@/types";
import { useSearchParams, useRouter } from "next/navigation";

// ── Zod schema ─────────────────────────────────────

const committeeSchema = z.object({
  name: z.string().min(3, "Committee name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  headId: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["Active", "Inactive", "Pending", "Expired"] as const),
}).refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CommitteeFormData = z.infer<typeof committeeSchema>;

// ── Head Selection Modal ────────────────────────────

interface HeadSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (memberId: string, memberName: string) => void;
}

function HeadSelectionModal({ open, onClose, onSelect }: HeadSelectionModalProps) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");

  const eligible = mockCommitteeMembers.filter(
    (m) =>
      m.status === "Active" &&
      (m.role === "Committee Head" || m.role === "Committee Member") &&
      (search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.employeeId.toLowerCase().includes(search.toLowerCase())) &&
      (dept === "" || m.department === dept)
  );

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="modal-content"
        style={{ maxWidth: 600 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid #e8edf5" }}>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Select Committee Head</h2>
            <p className="text-sm text-slate-500 mt-0.5">Choose an eligible faculty member to lead this committee</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="px-7 py-4 flex gap-3" style={{ borderBottom: "1px solid #f0f4fb" }}>
          <div className="pl-search flex-1">
            <Search size={14} className="search-icon" />
            <input
              className="pl-input"
              style={{ paddingLeft: "2.375rem" }}
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="pl-select" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
          {eligible.length === 0 ? (
            <EmptyState icon={<Users size={32} />} title="No eligible members found" description="Adjust your search filters" />
          ) : (
            eligible.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-7 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderBottom: "1px solid #f0f4fb" }}
                onClick={() => { onSelect(m.id, m.name); onClose(); }}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={m.name} size="sm" />
                  <div>
                    <div className="font-semibold text-slate-700 text-sm">{m.name}</div>
                    <div className="text-xs text-slate-400">{m.employeeId} · {m.designation}</div>
                    <div className="text-xs text-slate-400">{m.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{m.role}</Badge>
                  <StatusBadge status={m.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Create/Edit Committee Modal ─────────────────────

interface CommitteeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateCommitteeFormData & { headName: string }, editId?: string) => void;
  editCommittee?: Committee | null;
}

function CommitteeModal({ open, onClose, onSave, editCommittee }: CommitteeModalProps) {
  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [selectedHeadName, setSelectedHeadName] = useState("");
  const [showHeadSelect, setShowHeadSelect] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommitteeFormData>({
    resolver: zodResolver(committeeSchema),
    defaultValues: {
      name: "",
      description: "",
      headId: "",
      startDate: "",
      endDate: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (editCommittee) {
      reset({
        name: editCommittee.name,
        description: editCommittee.description,
        headId: editCommittee.headId ?? "",
        startDate: editCommittee.startDate,
        endDate: editCommittee.endDate,
        status: editCommittee.status,
      });
      setSelectedHeadId(editCommittee.headId ?? "");
      setSelectedHeadName(editCommittee.headName ?? "");
    } else {
      reset({ name: "", description: "", headId: "", startDate: "", endDate: "", status: "Active" });
      setSelectedHeadId("");
      setSelectedHeadName("");
    }
  }, [editCommittee, reset, open]);

  const onSubmit = async (data: CommitteeFormData) => {
    await new Promise((r) => setTimeout(r, 600));
    onSave({ ...data, headId: selectedHeadId, headName: selectedHeadName }, editCommittee?.id);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <AnimatePresence>
        {showHeadSelect && (
          <HeadSelectionModal
            open={showHeadSelect}
            onClose={() => setShowHeadSelect(false)}
            onSelect={(id, name) => { setSelectedHeadId(id); setSelectedHeadName(name); }}
          />
        )}
      </AnimatePresence>
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
            <h2 className="text-lg font-bold text-slate-800">
              {editCommittee ? "Edit Committee" : "Create New Committee"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {editCommittee ? "Update committee details" : "Set up a new disciplinary committee"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-6 space-y-4">
          <FormField label="Committee Name" required error={errors.name?.message}>
            <input className={cn("pl-input", errors.name && "pl-input-error")} placeholder="e.g. Disciplinary Action Committee" {...register("name")} />
          </FormField>
          <FormField label="Description" required error={errors.description?.message}>
            <textarea
              className={cn("pl-input", errors.description && "pl-input-error")}
              style={{ height: "auto", minHeight: "5rem", padding: "0.625rem 0.875rem", resize: "vertical" }}
              placeholder="Describe the committee's purpose and responsibilities…"
              {...register("description")}
            />
          </FormField>
          <FormField label="Committee Head" hint="Optional — can be assigned later">
            <div className="flex items-center gap-2">
              <div className="flex-1 pl-input flex items-center text-sm" style={{ color: selectedHeadName ? "#0f2044" : "#9aadc4" }}>
                {selectedHeadName || "No head selected"}
              </div>
              <Button type="button" variant="secondary" size="sm" leftIcon={<UserCheck size={13} />} onClick={() => setShowHeadSelect(true)}>
                {selectedHeadId ? "Change" : "Select"}
              </Button>
              {selectedHeadId && (
                <button type="button" onClick={() => { setSelectedHeadId(""); setSelectedHeadName(""); }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400">
                  <X size={14} />
                </button>
              )}
            </div>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required error={errors.startDate?.message}>
              <input type="date" className={cn("pl-input", errors.startDate && "pl-input-error")} {...register("startDate")} />
            </FormField>
            <FormField label="End Date" required error={errors.endDate?.message}>
              <input type="date" className={cn("pl-input", errors.endDate && "pl-input-error")} {...register("endDate")} />
            </FormField>
          </div>
          <FormField label="Status" required error={errors.status?.message}>
            <select className="pl-select w-full" {...register("status")}>
              {(["Active", "Inactive", "Pending", "Expired"] as CommitteeStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-3" style={{ borderTop: "1px solid #e8edf5" }}>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editCommittee ? "Save Changes" : "Create Committee"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Main Committees Page
// ═══════════════════════════════════════════════════

type CommitteeSortField = "name" | "memberCount" | "status" | "startDate";

export default function CommitteesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [committees, setCommittees] = useState<Committee[]>(mockCommittees);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommitteeStatus | "">("");
  const [sortField, setSortField] = useState<CommitteeSortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 7;

  const [showModal, setShowModal] = useState(false);
  const [editCommittee, setEditCommittee] = useState<Committee | null>(null);
  const [viewCommittee, setViewCommittee] = useState<Committee | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Committee | null>(null);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowModal(true);
      router.replace("/committees");
    }
  }, [searchParams, router]);

  const handleSort = (field: CommitteeSortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    return committees
      .filter((c) => {
        const q = search.toLowerCase();
        return (
          (!q || c.name.toLowerCase().includes(q) || c.committeeId.toLowerCase().includes(q) || (c.headName ?? "").toLowerCase().includes(q)) &&
          (!statusFilter || c.status === statusFilter)
        );
      })
      .sort((a, b) => {
        const av = a[sortField as keyof Committee] ?? "";
        const bv = b[sortField as keyof Committee] ?? "";
        if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
  }, [committees, search, statusFilter, sortField, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ field }: { field: CommitteeSortField }) =>
    sortField === field
      ? sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <ChevronDown size={13} className="opacity-0 group-hover:opacity-40" />;

  const handleSave = (data: CreateCommitteeFormData & { headName: string }, editId?: string) => {
    if (editId) {
      setCommittees((prev) =>
        prev.map((c) =>
          c.id === editId
            ? { ...c, ...data, headId: data.headId || null, headName: data.headName || null, updatedAt: new Date().toISOString() }
            : c
        )
      );
      toast.success("Committee updated successfully");
    } else {
      const nc: Committee = {
        ...data,
        id: `c${Date.now()}`,
        committeeId: `CMTE-${Date.now().toString().slice(-4)}`,
        headId: data.headId || null,
        headName: data.headName || null,
        memberCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCommittees((prev) => [nc, ...prev]);
      toast.success("Committee created successfully");
    }
    setEditCommittee(null);
  };

  const handleDeactivate = () => {
    if (!confirmDeactivate) return;
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === confirmDeactivate.id
          ? { ...c, status: "Inactive" as CommitteeStatus, updatedAt: new Date().toISOString() }
          : c
      )
    );
    toast.warning(`Committee "${confirmDeactivate.name}" has been deactivated`);
    setConfirmDeactivate(null);
  };

  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Committee Management</h2>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} committee{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => { setEditCommittee(null); setShowModal(true); }}>
            Create Committee
          </Button>
        </div>

        {/* Filters */}
        <div className="pl-card p-4 flex items-center gap-3 flex-wrap">
          <div className="pl-search" style={{ flex: "1 1 280px", maxWidth: 340 }}>
            <Search size={15} className="search-icon" />
            <input className="pl-input" style={{ paddingLeft: "2.375rem" }} placeholder="Search committees…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="pl-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CommitteeStatus | "")}>
            <option value="">All Statuses</option>
            {["Active", "Inactive", "Pending", "Expired"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || statusFilter) && (
            <Button variant="ghost" size="sm" leftIcon={<X size={13} />} onClick={() => { setSearch(""); setStatusFilter(""); }}>Clear</Button>
          )}
        </div>

        {/* Table */}
        <SectionCard noPadding>
          {paginated.length === 0 ? (
            <EmptyState icon={<Shield size={40} />} title="No committees found" description="Try adjusting filters or create a new committee." action={<Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowModal(true)}>Create Committee</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th><button className="group flex items-center gap-1" onClick={() => handleSort("name")}>Committee <SortIcon field="name" /></button></th>
                      <th>ID</th>
                      <th>Committee Head</th>
                      <th><button className="group flex items-center gap-1" onClick={() => handleSort("memberCount")}>Members <SortIcon field="memberCount" /></button></th>
                      <th><button className="group flex items-center gap-1" onClick={() => handleSort("status")}>Status <SortIcon field="status" /></button></th>
                      <th><button className="group flex items-center gap-1" onClick={() => handleSort("startDate")}>Start Date <SortIcon field="startDate" /></button></th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((c, i) => (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <td>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">{c.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.description}</div>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{c.committeeId}</span>
                        </td>
                        <td>
                          {c.headName ? (
                            <div className="flex items-center gap-2">
                              <UserAvatar name={c.headName} size="xs" />
                              <span className="text-sm text-slate-600">{c.headName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">Unassigned</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Users size={13} className="text-slate-400" />
                            {c.memberCount}
                          </div>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar size={12} />
                            {new Date(c.startDate).toLocaleDateString("en-PK")}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar size={12} />
                            {new Date(c.endDate).toLocaleDateString("en-PK")}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700" title="View" onClick={() => setViewCommittee(c)}><Eye size={15} /></button>
                            <button className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600" title="Edit" onClick={() => { setEditCommittee(c); setShowModal(true); }}><Edit size={15} /></button>
                            {c.status === "Active" && (
                              <button className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-500" title="Deactivate" onClick={() => setConfirmDeactivate(c)}><X size={15} /></button>
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

        {/* View Committee Modal */}
        <AnimatePresence>
          {viewCommittee && (
            <div className="modal-overlay" onClick={() => setViewCommittee(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="modal-content"
                style={{ maxWidth: 500 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid #e8edf5" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: "#eef2fb" }}>
                      <Shield size={22} color="#1e3d8a" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-800">{viewCommittee.name}</h2>
                      <span className="font-mono text-xs text-slate-400">{viewCommittee.committeeId}</span>
                    </div>
                  </div>
                  <button onClick={() => setViewCommittee(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
                </div>
                <div className="px-7 py-5 space-y-4">
                  <StatusBadge status={viewCommittee.status} />
                  <p className="text-sm text-slate-600 leading-relaxed">{viewCommittee.description}</p>
                  {[
                    ["Committee Head", viewCommittee.headName ?? "Unassigned"],
                    ["Members", String(viewCommittee.memberCount)],
                    ["Start Date", new Date(viewCommittee.startDate).toLocaleDateString("en-PK")],
                    ["End Date", new Date(viewCommittee.endDate).toLocaleDateString("en-PK")],
                    ["Created", new Date(viewCommittee.createdAt).toLocaleDateString("en-PK")],
                    ["Last Updated", new Date(viewCommittee.updatedAt).toLocaleDateString("en-PK")],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center py-2" style={{ borderBottom: "1px solid #f0f4fb" }}>
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400 w-36 flex-shrink-0">{label}</span>
                      <span className="text-sm text-slate-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 px-7 py-4" style={{ borderTop: "1px solid #e8edf5" }}>
                  <Button variant="ghost" onClick={() => setViewCommittee(null)}>Close</Button>
                  <Button variant="primary" leftIcon={<Edit size={14} />} onClick={() => { setEditCommittee(viewCommittee); setViewCommittee(null); setShowModal(true); }}>Edit</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <CommitteeModal
            open={showModal}
            onClose={() => { setShowModal(false); setEditCommittee(null); }}
            onSave={handleSave}
            editCommittee={editCommittee}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDeactivate}
        title="Deactivate Committee"
        message={`Are you sure you want to deactivate "${confirmDeactivate?.name}"? This will suspend all associated activities.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmDeactivate(null)}
      />
    </>
  );
}
