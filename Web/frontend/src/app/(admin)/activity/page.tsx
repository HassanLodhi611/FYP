"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, CheckCircle, XCircle, AlertCircle, Activity } from "lucide-react";
import { Button, StatusBadge, SectionCard, Pagination, EmptyState, UserAvatar } from "@/components/ui";
import { mockActivityLogs } from "@/mock";
import type { ActivityLog, ActivityModule, ActivityStatus } from "@/types";

// ═══════════════════════════════════════════════════
//  System Activity Page
// ═══════════════════════════════════════════════════

function LogIcon({ status }: { status: ActivityStatus }) {
  if (status === "Success") return <CheckCircle size={16} color="#16a34a" />;
  if (status === "Failed") return <XCircle size={16} color="#dc2626" />;
  return <AlertCircle size={16} color="#d97706" />;
}

function LogIconBg({ status }: { status: ActivityStatus }) {
  const bg = status === "Success" ? "#dcfce7" : status === "Failed" ? "#fee2e2" : "#fef3c7";
  return (
    <div className="flex-shrink-0 rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: bg }}>
      <LogIcon status={status} />
    </div>
  );
}

const MODULES: ActivityModule[] = [
  "Students", "Committees", "Committee Members", "Users & Access",
  "Authentication", "System", "Settings", "Notifications",
];

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ActivityModule | "">("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    return mockActivityLogs.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q);
      const matchModule = !moduleFilter || log.module === moduleFilter;
      const matchStatus = !statusFilter || log.status === statusFilter;
      const logDate = log.timestamp.split("T")[0];
      const matchFrom = !dateFrom || logDate >= dateFrom;
      const matchTo = !dateTo || logDate <= dateTo;
      return matchSearch && matchModule && matchStatus && matchFrom && matchTo;
    });
  }, [search, moduleFilter, statusFilter, dateFrom, dateTo]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || moduleFilter || statusFilter || dateFrom || dateTo;

  const resetFilters = () => {
    setSearch(""); setModuleFilter(""); setStatusFilter("");
    setDateFrom(""); setDateTo(""); setPage(1);
  };

  // Summary counts
  const successCount = mockActivityLogs.filter((l) => l.status === "Success").length;
  const failCount = mockActivityLogs.filter((l) => l.status === "Failed").length;
  const warnCount = mockActivityLogs.filter((l) => l.status === "Warning").length;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">System Activity Log</h2>
        <p className="text-sm text-slate-500 mt-0.5">Complete audit trail of all administrative actions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Successful Actions", count: successCount, bg: "#f0fdf4", border: "#bbf7d0", color: "#14532d", icon: <CheckCircle size={18} color="#16a34a" /> },
          { label: "Failed Actions", count: failCount, bg: "#fef2f2", border: "#fecaca", color: "#7f1d1d", icon: <XCircle size={18} color="#dc2626" /> },
          { label: "Warnings", count: warnCount, bg: "#fffbeb", border: "#fde68a", color: "#713f12", icon: <AlertCircle size={18} color="#d97706" /> },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: "rgba(255,255,255,0.7)" }}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</div>
              <div className="text-xs font-semibold" style={{ color: s.color, opacity: 0.7 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="pl-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="pl-search" style={{ flex: "1 1 240px", maxWidth: 320 }}>
            <Search size={15} className="search-icon" />
            <input className="pl-input" style={{ paddingLeft: "2.375rem" }} placeholder="Search activity…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="pl-select" value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value as ActivityModule | ""); setPage(1); }}>
            <option value="">All Modules</option>
            {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="pl-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as ActivityStatus | ""); setPage(1); }}>
            <option value="">All Statuses</option>
            {["Success", "Failed", "Warning"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">From</label>
            <input type="date" className="pl-input" style={{ width: 140 }} value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            <label className="text-xs font-medium text-slate-500">To</label>
            <input type="date" className="pl-input" style={{ width: 140 }} value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          </div>
          {hasFilters && <Button variant="ghost" size="sm" leftIcon={<X size={13} />} onClick={resetFilters}>Clear</Button>}
        </div>
      </div>

      {/* Table */}
      <SectionCard noPadding>
        {paginated.length === 0 ? (
          <EmptyState
            icon={<Activity size={40} />}
            title="No activity found"
            description="No log entries match your current filters."
            action={hasFilters ? <Button variant="ghost" size="sm" onClick={resetFilters}>Clear Filters</Button> : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="pl-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Description</th>
                    <th>IP / Device</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log, i) => (
                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}>
                      <td>
                        <div className="text-xs text-slate-600 whitespace-nowrap">
                          <div className="font-medium">{new Date(log.timestamp).toLocaleDateString("en-PK")}</div>
                          <div className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <UserAvatar name={log.userName} size="xs" />
                          <span className="text-sm text-slate-700 font-medium">{log.userName.split(" ").slice(0, 2).join(" ")}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <LogIconBg status={log.status} />
                          <span className="text-sm font-medium text-slate-700">{log.action}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#eef2fb", color: "#1e3d8a" }}>
                          {log.module}
                        </span>
                      </td>
                      <td>
                        <p className="text-xs text-slate-500 max-w-xs line-clamp-2">{log.description}</p>
                      </td>
                      <td>
                        <div className="text-xs text-slate-500">
                          <div className="font-medium">{log.ipAddress}</div>
                          <div className="text-slate-400 truncate max-w-[120px]">{log.device}</div>
                        </div>
                      </td>
                      <td><StatusBadge status={log.status} /></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #f0f4fb" }}>
              <p className="text-xs text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries</p>
              <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
