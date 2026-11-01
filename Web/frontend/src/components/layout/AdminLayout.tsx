"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

// ═══════════════════════════════════════════════════
//  Admin Portal Layout Shell
// ═══════════════════════════════════════════════════

const PAGE_TITLES: Record<string, { title: string; crumbs?: Array<{ label: string; href?: string }> }> = {
  "/dashboard": { title: "Dashboard" },
  "/students": { title: "Students", crumbs: [{ label: "Students" }] },
  "/committees": { title: "Committees", crumbs: [{ label: "Committees" }] },
  "/committee-members": {
    title: "Committee Members",
    crumbs: [{ label: "Committees", href: "/committees" }, { label: "Members" }],
  },
  "/users": {
    title: "Users & Access",
    crumbs: [{ label: "Users & Access" }],
  },
  "/activity": {
    title: "System Activity",
    crumbs: [{ label: "System Activity" }],
  },
  "/notifications": {
    title: "Notifications",
    crumbs: [{ label: "Notifications" }],
  },
  "/settings": { title: "Settings", crumbs: [{ label: "Settings" }] },
};

function getPageMeta(pathname: string) {
  // Exact match
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match for dynamic routes
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + "/")) return val;
  }
  return { title: "ProctorLens Admin" };
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#f4f7fb" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex items-center justify-center rounded-xl font-bold text-white text-lg"
            style={{ width: 52, height: 52, background: "#1e3d8a", boxShadow: "0 4px 16px rgba(30,61,138,0.3)" }}
          >
            PL
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: "#1e3d8a",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const { title, crumbs } = getPageMeta(pathname);

  return (
    <>
      <div className="flex h-screen overflow-hidden" style={{ background: "#f4f7fb" }}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-full">
          <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 lg:hidden"
                style={{ background: "rgba(10,22,40,0.5)" }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
                style={{ width: 260 }}
              >
                <Sidebar collapsed={false} onCollapse={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header
            title={title}
            breadcrumbs={crumbs}
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "inherit",
            fontSize: "0.875rem",
            borderRadius: "0.5rem",
            border: "1px solid #e0e6f0",
          },
        }}
      />
    </>
  );
}
