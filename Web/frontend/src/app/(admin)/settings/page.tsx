"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  User, Lock, Settings as SettingsIcon, Bell,
  Save, Eye, EyeOff, Building2, Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  Button, FormField, SectionCard, Toggle, UserAvatar, Divider, cn,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

// ═══════════════════════════════════════════════════
//  Settings Page
// ═══════════════════════════════════════════════════

// ── Schemas ────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  employeeId: z.string().min(3, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const systemSchema = z.object({
  universityName: z.string().min(2, "University name is required"),
  campusName: z.string().min(2, "Campus name is required"),
  systemName: z.string().min(2, "System name is required"),
  academicSession: z.string().min(1, "Session is required"),
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;
type SystemData = z.infer<typeof systemSchema>;

// ── Tab type ───────────────────────────────────────

type SettingsTab = "profile" | "security" | "system" | "notifications";

const TABS: { key: SettingsTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Lock },
  { key: "system", label: "System", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
];

// ── Profile Section ────────────────────────────────

function ProfileSection() {
  const { user } = useAuth();
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "Syed Abdullah Kazmi",
      email: user?.email ?? "admin@comsats.edu.pk",
      employeeId: user?.employeeId ?? "ADM-001",
      department: user?.department ?? "Administration",
      designation: user?.designation ?? "System Administrator",
    },
  });

  const onSubmit = async (data: ProfileData) => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Profile updated successfully");
    void data;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <UserAvatar name={user?.name ?? "Admin"} size="lg" />
        <div>
          <p className="font-semibold text-slate-700">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-400 mt-1">System Administrator · {user?.employeeId}</p>
        </div>
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Full Name" required error={errors.name?.message} className="md:col-span-2">
          <input className={cn("pl-input", errors.name && "pl-input-error")} {...register("name")} />
        </FormField>
        <FormField label="Email Address" required error={errors.email?.message}>
          <input type="email" className={cn("pl-input", errors.email && "pl-input-error")} {...register("email")} />
        </FormField>
        <FormField label="Employee ID" required error={errors.employeeId?.message}>
          <input className={cn("pl-input", errors.employeeId && "pl-input-error")} {...register("employeeId")} />
        </FormField>
        <FormField label="Department" required error={errors.department?.message}>
          <input className={cn("pl-input", errors.department && "pl-input-error")} {...register("department")} />
        </FormField>
        <FormField label="Designation" required error={errors.designation?.message}>
          <input className={cn("pl-input", errors.designation && "pl-input-error")} {...register("designation")} />
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
          Save Profile
        </Button>
      </div>
    </form>
  );
}

// ── Security Section ────────────────────────────────

function SecuritySection() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordData) => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Password changed successfully. Please log in again.");
    reset();
    void data;
  };

  const PasswordInput = ({
    id, placeholder, show, onToggle, field,
    error,
  }: {
    id: string; placeholder: string; show: boolean;
    onToggle: () => void; field: keyof PasswordData; error?: string;
  }) => (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className={cn("pl-input pr-10", error && "pl-input-error")}
        {...register(field)}
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-1">Change Password</h3>
        <p className="text-sm text-slate-500 mb-5">Update your administrator account password</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <FormField label="Current Password" required error={errors.currentPassword?.message}>
            <PasswordInput
              id="current-password" placeholder="Your current password"
              show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)}
              field="currentPassword" error={errors.currentPassword?.message}
            />
          </FormField>
          <FormField label="New Password" required error={errors.newPassword?.message} hint="Minimum 8 characters">
            <PasswordInput
              id="new-password" placeholder="New password"
              show={showNew} onToggle={() => setShowNew(!showNew)}
              field="newPassword" error={errors.newPassword?.message}
            />
          </FormField>
          <FormField label="Confirm New Password" required error={errors.confirmPassword?.message}>
            <PasswordInput
              id="confirm-password" placeholder="Confirm new password"
              show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
              field="confirmPassword" error={errors.confirmPassword?.message}
            />
          </FormField>
          <Button variant="primary" type="submit" isLoading={isSubmitting} leftIcon={<Lock size={14} />}>
            Change Password
          </Button>
        </form>
      </div>

      <Divider />

      {/* Two-Factor Auth */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-1">Two-Factor Authentication</h3>
        <p className="text-sm text-slate-500 mb-4">Add an extra layer of security to your administrator account</p>
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: twoFactor ? "#f0fdf4" : "#f8faff", border: `1px solid ${twoFactor ? "#bbf7d0" : "#e0e6f0"}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 40, height: 40, background: twoFactor ? "#dcfce7" : "#eef2fb" }}
            >
              <Shield size={18} color={twoFactor ? "#16a34a" : "#1e3d8a"} />
            </div>
            <div>
              <p className="font-medium text-slate-700 text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500">
                {twoFactor ? "Enabled — your account is protected" : "Not enabled — click to configure"}
              </p>
            </div>
          </div>
          <Toggle
            checked={twoFactor}
            onChange={(v) => {
              setTwoFactor(v);
              toast.info(v ? "2FA enabled (demo only)" : "2FA disabled (demo only)");
            }}
            id="two-factor-toggle"
          />
        </div>
      </div>

      <Divider />

      {/* Active Sessions */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-1">Active Sessions</h3>
        <p className="text-sm text-slate-500 mb-4">Manage devices currently signed into your account</p>
        {[
          { device: "Chrome on Windows 11", ip: "192.168.1.101", location: "Islamabad, PK", current: true, time: "Active now" },
          { device: "Firefox on Windows 10", ip: "192.168.1.103", location: "Islamabad, PK", current: false, time: "3 days ago" },
        ].map((session, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-xl mb-3"
            style={{ background: "#f8faff", border: "1px solid #e0e6f0" }}
          >
            <div>
              <p className="font-medium text-slate-700 text-sm">{session.device}</p>
              <p className="text-xs text-slate-400 mt-0.5">{session.ip} · {session.location} · {session.time}</p>
            </div>
            {session.current ? (
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "#dcfce7", color: "#14532d" }}>
                This session
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.success("Session revoked")}
              >
                Revoke
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── System Section ──────────────────────────────────

function SystemSection() {
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<SystemData>({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      universityName: "COMSATS University Islamabad",
      campusName: "Main Campus, Islamabad",
      systemName: "ProctorLens",
      academicSession: "Fall 2025",
    },
  });

  const onSubmit = async (data: SystemData) => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("System settings updated successfully");
    void data;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
      >
        <SettingsIcon size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          These settings configure the system-wide information displayed throughout the ProctorLens portal.
          Changes will take effect immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="University Name" required error={errors.universityName?.message} className="md:col-span-2">
          <input className={cn("pl-input", errors.universityName && "pl-input-error")} {...register("universityName")} />
        </FormField>
        <FormField label="Campus Name" required error={errors.campusName?.message}>
          <input className={cn("pl-input", errors.campusName && "pl-input-error")} {...register("campusName")} />
        </FormField>
        <FormField label="System Name" required error={errors.systemName?.message}>
          <input className={cn("pl-input", errors.systemName && "pl-input-error")} {...register("systemName")} />
        </FormField>
        <FormField
          label="Current Academic Session"
          required
          error={errors.academicSession?.message}
          hint="e.g. Fall 2025, Spring 2026"
        >
          <input className={cn("pl-input", errors.academicSession && "pl-input-error")} {...register("academicSession")} />
        </FormField>
      </div>

      <Divider />

      {/* Portal version info */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-4">Portal Information</h3>
        <div className="space-y-2">
          {[
            ["System Version", "ProctorLens v1.0.0"],
            ["Build", "2025.11.01"],
            ["Environment", "Development (Mock Data)"],
            ["Backend Status", "NestJS Ready (PostgreSQL pending)"],
            ["Frontend", "Next.js 16.4 · App Router · Turbopack"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center py-2" style={{ borderBottom: "1px solid #f0f4fb" }}>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400 w-40 flex-shrink-0">{label}</span>
              <span className="text-sm text-slate-600 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}

// ── Notifications Section ───────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    emailNewStudent: true,
    emailCommitteeExpiry: true,
    emailUserCreated: false,
    emailSystemAlert: true,
    systemNewStudent: true,
    systemCommitteeExpiry: true,
    systemUserCreated: true,
    systemPermissionChange: true,
    systemLoginAlert: true,
    adminNewCommittee: true,
    adminLoginFailed: true,
    adminPermissionChange: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = () => toast.success("Notification preferences saved");

  const Group = ({
    title,
    items,
  }: {
    title: string;
    items: { key: keyof typeof prefs; label: string; description: string }[];
  }) => (
    <div className="mb-6">
      <h3 className="font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3.5 rounded-xl"
            style={{ background: "#f8faff", border: "1px solid #e8edf5" }}
          >
            <div>
              <p className="text-sm font-medium text-slate-700">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
            </div>
            <Toggle
              checked={prefs[item.key]}
              onChange={() => toggle(item.key)}
              id={`notif-${item.key}`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <Group
        title="Email Notifications"
        items={[
          { key: "emailNewStudent", label: "New Student Enrolled", description: "Receive an email when a new student is enrolled" },
          { key: "emailCommitteeExpiry", label: "Committee Term Expiry", description: "Alert when a committee term is approaching expiry" },
          { key: "emailUserCreated", label: "New User Account Created", description: "Email when a new system user account is created" },
          { key: "emailSystemAlert", label: "System Security Alerts", description: "Critical security alerts and failed login attempts" },
        ]}
      />
      <Group
        title="System Notifications"
        items={[
          { key: "systemNewStudent", label: "Student Enrollment", description: "In-app notification for new student enrollments" },
          { key: "systemCommitteeExpiry", label: "Committee Expiry Warning", description: "In-app alert for upcoming committee expirations" },
          { key: "systemUserCreated", label: "User Account Activity", description: "Notifications for user account creation and changes" },
          { key: "systemPermissionChange", label: "Permission Changes", description: "Notify when role permissions are modified" },
          { key: "systemLoginAlert", label: "Failed Login Attempts", description: "Alert for suspicious login activity" },
        ]}
      />
      <Group
        title="Administrative Alerts"
        items={[
          { key: "adminNewCommittee", label: "Committee Status Changes", description: "Alert when committee status is modified" },
          { key: "adminLoginFailed", label: "Multiple Failed Logins", description: "Alert when multiple failed logins are detected" },
          { key: "adminPermissionChange", label: "Role Assignment Changes", description: "Notify when user roles are changed" },
        ]}
      />
      <div className="flex justify-end pt-2">
        <Button variant="primary" leftIcon={<Save size={14} />} onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Main Settings Page
// ═══════════════════════════════════════════════════

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const sectionContent: Record<SettingsTab, React.ReactNode> = {
    profile: <ProfileSection />,
    security: <SecuritySection />,
    system: <SystemSection />,
    notifications: <NotificationsSection />,
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your profile, security, and portal configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="flex-shrink-0" style={{ width: 200 }}>
          <div className="pl-card p-2 sticky top-0">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left mb-1"
                style={{
                  background: activeTab === key ? "#eef2fb" : "transparent",
                  color: activeTab === key ? "#1e3d8a" : "#596578",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderLeft: activeTab === key ? "3px solid #1e3d8a" : "3px solid transparent",
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SectionCard
              title={TABS.find((t) => t.key === activeTab)?.label}
              className="min-h-[500px]"
            >
              {sectionContent[activeTab]}
            </SectionCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
