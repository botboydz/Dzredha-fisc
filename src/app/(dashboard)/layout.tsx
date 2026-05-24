"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Shield,
  Calculator,
  Bell,
  Settings,
  Landmark,
  Search,
  LogOut,
  User,
  Menu,
  Globe,
  ChevronDown,
  Cog,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { SidebarSkeleton } from "@/components/skeletons";

/* ------------------------------------------------------------------ */
/*  Navigation Items                                                   */
/* ------------------------------------------------------------------ */

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    labelAr: "لوحة القيادة",
    icon: LayoutDashboard,
  },
  {
    href: "/declarations",
    label: "Déclarations",
    labelAr: "التصريحات",
    icon: FileText,
  },
  {
    href: "/documents",
    label: "Documents",
    labelAr: "الوثائق",
    icon: FolderOpen,
  },
  {
    href: "/security",
    label: "Sécurité",
    labelAr: "الأمان",
    icon: Shield,
  },
  {
    href: "/services",
    label: "Services",
    labelAr: "الخدمات",
    icon: Calculator,
  },
  {
    href: "/notifications",
    label: "Notifications",
    labelAr: "الإشعارات",
    icon: Bell,
    badge: 3,
  },
  {
    href: "/admin",
    label: "Admin",
    labelAr: "الإدارة",
    icon: Settings,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getUserInitials(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

/* ------------------------------------------------------------------ */
/*  Sidebar Component                                                  */
/* ------------------------------------------------------------------ */

function SidebarContent({
  activePath,
  onClose,
}: {
  activePath: string;
  onClose?: () => void;
}) {
  const { isAuthenticated, profile, logout } = useAuth();
  const userName = profile?.full_name;

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
          <Landmark className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-white tracking-tight">DZ-Fisc</span>
          <p className="text-[9px] text-emerald-300/60 font-medium">
            DGI — الجمهورية الجزائرية
          </p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`sidebar-item ${isActive ? "active" : ""} w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                  isActive
                    ? "text-white bg-white/10 border-r-[3px] border-[#B8860B]"
                    : "text-emerald-200/60 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="font-medium text-[13px]">{item.label}</span>
                  <span className="text-[9px] opacity-50">{item.labelAr}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0">
        {isAuthenticated && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {getUserInitials(userName, undefined)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white font-medium truncate">
                {userName || "Utilisateur"}
              </p>
              <p className="text-[9px] text-emerald-300/50">Connecté / متصل</p>
            </div>
            <button
              onClick={() => {
                logout();
                onClose?.();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-emerald-300/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Déconnexion / تسجيل الخروج"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-emerald-300/70">Synchronisé avec la DGI</span>
        </div>
        <p className="text-[9px] text-emerald-400/30">v2.0 — DZ-Fisc Plateforme Gouvernementale</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Layout                                                   */
/* ------------------------------------------------------------------ */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<"fr" | "ar">("fr");

  const userName = profile?.full_name;
  const unreadNotifications = 3;

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <SidebarSkeleton />
        <main className="flex-1 p-6 bg-[#FAFAF8]">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-48 skeleton-shimmer rounded" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 skeleton-shimmer rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ====== Desktop Sidebar ====== */}
      <aside className="sidebar-bg w-64 min-h-screen flex flex-col shrink-0 hidden lg:flex">
        <SidebarContent activePath={pathname} />
      </aside>

      {/* ====== Main Area ====== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Government Header Bar */}
        <header className="gov-header-bar sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left side */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-white hover:bg-white/10 cursor-pointer"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu de navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sidebar-bg w-64 p-0 border-0">
                  <SheetTitle className="sr-only">Navigation DZ-Fisc</SheetTitle>
                  <SidebarContent
                    activePath={pathname}
                    onClose={() => setMobileOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              <div className="hidden sm:flex items-center gap-2">
                <Landmark className="h-4 w-4 text-emerald-300" />
                <span className="text-sm font-bold text-white">DZ-Fisc</span>
                <span className="text-[10px] text-emerald-300/60 hidden md:inline">
                  DGI — Direction Générale des Impôts
                </span>
              </div>
            </div>

            {/* Center: Search (decorative) */}
            <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-300/50" />
                <Input
                  placeholder="Rechercher déclarations, impôts, documents..."
                  className="pl-9 h-8 bg-white/10 border-white/10 text-white placeholder:text-emerald-300/40 text-xs rounded-lg focus:bg-white/15 focus:border-emerald-400/50"
                  readOnly
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-200/70 hover:text-white hover:bg-white/10 text-[10px] gap-1 cursor-pointer h-8 px-2"
                onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
              >
                <Globe className="h-3 w-3" />
                <span>{lang === "fr" ? "FR" : "عربي"}</span>
              </Button>

              {/* Notifications Bell */}
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-emerald-200/70 hover:text-white hover:bg-white/10 cursor-pointer h-8 w-8"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white px-0.5">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-emerald-200/70 hover:text-white hover:bg-white/10 cursor-pointer h-8 px-2"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                      {getUserInitials(userName, undefined)}
                    </div>
                    <span className="hidden sm:inline text-xs font-medium">
                      {userName || "Utilisateur"}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profil / الملف الشخصي</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/security" className="flex items-center gap-2">
                      <Cog className="h-4 w-4" />
                      <span>Paramètres / الإعدادات</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/security" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Sécurité / الأمان</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
                    className="cursor-pointer"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{lang === "fr" ? "العربية" : "Français"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion / تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 bg-[#FAFAF8] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
