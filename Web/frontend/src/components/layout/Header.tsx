"use client";

import Link from "next/link";
import { Menu, Bell, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/ui";
import { mockNotifications } from "@/mock";

// ═══════════════════════════════════════════════════
//  ProctorLens Header Component
// ═══════════════════════════════════════════════════

interface Crumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  breadcrumbs?: Crumb[];
  onMenuClick: () => void;
}

export function Header({ title, breadcrumbs, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <header
      className="flex-shrink-0 flex items-center gap-4 px-6"
      style={{
        height: 64,
        background: "#ffffff",
        borderBottom: "1px solid #e0e6f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Title + breadcrumbs */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-0.5">
            <span className="text-xs text-slate-400 font-medium">Admin</span>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight size={12} className="text-slate-300" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-xs text-slate-400 hover:text-navy-600 transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-lg font-bold text-slate-800 leading-none truncate">
          {title}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 flex items-center justify-center rounded-full bg-red-500 text-white font-bold"
              style={{ width: 16, height: 16, fontSize: 9 }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Profile */}
        <div className="flex items-center gap-2.5">
          <UserAvatar name={user?.name ?? "Admin"} size="sm" />
          <div className="hidden md:block text-right leading-none">
            <div className="text-sm font-semibold text-slate-800 leading-none">
              {user?.name?.split(" ").slice(0, 2).join(" ")}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {user?.employeeId}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
