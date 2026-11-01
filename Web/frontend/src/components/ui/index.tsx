"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── cn helper ──────────────────────────────────────
export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

// ── Badge ──────────────────────────────────────────

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "navy";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "neutral", children, className, dot }: BadgeProps) {
  return (
    <span className={cn("pl-badge", `pl-badge-${variant}`, className)}>
      {dot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background:
              variant === "success"
                ? "#16a34a"
                : variant === "warning"
                ? "#d97706"
                : variant === "danger"
                ? "#dc2626"
                : variant === "info"
                ? "#1d4ed8"
                : "#596578",
          }}
        />
      )}
      {children}
    </span>
  );
}

// ── Status Badge ────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  Active: "success",
  Inactive: "neutral",
  Suspended: "danger",
  Graduated: "info",
  Withdrawn: "warning",
  Pending: "warning",
  Expired: "danger",
  "On Leave": "warning",
  Success: "success",
  Failed: "danger",
  Warning: "warning",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariantMap[status] ?? "neutral";
  return (
    <Badge variant={variant} dot className={className}>
      {status}
    </Badge>
  );
}

// ── Button ──────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = `pl-btn-${variant}`;
  const sizeClass = size === "sm" ? "pl-btn-sm" : size === "lg" ? "pl-btn-lg" : "";

  return (
    <button
      className={cn("pl-btn", variantClass, sizeClass, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin"
            style={{ width: 14, height: 14 }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Loading…
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

// ── Loading Skeleton ────────────────────────────────

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn("skeleton", className)} style={style} />;
}

// ── Empty State ─────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="pl-empty-state">
      {icon && <div className="pl-empty-state-icon">{icon}</div>}
      <p className="font-semibold text-slate-600 mb-1">{title}</p>
      {description && (
        <p className="text-sm text-slate-400 max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

// ── User Avatar ─────────────────────────────────────

interface UserAvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  color?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const avatarColors = [
  "#1e3d8a",
  "#166534",
  "#713f12",
  "#7f1d1d",
  "#1e3a5f",
  "#4a1d96",
  "#134e4a",
  "#7c2d12",
];

function stringToColor(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function UserAvatar({ name, size = "md", className, color }: UserAvatarProps) {
  const sizeMap = {
    xs: { wh: 24, font: 9 },
    sm: { wh: 32, font: 11 },
    md: { wh: 40, font: 14 },
    lg: { wh: 48, font: 18 },
  };
  const { wh, font } = sizeMap[size];
  const bg = color ?? stringToColor(name);

  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0", className)}
      style={{ width: wh, height: wh, fontSize: font, background: bg }}
    >
      {getInitials(name)}
    </span>
  );
}

// ── Form Field ──────────────────────────────────────

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className={cn("pl-label", required && "pl-label-required")}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 font-medium mt-0.5">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

// ── Pagination ──────────────────────────────────────

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        className="pl-pagination-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            className={cn("pl-pagination-btn", p === page && "active")}
            onClick={() => onChange(p as number)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        className="pl-pagination-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}

// ── Divider ─────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <div className={cn("pl-divider", className)} />;
}

// ── Toggle ──────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({ checked, onChange, label, disabled, id }: ToggleProps) {
  return (
    <label className="pl-toggle gap-3" style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="pl-toggle-track">
        <span className="pl-toggle-thumb" />
      </span>
      {label && (
        <span className="text-sm text-slate-700 font-medium">{label}</span>
      )}
    </label>
  );
}

// ── Section Card ────────────────────────────────────

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  noPadding,
}: SectionCardProps) {
  return (
    <div className={cn("pl-card", className)}>
      {(title || actions) && (
        <div
          className="flex items-center justify-between gap-4"
          style={{ padding: "1.125rem 1.5rem", borderBottom: "1px solid #e8edf5" }}
        >
          <div>
            {title && (
              <h3 className="font-semibold text-slate-800 text-[0.9375rem]">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}

// ── Confirmation Dialog ─────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">{title}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant={variant === "danger" ? "danger" : "primary"} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
