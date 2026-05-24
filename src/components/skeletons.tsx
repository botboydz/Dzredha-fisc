"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Reusable Primitives                                                */
/* ------------------------------------------------------------------ */

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`gov-card gov-card-accent p-5 space-y-3 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-xl skeleton-shimmer" />
        <Skeleton className="h-3 w-28 skeleton-shimmer" />
      </div>
      <Skeleton className="h-8 w-36 skeleton-shimmer" />
      <Skeleton className="h-3 w-24 skeleton-shimmer" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={`gov-card p-6 space-y-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40 skeleton-shimmer" />
        <Skeleton className="h-8 w-24 rounded-md skeleton-shimmer" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md skeleton-shimmer"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8 skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`gov-card overflow-hidden ${className ?? ""}`}>
      <div className="bg-[#0C4A2E] px-5 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 bg-white/20 skeleton-shimmer" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={`flex gap-4 px-5 py-3.5 border-b border-gray-50 ${
            rowIdx % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"
          }`}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-4 flex-1 skeleton-shimmer"
              style={{ width: colIdx === 0 ? "40%" : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function FormSkeleton({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={`gov-card p-6 space-y-5 ${className ?? ""}`}>
      <Skeleton className="h-4 w-48 skeleton-shimmer" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-32 skeleton-shimmer" />
          <Skeleton className="h-10 w-full rounded-xl skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar Skeleton                                                   */
/* ------------------------------------------------------------------ */

export function SidebarSkeleton() {
  return (
    <aside className="sidebar-bg w-64 min-h-screen flex flex-col shrink-0 hidden lg:flex">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <Skeleton className="h-9 w-9 rounded-xl skeleton-shimmer-dark" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-16 skeleton-shimmer-dark" />
          <Skeleton className="h-2 w-10 skeleton-shimmer-dark" />
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-4 w-4 rounded skeleton-shimmer-dark" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-24 skeleton-shimmer-dark" />
              <Skeleton className="h-2 w-16 skeleton-shimmer-dark" />
            </div>
          </div>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full skeleton-shimmer-dark" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-24 skeleton-shimmer-dark" />
            <Skeleton className="h-2 w-16 skeleton-shimmer-dark" />
          </div>
        </div>
        <Skeleton className="h-3 w-32 skeleton-shimmer-dark" />
        <Skeleton className="h-2 w-24 skeleton-shimmer-dark" />
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Skeleton                                                 */
/* ------------------------------------------------------------------ */

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-64 skeleton-shimmer" />
          <Skeleton className="h-3 w-40 skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32 rounded-md skeleton-shimmer" />
          <Skeleton className="h-8 w-24 rounded-md skeleton-shimmer" />
        </div>
      </div>

      {/* 8 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Revenue chart */}
      <ChartSkeleton />

      {/* Tax Obligations table */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-48 skeleton-shimmer" />
        <TableSkeleton rows={5} columns={5} />
      </div>

      {/* Compliance ring + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gov-card p-6 flex items-center justify-center">
          <Skeleton className="h-40 w-40 rounded-full skeleton-shimmer" />
        </div>
        <ChartSkeleton />
      </div>

      {/* Deadlines */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-48 skeleton-shimmer" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="gov-card p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl skeleton-shimmer" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48 skeleton-shimmer" />
              <Skeleton className="h-3 w-32 skeleton-shimmer" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-48 skeleton-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="gov-card p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl skeleton-shimmer" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24 skeleton-shimmer" />
                <Skeleton className="h-3 w-32 skeleton-shimmer" />
              </div>
              <Skeleton className="h-4 w-4 skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Declarations Skeleton                                              */
/* ------------------------------------------------------------------ */

export function DeclarationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48 skeleton-shimmer" />
        <Skeleton className="h-8 w-32 rounded-md skeleton-shimmer" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg skeleton-shimmer" />
        ))}
      </div>

      {/* Existing declarations table */}
      <TableSkeleton rows={3} columns={5} />

      {/* Form steps */}
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <React.Fragment key={i}>
            <Skeleton className="h-8 w-8 rounded-full skeleton-shimmer" />
            {i < 3 && <Skeleton className="h-0.5 flex-1 skeleton-shimmer" />}
          </React.Fragment>
        ))}
      </div>

      <FormSkeleton fields={6} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Documents Skeleton                                                 */
/* ------------------------------------------------------------------ */

export function DocumentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48 skeleton-shimmer" />
        <Skeleton className="h-8 w-24 rounded-md skeleton-shimmer" />
      </div>

      {/* Search + filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl skeleton-shimmer" />
        <Skeleton className="h-10 w-32 rounded-xl skeleton-shimmer" />
        <Skeleton className="h-10 w-32 rounded-xl skeleton-shimmer" />
        <Skeleton className="h-10 w-10 rounded-xl skeleton-shimmer" />
      </div>

      {/* Grid of document cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="doc-frame p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl skeleton-shimmer" />
              <Skeleton className="h-6 w-16 rounded-md skeleton-shimmer" />
            </div>
            <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
            <Skeleton className="h-3 w-1/2 skeleton-shimmer" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20 rounded-md skeleton-shimmer" />
              <Skeleton className="h-8 w-20 rounded-md skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Security Skeleton                                                  */
/* ------------------------------------------------------------------ */

export function SecuritySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 skeleton-shimmer" />

      {/* Security score */}
      <div className="gov-card p-6 flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full skeleton-shimmer" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32 skeleton-shimmer" />
          <Skeleton className="h-2 w-full rounded-full skeleton-shimmer" />
          <Skeleton className="h-3 w-48 skeleton-shimmer" />
        </div>
      </div>

      {/* Session + 2FA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormSkeleton fields={3} />
        <div className="gov-card p-6 space-y-4">
          <Skeleton className="h-4 w-32 skeleton-shimmer" />
          <Skeleton className="h-32 w-32 mx-auto rounded skeleton-shimmer" />
          <Skeleton className="h-8 w-40 rounded-md mx-auto skeleton-shimmer" />
        </div>
      </div>

      {/* Login activity */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-48 skeleton-shimmer" />
        <TableSkeleton rows={5} columns={5} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Admin Skeleton                                                     */
/* ------------------------------------------------------------------ */

export function AdminSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 skeleton-shimmer" />

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg skeleton-shimmer" />
        ))}
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Services Skeleton                                                  */
/* ------------------------------------------------------------------ */

export function ServicesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 skeleton-shimmer" />

      {/* Tax calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormSkeleton fields={3} />
        <div className="space-y-4">
          <div className="gov-card p-6 space-y-3">
            <Skeleton className="h-4 w-48 skeleton-shimmer" />
            <Skeleton className="h-10 w-full rounded-xl skeleton-shimmer" />
          </div>
          <div className="gov-card p-5 space-y-3">
            <Skeleton className="h-4 w-32 skeleton-shimmer" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-16 skeleton-shimmer" />
                <Skeleton className="h-4 w-24 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 skeleton-shimmer" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="gov-card p-4">
            <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notifications Skeleton                                             */
/* ------------------------------------------------------------------ */

export function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 skeleton-shimmer" />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg skeleton-shimmer" />
        ))}
      </div>

      {/* Notification cards */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="gov-card p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl skeleton-shimmer" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
              <Skeleton className="h-3 w-1/2 skeleton-shimmer" />
              <Skeleton className="h-2 w-24 skeleton-shimmer" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-7 rounded-md skeleton-shimmer" />
              <Skeleton className="h-7 w-7 rounded-md skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile Skeleton                                                   */
/* ------------------------------------------------------------------ */

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 skeleton-shimmer" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormSkeleton fields={4} />
        <FormSkeleton fields={8} />
      </div>
    </div>
  );
}
