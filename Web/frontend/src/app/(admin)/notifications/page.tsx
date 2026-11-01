"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, AlertCircle, CheckCircle, XCircle, Info, Activity, X } from "lucide-react";
import { toast } from "sonner";
import { Button, SectionCard, EmptyState } from "@/components/ui";
import { mockNotifications } from "@/mock";
import type { Notification, NotificationType } from "@/types";

// ═══════════════════════════════════════════════════
//  Notifications Page
// ═══════════════════════════════════════════════════

const notifConfig: Record<NotificationType, { bg: string; color: string; border: string; Icon: React.ComponentType<{ size?: number; color?: string }> }> = {
  warning: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", Icon: AlertCircle },
  error: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", Icon: XCircle },
  success: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", Icon: CheckCircle },
  info: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", Icon: Info },
  system: { bg: "#f8faff", color: "#596578", border: "#d0d8e4", Icon: Activity },
};

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [filterType, setFilterType] = useState<NotificationType | "">("");

  const filtered = notifications.filter((n) => {
    const matchRead = filterRead === "all" ? true : filterRead === "unread" ? !n.isRead : n.isRead;
    const matchType = !filterType || n.type === filterType;
    return matchRead && matchType;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  };
  const remove = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" leftIcon={<CheckCheck size={14} />} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="pl-card p-4 flex items-center gap-3 flex-wrap">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterRead(f)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              background: filterRead === f ? "#1e3d8a" : "#eef2fb",
              color: filterRead === f ? "#ffffff" : "#596578",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {f}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
        <div className="w-px h-5 bg-slate-200" />
        <select
          className="pl-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as NotificationType | "")}
        >
          <option value="">All Types</option>
          {(["info", "warning", "success", "error", "system"] as NotificationType[]).map((t) => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>
      </div>

      {/* Notifications list */}
      <SectionCard noPadding>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={40} />}
            title="No notifications"
            description={filterRead === "unread" ? "You have no unread notifications." : "No notifications match your filters."}
          />
        ) : (
          <AnimatePresence>
            {filtered.map((notif, i) => {
              const config = notifConfig[notif.type];
              const { Icon } = config;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 px-6 py-5 relative"
                  style={{
                    borderBottom: "1px solid #f0f4fb",
                    background: notif.isRead ? "transparent" : "#fafbff",
                  }}
                >
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r"
                      style={{ background: "#1e3d8a" }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{ width: 44, height: 44, background: config.bg, border: `1px solid ${config.border}` }}
                  >
                    <Icon size={20} color={config.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-${notif.isRead ? "medium" : "semibold"} text-slate-${notif.isRead ? "600" : "800"} leading-snug`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => markRead(notif.id)}
                            className="p-1.5 rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                            title="Mark as read"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => remove(notif.id)}
                          className="p-1.5 rounded hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
                          title="Delete"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
                      >
                        {notif.type}
                      </span>
                      {notif.module && (
                        <span className="text-xs font-medium text-slate-400">{notif.module}</span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">{relativeTime(notif.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </SectionCard>
    </div>
  );
}
