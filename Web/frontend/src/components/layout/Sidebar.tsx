"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Shield,
  UserCog,
  Activity,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/ui";
import { cn } from "@/components/ui";

// ═══════════════════════════════════════════════════
//  ProctorLens Sidebar Component
// ═══════════════════════════════════════════════════

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  badge?: number;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Academic Management",
    items: [
      { label: "Students", href: "/students", icon: GraduationCap },
      { label: "Committees", href: "/committees", icon: Shield },
      { label: "Committee Members", href: "/committee-members", icon: Users },
    ],
  },
  {
    section: "Administration",
    items: [
      { label: "Users & Access", href: "/users", icon: UserCog },
      { label: "System Activity", href: "/activity", icon: Activity },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col h-full overflow-hidden flex-shrink-0"
      style={{ background: "#0f2044", position: "relative" }}
    >
      {/* ── Logo / Wordmark ── */}
      <div
        className="flex items-center px-4 flex-shrink-0"
        style={{ height: 64, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo mark */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-white text-sm"
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #2349a8 0%, #3a5fc0 100%)",
              boxShadow: "0 2px 8px rgba(35,73,168,0.5)",
            }}
          >
            PL
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="font-bold text-white text-base tracking-tight leading-none">
                  ProctorLens
                </div>
                <div className="text-[10px] text-blue-300 font-medium tracking-wider uppercase mt-0.5 leading-none">
                  Admin Portal
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => onCollapse(!collapsed)}
        className="absolute -right-3 top-[44px] z-10 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        style={{ width: 22, height: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-slate-600" />
        ) : (
          <ChevronLeft size={12} className="text-slate-600" />
        )}
      </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3">
        {navGroups.map((group) => (
          <div key={group.section}>
            {/* Section label */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="section-header"
                  style={{ marginTop: "1rem" }}
                >
                  {group.section}
                </motion.div>
              )}
            </AnimatePresence>
            {collapsed && <div style={{ marginTop: "0.875rem" }} />}

            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("sidebar-nav-item relative", active && "active")}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.75}
                    className="flex-shrink-0"
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge && !collapsed ? (
                    <span
                      className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#dc2626", color: "#fff", fontSize: 10 }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Profile / User Area ── */}
      <div
        className="flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/10 transition-colors"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <UserAvatar name={user?.name ?? "Admin"} size="sm" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden text-left"
              >
                <div className="text-sm font-semibold text-white leading-none truncate">
                  {user?.name?.split(" ").slice(0, 2).join(" ")}
                </div>
                <div className="text-[11px] text-blue-300 mt-0.5 truncate">
                  {user?.designation ?? "Administrator"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <ChevronDown
              size={14}
              className="text-blue-300 flex-shrink-0"
              style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
            />
          )}
        </button>

        {/* Profile dropdown */}
        <AnimatePresence>
          {profileOpen && !collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}
            >
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
