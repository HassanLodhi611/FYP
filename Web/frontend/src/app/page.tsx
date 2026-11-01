"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/dashboard" : "/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ background: "#f4f7fb" }}
      aria-label="Loading ProctorLens"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex items-center justify-center rounded-xl font-bold text-lg text-white"
          style={{
            width: 52,
            height: 52,
            background: "#1e3d8a",
            boxShadow: "0 4px 16px rgba(30,61,138,0.3)",
          }}
        >
          PL
        </div>
        <div className="flex gap-1" aria-hidden="true">
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
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>
    </main>
  );
}
