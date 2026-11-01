"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Metadata } from "next";

// ── Validation schema ──────────────────────────────

const loginSchema = z.object({
  username: z.string().min(1, "Username is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ═══════════════════════════════════════════════════
//  Admin Login Page
// ═══════════════════════════════════════════════════

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const result = await login(data.username, data.password);
    if (result.success) {
      router.replace("/dashboard");
    } else {
      setServerError(result.error ?? "Login failed.");
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#f0f4fb" }}
    >
      {/* ── Left panel (branding) ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{
          width: "45%",
          background: "linear-gradient(160deg, #0a1628 0%, #142858 50%, #1e3d8a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(35,73,168,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(96,133,212,0.15) 0%, transparent 50%)",
          }}
        />

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "-8%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-10%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* University branding */}
          <div className="flex items-center gap-3 mb-16">
            <div
              className="flex items-center justify-center rounded-xl font-bold text-white"
              style={{
                width: 44,
                height: 44,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: 16,
              }}
            >
              CUI
            </div>
            <div>
              <div className="text-white font-semibold text-sm">COMSATS University</div>
              <div className="text-blue-300 text-xs">Islamabad Campus</div>
            </div>
          </div>

          {/* ProctorLens branding */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex items-center justify-center rounded-2xl font-black text-white text-2xl"
                style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(135deg, #2349a8 0%, #3a5fc0 100%)",
                  boxShadow: "0 8px 32px rgba(35,73,168,0.5)",
                }}
              >
                PL
              </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-3">
              ProctorLens
            </h1>
            <p className="text-blue-200 text-lg font-medium">
              University Disciplinary &amp; Case Management System
            </p>
          </div>

          <div
            className="p-5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p className="text-blue-100 text-sm leading-relaxed">
              Centralised administrative control over student management,
              committee governance, disciplinary oversight, and user access
              management.
            </p>
          </div>
        </div>

        {/* Bottom features */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {[
            { icon: "🎓", label: "Student Management" },
            { icon: "🏛️", label: "Committee Governance" },
            { icon: "🔐", label: "Role-Based Access Control" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 mb-3">
              <span className="text-base">{f.icon}</span>
              <span className="text-sm text-blue-200 font-medium">{f.label}</span>
            </div>
          ))}
          <p className="text-xs text-blue-400 mt-6">
            © 2025 COMSATS University Islamabad. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 440 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="flex items-center justify-center rounded-xl font-bold text-white text-sm"
              style={{ width: 40, height: 40, background: "#1e3d8a" }}
            >
              PL
            </div>
            <div>
              <div className="font-bold text-slate-800">ProctorLens</div>
              <div className="text-xs text-slate-500">Admin Portal</div>
            </div>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 32px rgba(15,32,68,0.1)",
              border: "1px solid #e0e6f0",
            }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 36, height: 36, background: "#eef2fb" }}
                >
                  <Shield size={18} color="#1e3d8a" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Secure Access
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Administrator Login
              </h2>
              <p className="text-sm text-slate-500">
                Sign in to the ProctorLens Admin Portal
              </p>
            </div>

            {/* Error alert */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 rounded-xl mb-6"
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Authentication Failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{serverError}</p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Username */}
              <div>
                <label htmlFor="login-username" className="pl-label pl-label-required">
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    style={{ color: "#9aadc4" }}
                  >
                    <User size={16} />
                  </div>
                  <input
                    id="login-username"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@comsats.edu.pk"
                    className={`pl-input ${errors.username ? "pl-input-error" : ""}`}
                    style={{ paddingLeft: "2.375rem" }}
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="pl-label pl-label-required">
                  Password
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    style={{ color: "#9aadc4" }}
                  >
                    <Lock size={16} />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`pl-input ${errors.password ? "pl-input-error" : ""}`}
                    style={{ paddingLeft: "2.375rem", paddingRight: "2.75rem" }}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
                    style={{ color: "#9aadc4" }}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="pl-checkbox"
                    id="login-remember"
                    {...register("rememberMe")}
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium transition-colors"
                  style={{ color: "#1e3d8a" }}
                  onClick={() =>
                    alert("Contact the system administrator to reset your password.")
                  }
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="login-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 text-white font-semibold rounded-xl transition-all"
                style={{
                  height: "2.875rem",
                  background: isSubmitting
                    ? "#9aadc4"
                    : "linear-gradient(135deg, #1e3d8a 0%, #2349a8 100%)",
                  fontSize: "0.9375rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  border: "none",
                  fontFamily: "inherit",
                  boxShadow: isSubmitting ? "none" : "0 4px 16px rgba(30,61,138,0.3)",
                  transform: "translateY(0)",
                  transition: "all 0.15s ease",
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Authenticating…
                  </>
                ) : (
                  "Sign In to Admin Portal"
                )}
              </button>
            </form>

            {/* Dev hint */}
            <div
              className="mt-6 p-3 rounded-lg"
              style={{ background: "#f0f4fb", border: "1px solid #dce4f0" }}
            >
              <p className="text-xs text-slate-500 text-center">
                <span className="font-semibold text-slate-600">Demo:</span>{" "}
                admin@comsats.edu.pk &nbsp;/&nbsp; Admin@123
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            ProctorLens v1.0 &mdash; COMSATS University Islamabad &nbsp;&bull;&nbsp; Restricted Access
          </p>
        </motion.div>
      </div>
    </div>
  );
}
