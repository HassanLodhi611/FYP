// ═══════════════════════════════════════════════════
//  ProctorLens — Shared TypeScript Types
// ═══════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  role: "Administrator";
  avatar?: string;
  lastLogin: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean;
}

// ── Student ───────────────────────────────────────

export type StudentStatus = "Active" | "Inactive" | "Suspended" | "Graduated" | "Withdrawn";
export type Program = "BS" | "MS" | "PhD" | "BE" | "MBA";

export interface Student {
  id: string;
  studentId: string;
  registrationNo: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  program: Program;
  semester: number;
  session: string;
  status: StudentStatus;
  enrolledAt: string;
  updatedAt: string;
  cgpa?: number;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
}

// ── Committee ─────────────────────────────────────

export type CommitteeStatus = "Active" | "Inactive" | "Pending" | "Expired";

export interface Committee {
  id: string;
  committeeId: string;
  name: string;
  description: string;
  headId: string | null;
  headName: string | null;
  memberCount: number;
  status: CommitteeStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// ── Committee Member ──────────────────────────────

export type MemberRole = "Committee Head" | "Committee Member" | "Secretary" | "Co-ordinator";
export type MemberStatus = "Active" | "Inactive" | "On Leave";

export interface CommitteeMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: MemberRole;
  committeeId: string | null;
  committeeName: string | null;
  status: MemberStatus;
  joinedAt: string;
  avatar?: string;
}

// ── User & Access ─────────────────────────────────

export type UserRole = "Administrator" | "Committee Head" | "Committee Member" | "Teacher";
export type UserStatus = "Active" | "Inactive" | "Suspended" | "Pending";

export interface SystemUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

// ── Permissions ───────────────────────────────────

export interface Permission {
  key: string;
  label: string;
  description: string;
  module: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

// ── System Activity ───────────────────────────────

export type ActivityStatus = "Success" | "Failed" | "Warning";
export type ActivityModule =
  | "Students"
  | "Committees"
  | "Committee Members"
  | "Users & Access"
  | "Authentication"
  | "System"
  | "Settings"
  | "Notifications";

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: ActivityModule;
  description: string;
  ipAddress: string;
  device: string;
  status: ActivityStatus;
}

// ── Notification ──────────────────────────────────

export type NotificationType = "info" | "warning" | "success" | "error" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  module?: string;
  actionUrl?: string;
}

// ── Dashboard Stats ───────────────────────────────

export interface DashboardStats {
  totalStudents: number;
  totalCommittees: number;
  committeeHeads: number;
  committeeMembers: number;
  activeUsers: number;
  studentChange: number;
  committeeChange: number;
}

export interface DepartmentData {
  department: string;
  shortName: string;
  students: number;
}

export interface CommitteeChartData {
  name: string;
  value: number;
  color: string;
}

export interface ActivityChartData {
  date: string;
  actions: number;
  logins: number;
}

// ── Pagination ────────────────────────────────────

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// ── Filter State ──────────────────────────────────

export interface StudentFilters {
  search: string;
  status: StudentStatus | "";
  department: string;
  program: Program | "";
}

export interface UserFilters {
  search: string;
  role: UserRole | "";
  status: UserStatus | "";
  department: string;
}

export interface ActivityFilters {
  search: string;
  module: ActivityModule | "";
  status: ActivityStatus | "";
  dateFrom: string;
  dateTo: string;
}

// ── Form Schemas (used by React Hook Form + Zod) ──

export interface AddStudentFormData {
  name: string;
  registrationNo: string;
  studentId: string;
  department: string;
  program: Program;
  semester: number;
  session: string;
  email: string;
  phone: string;
  status: StudentStatus;
}

export interface CreateCommitteeFormData {
  name: string;
  description: string;
  headId: string;
  startDate: string;
  endDate: string;
  status: CommitteeStatus;
}

export interface CreateUserFormData {
  name: string;
  employeeId: string;
  email: string;
  department: string;
  designation: string;
  role: UserRole;
  status: UserStatus;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
