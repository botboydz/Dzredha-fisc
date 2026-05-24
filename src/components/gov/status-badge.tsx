"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ShieldAlert,
  CircleDot,
  BadgeAlert,
  CircleCheck,
  CircleX,
  CirclePause,
  Flame,
  Timer,
  CalendarClock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Status Types                                                       */
/* ------------------------------------------------------------------ */

type PaymentStatus = "paid" | "pending" | "overdue";
type DeclarationStatus = "draft" | "submitted" | "approved" | "rejected";
type DocumentStatus = "valid" | "expired" | "pending";
type UrgencyLevel = "overdue" | "urgent" | "soon" | "normal";

/* ------------------------------------------------------------------ */
/*  Badge Shell                                                        */
/* ------------------------------------------------------------------ */

function BadgeShell({
  className,
  icon: Icon,
  label,
  labelAr,
}: {
  className: string;
  icon?: React.ElementType;
  label: string;
  labelAr: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label} / {labelAr}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment Badge                                                      */
/* ------------------------------------------------------------------ */

const paymentConfig: Record<
  PaymentStatus,
  { label: string; labelAr: string; icon: React.ElementType; className: string }
> = {
  paid: {
    label: "Payé",
    labelAr: "مدفوع",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "En attente",
    labelAr: "قيد الانتظار",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  overdue: {
    label: "En retard",
    labelAr: "متأخر",
    icon: AlertTriangle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = paymentConfig[status];
  return (
    <BadgeShell
      className={config.className}
      icon={config.icon}
      label={config.label}
      labelAr={config.labelAr}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Declaration Badge                                                  */
/* ------------------------------------------------------------------ */

const declarationConfig: Record<
  DeclarationStatus,
  { label: string; labelAr: string; icon: React.ElementType; className: string }
> = {
  draft: {
    label: "Brouillon",
    labelAr: "مسودة",
    icon: FileText,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  submitted: {
    label: "Soumis",
    labelAr: "مقدم",
    icon: CircleDot,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  approved: {
    label: "Approuvé",
    labelAr: "معتمد",
    icon: ShieldCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejeté",
    labelAr: "مرفوض",
    icon: ShieldAlert,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function DeclarationBadge({ status }: { status: DeclarationStatus }) {
  const config = declarationConfig[status];
  return (
    <BadgeShell
      className={config.className}
      icon={config.icon}
      label={config.label}
      labelAr={config.labelAr}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Document Badge                                                     */
/* ------------------------------------------------------------------ */

const documentConfig: Record<
  DocumentStatus,
  { label: string; labelAr: string; icon: React.ElementType; className: string }
> = {
  valid: {
    label: "Valide",
    labelAr: "صالح",
    icon: CircleCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  expired: {
    label: "Expiré",
    labelAr: "منتهي",
    icon: CircleX,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  pending: {
    label: "En attente",
    labelAr: "قيد الانتظار",
    icon: CirclePause,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export function DocumentBadge({ status }: { status: DocumentStatus }) {
  const config = documentConfig[status];
  return (
    <BadgeShell
      className={config.className}
      icon={config.icon}
      label={config.label}
      labelAr={config.labelAr}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Urgency Badge                                                      */
/* ------------------------------------------------------------------ */

const urgencyConfig: Record<
  UrgencyLevel,
  { label: string; labelAr: string; icon: React.ElementType; className: string }
> = {
  overdue: {
    label: "En retard",
    labelAr: "متأخر",
    icon: Flame,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  urgent: {
    label: "Urgent",
    labelAr: "عاجل",
    icon: BadgeAlert,
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  soon: {
    label: "Bientôt",
    labelAr: "قريباً",
    icon: Timer,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  normal: {
    label: "Normal",
    labelAr: "عادي",
    icon: CalendarClock,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export function UrgencyBadge({ status }: { status: UrgencyLevel }) {
  const config = urgencyConfig[status];
  return (
    <BadgeShell
      className={config.className}
      icon={config.icon}
      label={config.label}
      labelAr={config.labelAr}
    />
  );
}
