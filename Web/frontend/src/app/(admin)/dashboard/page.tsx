"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Shield,
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  mockDashboardStats,
  mockDepartmentData,
  mockCommitteeChartData,
  mockActivityChartData,
  mockRecentActivity,
  mockNotifications,
} from "@/mock";
import { StatusBadge, UserAvatar, SectionCard } from "@/components/ui";

// ═══════════════════════════════════════════════════
//  Dashboard Page
// ═══════════════════════════════════════════════════

// ── Stat Card ──────────────────────────────────────

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconBg: string;
  iconColor: string;
  change?: number;
  subtitle?: string;
  href?: string;
  delay?: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  change,
  subtitle,
  href,
  delay = 0,
}: StatCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 48, height: 48, background: iconBg }}
        >
          <Icon size={22} color={iconColor} />
        </div>
        {change !== undefined && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
            style={{
              background: change >= 0 ? "#dcfce7" : "#fee2e2",
              color: change >= 0 ? "#14532d" : "#7f1d1d",
            }}
          >
            {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800 tracking-tight mb-0.5">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="text-sm font-semibold text-slate-600 mb-0.5">{title}</div>
        {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
      </div>
      {href && (
        <div
          className="flex items-center gap-1 text-xs font-medium mt-4 transition-colors"
          style={{ color: "#1e3d8a" }}
        >
          View details
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// ── Activity Icon ──────────────────────────────────

function ActivityIcon({ status }: { status: string }) {
  if (status === "Success")
    return (
      <div
        className="flex-shrink-0 rounded-full flex items-center justify-center"
        style={{ width: 32, height: 32, background: "#dcfce7" }}
      >
        <CheckCircle size={16} color="#16a34a" />
      </div>
    );
  if (status === "Failed")
    return (
      <div
        className="flex-shrink-0 rounded-full flex items-center justify-center"
        style={{ width: 32, height: 32, background: "#fee2e2" }}
      >
        <XCircle size={16} color="#dc2626" />
      </div>
    );
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center"
      style={{ width: 32, height: 32, background: "#fef3c7" }}
    >
      <AlertCircle size={16} color="#d97706" />
    </div>
  );
}

// ── Relative time ──────────────────────────────────

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ── Notification type icon ──────────────────────────

function NotifIcon({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string; Icon: React.ComponentType<{ size?: number; color?: string }> }> = {
    warning: { bg: "#fef3c7", color: "#d97706", Icon: AlertCircle },
    error: { bg: "#fee2e2", color: "#dc2626", Icon: XCircle },
    success: { bg: "#dcfce7", color: "#16a34a", Icon: CheckCircle },
    info: { bg: "#dbeafe", color: "#1d4ed8", Icon: Info },
    system: { bg: "#e8edf5", color: "#596578", Icon: Activity },
  };
  const { bg, color, Icon } = map[type] ?? map.info;
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center"
      style={{ width: 32, height: 32, background: bg }}
    >
      <Icon size={16} color={color} />
    </div>
  );
}

// ── Custom tooltip ─────────────────────────────────

function ChartTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!(active as boolean) || !(payload as unknown[])?.length) return null;
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "#ffffff",
        border: "1px solid #e0e6f0",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontSize: "0.8rem",
      }}
    >
      <p className="font-semibold text-slate-700 mb-2">{label as string}</p>
      {(payload as Array<{ name: string; value: number; color: string }>).map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Main Dashboard Component
// ═══════════════════════════════════════════════════

function fadeUpProps(i: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.07, ease: "easeOut" as const },
  };
}

export default function DashboardPage() {
  const stats = mockDashboardStats;
  const unreadNotifs = mockNotifications.filter((n) => !n.isRead).slice(0, 4);

  return (
    <div className="p-6 space-y-6">
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f2044 0%, #1e3d8a 60%, #2349a8 100%)",
          padding: "1.75rem 2rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-2%",
            top: "-20%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "8%",
            bottom: "-30%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              Welcome back, Administrator
            </p>
            <h2 className="text-2xl font-bold text-white mb-1">
              ProctorLens Admin Portal
            </h2>
            <p className="text-blue-300 text-sm">
              COMSATS University Islamabad &nbsp;·&nbsp; Fall 2025 &nbsp;·&nbsp;{" "}
              {new Date().toLocaleDateString("en-PK", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div className="text-2xl font-black text-white">
                {unreadNotifs.length}
              </div>
              <div className="text-xs text-blue-200 mt-0.5">Pending Alerts</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          iconBg="#eef2fb"
          iconColor="#1e3d8a"
          change={stats.studentChange}
          subtitle="Enrolled this session"
          href="/students"
          delay={0.05}
        />
        <StatCard
          title="Committees"
          value={stats.totalCommittees}
          icon={Shield}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          change={stats.committeeChange}
          subtitle="7 active, 1 pending"
          href="/committees"
          delay={0.1}
        />
        <StatCard
          title="Committee Heads"
          value={stats.committeeHeads}
          icon={UserCheck}
          iconBg="#fef3c7"
          iconColor="#d97706"
          subtitle="All positions filled"
          href="/committee-members"
          delay={0.15}
        />
        <StatCard
          title="Committee Members"
          value={stats.committeeMembers}
          icon={Users}
          iconBg="#ede9fe"
          iconColor="#7c3aed"
          subtitle="Across all committees"
          href="/committee-members"
          delay={0.2}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          iconBg="#ecfdf5"
          iconColor="#059669"
          subtitle="System accounts"
          href="/users"
          delay={0.25}
        />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Student by Department Bar Chart */}
        <motion.div
          {...fadeUpProps(2)}
          className="xl:col-span-2"
        >
          <SectionCard
            title="Student Enrollment by Department"
            description="Current academic session distribution"
            noPadding
          >
            <div className="px-6 pb-6">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={mockDepartmentData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4fb" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 11, fill: "#9aadc4" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9aadc4" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="students"
                    name="Students"
                    fill="#1e3d8a"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </motion.div>

        {/* Committee Status Pie Chart */}
        <motion.div {...fadeUpProps(3)}>
          <SectionCard
            title="Committee Status"
            description="Current committee breakdown"
            noPadding
          >
            <div className="px-6 pb-6">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={mockCommitteeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mockCommitteeChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {mockCommitteeChartData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="rounded-sm flex-shrink-0"
                      style={{ width: 10, height: 10, background: d.color }}
                    />
                    <span className="text-xs text-slate-500">
                      {d.name}
                      <span className="font-semibold text-slate-700 ml-1">
                        ({d.value})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {/* ── User Activity Chart ── */}
      <motion.div {...fadeUpProps(4)}>
        <SectionCard
          title="Administrative Activity"
          description="System actions and logins over the past 8 days"
          noPadding
        >
          <div className="px-6 pb-6">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={mockActivityChartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="actionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3d8a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1e3d8a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="loginsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4fb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9aadc4" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9aadc4" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }}
                />
                <Area
                  type="monotone"
                  dataKey="actions"
                  name="Actions"
                  stroke="#1e3d8a"
                  strokeWidth={2}
                  fill="url(#actionsGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="logins"
                  name="Logins"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#loginsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Bottom Grid: Recent Activity + Notifications ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 pb-6">
        {/* Recent Activity */}
        <motion.div
          {...fadeUpProps(5)}
          className="xl:col-span-3"
        >
          <SectionCard
            title="Recent Administrative Activity"
            description="Latest system actions and events"
            noPadding
            actions={
              <Link
                href="/activity"
                className="text-sm font-medium flex items-center gap-1 transition-colors"
                style={{ color: "#1e3d8a" }}
              >
                View all <ArrowRight size={13} />
              </Link>
            }
          >
            <div>
              {mockRecentActivity.map((log, i) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 px-6 py-4"
                  style={{
                    borderBottom:
                      i < mockRecentActivity.length - 1 ? "1px solid #f0f4fb" : "none",
                  }}
                >
                  <ActivityIcon status={log.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-700 truncate">
                        {log.action}
                      </span>
                      <StatusBadge status={log.status} className="flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 leading-snug truncate">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ background: "#eef2fb", color: "#1e3d8a" }}
                      >
                        {log.module}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        {relativeTime(log.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>

        {/* Notifications Panel */}
        <motion.div
          {...fadeUpProps(6)}
          className="xl:col-span-2 flex flex-col gap-5"
        >
          {/* Notifications */}
          <SectionCard
            title="Recent Notifications"
            noPadding
            actions={
              <Link
                href="/notifications"
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: "#1e3d8a" }}
              >
                View all <ArrowRight size={13} />
              </Link>
            }
          >
            <div>
              {unreadNotifs.map((n, i) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-5 py-3.5"
                  style={{
                    borderBottom:
                      i < unreadNotifs.length - 1 ? "1px solid #f0f4fb" : "none",
                    background: n.isRead ? "transparent" : "#f8faff",
                  }}
                >
                  <NotifIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-700 leading-snug">
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ background: "#1e3d8a" }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {relativeTime(n.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions" noPadding>
            <div className="grid grid-cols-2 gap-3 p-4">
              {[
                { label: "Add Student", href: "/students?action=add", color: "#1e3d8a", bg: "#eef2fb", emoji: "🎓" },
                { label: "Create Committee", href: "/committees?action=create", color: "#16a34a", bg: "#f0fdf4", emoji: "🏛️" },
                { label: "Add Member", href: "/committee-members?action=add", color: "#7c3aed", bg: "#ede9fe", emoji: "👤" },
                { label: "Create User", href: "/users?action=create", color: "#d97706", bg: "#fef3c7", emoji: "🔑" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: action.bg,
                    border: `1px solid ${action.color}20`,
                    textDecoration: "none",
                  }}
                >
                  <span className="text-xl">{action.emoji}</span>
                  <span
                    className="text-xs font-semibold text-center leading-tight"
                    style={{ color: action.color }}
                  >
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </div>
    </div>
  );
}
