"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  ChevronUp,
  ChevronDown,
  X,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
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
import { mockStudents, DEPARTMENTS, SESSIONS } from "@/mock";
import type {
  Student,
  StudentFilters,
  AddStudentFormData,
  StudentStatus,
  Program,
} from "@/types";
import { useSearchParams, useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════
//  Zod Schema for Add/Edit Student
// ═══════════════════════════════════════════════════

const studentSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  registrationNo: z
    .string()
    .min(5, "Registration number is required")
    .regex(/^[A-Z]{2}\d{2}-[A-Z]{2,6}-\d{3}$/, {
      message: "Format: SP22-BCE-001",
    }),
  studentId: z.string().min(3, "Student ID is required"),
  department: z.string().min(1, "Department is required"),
  program: z.enum(["BS", "MS", "PhD", "BE", "MBA"] as const),
  semester: z.number().min(1).max(12),
  session: z.string().min(1, "Academic session is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Phone number is required"),
  status: z.enum(["Active", "Inactive", "Suspended", "Graduated", "Withdrawn"] as const),
});

type StudentFormData = z.infer<typeof studentSchema>;

// ═══════════════════════════════════════════════════
//  Add/Edit Student Modal
// ═══════════════════════════════════════════════════

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: StudentFormData, editId?: string) => void;
  editStudent?: Student | null;
}

function StudentModal({ open, onClose, onSave, editStudent }: StudentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      registrationNo: "",
      studentId: "",
      department: "",
      program: "BS",
      semester: 1,
      session: "Fall 2025",
      email: "",
      phone: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (editStudent) {
      reset({
        name: editStudent.name,
        registrationNo: editStudent.registrationNo,
        studentId: editStudent.studentId,
        department: editStudent.department,
        program: editStudent.program,
        semester: editStudent.semester,
        session: editStudent.session,
        email: editStudent.email,
        phone: editStudent.phone,
        status: editStudent.status,
      });
    } else {
      reset({
        name: "",
        registrationNo: "",
        studentId: "",
        department: "",
        program: "BS",
        semester: 1,
        session: "Fall 2025",
        email: "",
        phone: "",
        status: "Active",
      });
    }
  }, [editStudent, reset, open]);

  const onSubmit = async (data: AddStudentFormData) => {
    await new Promise((r) => setTimeout(r, 600));
    onSave(data, editStudent?.id);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="modal-content"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid #e8edf5" }}
        >
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editStudent ? "Edit Student" : "Add New Student"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {editStudent
                ? "Update student information"
                : "Enroll a new student into the system"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              required
              error={errors.name?.message}
              className="col-span-2"
            >
              <input
                className={cn("pl-input", errors.name && "pl-input-error")}
                placeholder="e.g. Ahmad Raza Khan"
                {...register("name")}
              />
            </FormField>

            <FormField
              label="Registration Number"
              required
              error={errors.registrationNo?.message}
              hint="Format: SP22-BCE-001"
            >
              <input
                className={cn("pl-input", errors.registrationNo && "pl-input-error")}
                placeholder="SP22-BCE-001"
                {...register("registrationNo")}
              />
            </FormField>

            <FormField
              label="Student ID"
              required
              error={errors.studentId?.message}
            >
              <input
                className={cn("pl-input", errors.studentId && "pl-input-error")}
                placeholder="CUI-CS-001"
                {...register("studentId")}
              />
            </FormField>

            <FormField
              label="Department"
              required
              error={errors.department?.message}
            >
              <select className="pl-select w-full" {...register("department")}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Program" required error={errors.program?.message}>
              <select className="pl-select w-full" {...register("program")}>
                {(["BS", "MS", "PhD", "BE", "MBA"] as Program[]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Semester"
              required
              error={errors.semester?.message}
            >
              <select className="pl-select w-full" {...register("semester", { valueAsNumber: true })}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Academic Session"
              required
              error={errors.session?.message}
            >
              <select className="pl-select w-full" {...register("session")}>
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Email Address"
              required
              error={errors.email?.message}
              className="col-span-2"
            >
              <input
                type="email"
                className={cn("pl-input", errors.email && "pl-input-error")}
                placeholder="student@comsats.edu.pk"
                {...register("email")}
              />
            </FormField>

            <FormField
              label="Phone Number"
              required
              error={errors.phone?.message}
            >
              <input
                className={cn("pl-input", errors.phone && "pl-input-error")}
                placeholder="+92-300-1234567"
                {...register("phone")}
              />
            </FormField>

            <FormField label="Status" required error={errors.status?.message}>
              <select className="pl-select w-full" {...register("status")}>
                {(["Active", "Inactive", "Suspended", "Graduated", "Withdrawn"] as StudentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 pt-4"
            style={{ borderTop: "1px solid #e8edf5" }}
          >
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editStudent ? "Save Changes" : "Add Student"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Student Detail Panel
// ═══════════════════════════════════════════════════

function StudentDetailPanel({
  student,
  onClose,
  onEdit,
}: {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
}) {
  const infoRow = (label: string, value: string | number | undefined) =>
    value ? (
      <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid #f0f4fb" }}>
        <span className="text-xs font-semibold text-slate-400 w-32 flex-shrink-0 pt-0.5 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm text-slate-700 font-medium">{value}</span>
      </div>
    ) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.2 }}
        className="modal-content"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-7 pt-6 pb-5"
          style={{ borderBottom: "1px solid #e8edf5" }}
        >
          <div className="flex items-center gap-4">
            <UserAvatar name={student.name} size="lg" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">{student.name}</h2>
              <p className="text-sm text-slate-500">{student.registrationNo}</p>
              <StatusBadge status={student.status} className="mt-2" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-7 py-5 space-y-5 overflow-y-auto" style={{ maxHeight: "calc(80vh - 160px)" }}>
          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Information</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400" />
                {student.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <Phone size={14} className="text-slate-400" />
                {student.phone}
              </div>
              {student.address && (
                <div className="flex items-start gap-2 text-sm text-slate-600 mt-1">
                  <MapPin size={14} className="text-slate-400 mt-0.5" />
                  {student.address}
                </div>
              )}
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Academic Information</h3>
            {infoRow("Student ID", student.studentId)}
            {infoRow("Department", student.department)}
            {infoRow("Program", student.program)}
            {infoRow("Semester", `Semester ${student.semester}`)}
            {infoRow("Session", student.session)}
            {infoRow("CGPA", student.cgpa ? student.cgpa.toFixed(2) : undefined)}
          </div>

          {/* Guardian */}
          {student.guardianName && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Guardian Information</h3>
              {infoRow("Guardian Name", student.guardianName)}
              {infoRow("Guardian Phone", student.guardianPhone)}
            </div>
          )}

          {/* Admin Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Administrative</h3>
            {infoRow("Enrolled At", new Date(student.enrolledAt).toLocaleDateString("en-PK"))}
            {infoRow("Last Updated", new Date(student.updatedAt).toLocaleDateString("en-PK"))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-7 py-4"
          style={{ borderTop: "1px solid #e8edf5" }}
        >
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            leftIcon={<Edit size={14} />}
            onClick={onEdit}
          >
            Edit Student
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Main Students Page
// ═══════════════════════════════════════════════════

type SortField = "name" | "registrationNo" | "department" | "semester" | "status";

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [filters, setFilters] = useState<StudentFilters>({
    search: "",
    status: "",
    department: "",
    program: "",
  });
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [showModal, setShowModal] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<Student | null>(null);

  // Open add modal from URL param
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setShowModal(true);
      router.replace("/students");
    }
  }, [searchParams, router]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    return students
      .filter((s) => {
        const q = filters.search.toLowerCase();
        const matchSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.registrationNo.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q);
        const matchStatus = !filters.status || s.status === filters.status;
        const matchDept = !filters.department || s.department === filters.department;
        const matchProg = !filters.program || s.program === filters.program;
        return matchSearch && matchStatus && matchDept && matchProg;
      })
      .sort((a, b) => {
        let av = a[sortField as keyof Student] ?? "";
        let bv = b[sortField as keyof Student] ?? "";
        if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [students, filters, sortField, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    ) : (
      <ChevronDown size={13} className="opacity-0 group-hover:opacity-40" />
    );

  const handleSave = (data: StudentFormData, editId?: string) => {
    if (editId) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editId ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
        )
      );
      toast.success("Student updated successfully");
    } else {
      const newStudent: Student = {
        ...data,
        id: `s${Date.now()}`,
        enrolledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setStudents((prev) => [newStudent, ...prev]);
      toast.success("Student enrolled successfully");
    }
    setEditStudent(null);
  };

  const handleSuspendConfirm = () => {
    if (!confirmSuspend) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === confirmSuspend.id
          ? { ...s, status: "Suspended" as StudentStatus, updatedAt: new Date().toISOString() }
          : s
      )
    );
    toast.warning(`Student "${confirmSuspend.name}" has been suspended`);
    setConfirmSuspend(null);
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "", department: "", program: "" });
    setPage(1);
  };

  const hasFilters = filters.search || filters.status || filters.department || filters.program;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Page Actions */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Student Management</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} student{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={15} />}
            onClick={() => { setEditStudent(null); setShowModal(true); }}
            id="add-student-btn"
          >
            Add Student
          </Button>
        </div>

        {/* Filters */}
        <div className="pl-card p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="pl-search flex-1 min-w-0" style={{ maxWidth: 340 }}>
              <Search size={15} className="search-icon" />
              <input
                className="pl-input"
                style={{ paddingLeft: "2.375rem" }}
                placeholder="Search students…"
                value={filters.search}
                onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={15} className="text-slate-400" />
              <select
                className="pl-select"
                value={filters.status}
                onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value as StudentStatus | "" })); setPage(1); }}
              >
                <option value="">All Statuses</option>
                {["Active", "Inactive", "Suspended", "Graduated", "Withdrawn"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                className="pl-select"
                value={filters.department}
                onChange={(e) => { setFilters((f) => ({ ...f, department: e.target.value })); setPage(1); }}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                className="pl-select"
                value={filters.program}
                onChange={(e) => { setFilters((f) => ({ ...f, program: e.target.value as Program | "" })); setPage(1); }}
              >
                <option value="">All Programs</option>
                {["BS", "MS", "PhD", "BE", "MBA"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {hasFilters && (
                <Button variant="ghost" size="sm" leftIcon={<X size={13} />} onClick={resetFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <SectionCard noPadding>
          {paginated.length === 0 ? (
            <EmptyState
              icon={<GraduationCap size={40} />}
              title="No students found"
              description="Try adjusting your search filters or add a new student."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setShowModal(true)}
                >
                  Add Student
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>
                        <button className="group flex items-center gap-1" onClick={() => handleSort("name")}>
                          Student <SortIcon field="name" />
                        </button>
                      </th>
                      <th>
                        <button className="group flex items-center gap-1" onClick={() => handleSort("registrationNo")}>
                          Reg. No <SortIcon field="registrationNo" />
                        </button>
                      </th>
                      <th>
                        <button className="group flex items-center gap-1" onClick={() => handleSort("department")}>
                          Department <SortIcon field="department" />
                        </button>
                      </th>
                      <th>Program</th>
                      <th>
                        <button className="group flex items-center gap-1" onClick={() => handleSort("semester")}>
                          Sem <SortIcon field="semester" />
                        </button>
                      </th>
                      <th>Session</th>
                      <th>
                        <button className="group flex items-center gap-1" onClick={() => handleSort("status")}>
                          Status <SortIcon field="status" />
                        </button>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {paginated.map((student, i) => (
                        <motion.tr
                          key={student.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <td>
                            <div className="flex items-center gap-3">
                              <UserAvatar name={student.name} size="sm" />
                              <div>
                                <div className="font-semibold text-slate-800 text-sm">
                                  {student.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {student.studentId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="font-mono text-xs text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                              {student.registrationNo}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm text-slate-600">{student.department}</span>
                          </td>
                          <td>
                            <Badge variant="navy">{student.program}</Badge>
                          </td>
                          <td>
                            <span className="text-sm text-slate-600 font-medium">
                              {student.semester}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs text-slate-500">{student.session}</span>
                          </td>
                          <td>
                            <StatusBadge status={student.status} />
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1.5 rounded hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                                title="View student"
                                onClick={() => setViewStudent(student)}
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                className="p-1.5 rounded hover:bg-blue-50 transition-colors text-slate-500 hover:text-blue-600"
                                title="Edit student"
                                onClick={() => { setEditStudent(student); setShowModal(true); }}
                              >
                                <Edit size={15} />
                              </button>
                              {student.status !== "Suspended" && (
                                <button
                                  className="p-1.5 rounded hover:bg-red-50 transition-colors text-slate-500 hover:text-red-500"
                                  title="Suspend student"
                                  onClick={() => setConfirmSuspend(student)}
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: "1px solid #f0f4fb" }}
              >
                <p className="text-xs text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={filtered.length}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <StudentModal
            open={showModal}
            onClose={() => { setShowModal(false); setEditStudent(null); }}
            onSave={handleSave}
            editStudent={editStudent}
          />
        )}
        {viewStudent && (
          <StudentDetailPanel
            student={viewStudent}
            onClose={() => setViewStudent(null)}
            onEdit={() => {
              setEditStudent(viewStudent);
              setViewStudent(null);
              setShowModal(true);
            }}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmSuspend}
        title="Suspend Student"
        message={`Are you sure you want to suspend ${confirmSuspend?.name}? This will restrict their access to university systems.`}
        confirmLabel="Suspend"
        variant="danger"
        onConfirm={handleSuspendConfirm}
        onCancel={() => setConfirmSuspend(null)}
      />
    </>
  );
}
