"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Lock,
  Database,
  HelpCircle,
  Heart,
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
import { FullPageSkeleton } from "@/components/skeletons";

/* ------------------------------------------------------------------ */
/*  Navigation Items — Grouped by section                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  href: string;
  label: string;
  labelAr: string;
  icon: React.ElementType;
  badge?: number;
  section?: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", labelAr: "لوحة القيادة", icon: LayoutDashboard, section: "Principal" },
  { href: "/declarations", label: "Déclarations", labelAr: "التصريحات", icon: FileText, section: "Principal" },
  { href: "/documents", label: "Documents", labelAr: "الوثائق", icon: FolderOpen, section: "Principal" },
  { href: "/security", label: "Sécurité", labelAr: "الأمان", icon: Shield, section: "Outils" },
  { href: "/services", label: "Services", labelAr: "الخدمات", icon: Calculator, section: "Outils" },
  { href: "/notifications", label: "Notifications", labelAr: "الإشعارات", icon: Bell, badge: 3, section: "Outils" },
  { href: "/admin", label: "Admin", labelAr: "الإدارة", icon: Settings, section: "Système" },
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

function getGreeting(): { fr: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { fr: "Bonjour", emoji: "☀️" };
  if (hour < 18) return { fr: "Bon après-midi", emoji: "👋" };
  return { fr: "Bonsoir", emoji: "🌙" };
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

  // Group items by section
  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || "Principal";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const sectionLabels: Record<string, { fr: string; ar: string }> = {
    Principal: { fr: "Principal", ar: "الرئيسي" },
    Outils: { fr: "Outils", ar: "الأدوات" },
    Système: { fr: "Système", ar: "النظام" },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Image src="/logo.png" alt="DZ-Fisc" width={32} height={32} className="rounded-lg" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">DZ-Fisc</span>
            <p className="text-[9px] text-emerald-300/60 font-medium">
              DGI — الجمهورية الجزائرية
            </p>
          </div>
        </div>
        {/* Gold decorative line */}
        <div className="mt-3 h-[2px] bg-gradient-to-r from-transparent via-[#B8860B]/60 to-transparent" />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-4">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <div className="px-3 mb-1.5">
                <span className="text-[9px] font-bold text-emerald-400/40 uppercase tracking-[0.15em]">
                  {sectionLabels[section]?.fr}{" "}
                  <span className="text-emerald-400/25">/ {sectionLabels[section]?.ar}</span>
                </span>
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = activePath === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      className={`sidebar-item ${isActive ? "active" : ""} w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm cursor-pointer ${
                        isActive
                          ? "text-white"
                          : "text-emerald-200/60 hover:text-white"
                      }`}
                    >
                      <item.icon className={`sidebar-item-icon h-4 w-4 shrink-0 transition-transform ${isActive ? "text-[#B8860B]" : ""}`} />
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
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0">
        {isAuthenticated && (
          <div className="flex items-center gap-2.5 mb-3 p-2 rounded-lg bg-white/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white ring-2 ring-white/20">
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
              className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-300/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Déconnexion / تسجيل الخروج"
              aria-label="Déconnexion"
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
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-emerald-400/30">v2.0 — DZ-Fisc</p>
          <Link
            href="/services"
            className="flex items-center gap-1 text-[9px] text-emerald-400/40 hover:text-emerald-300/70 transition-colors"
            onClick={handleNavClick}
          >
            <HelpCircle className="h-3 w-3" />
            Aide
          </Link>
        </div>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);

  const userName = profile?.full_name;
  const unreadNotifications = 3;

  // Track scroll for header effect
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    const handleScroll = () => {
      setScrolled(mainContent.scrollTop > 10);
    };

    mainContent.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainContent.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate bell on mount
  useEffect(() => {
    if (unreadNotifications > 0) {
      const timer = setTimeout(() => setBellAnimating(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadNotifications]);

  // Greeting
  const { fr: greeting } = getGreeting();

  if (loading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Aller au contenu principal / الانتقال إلى المحتوى الرئيسي
      </a>

      {/* ====== Desktop Sidebar ====== */}
      <aside className="sidebar-bg w-64 min-h-screen flex flex-col shrink-0 hidden lg:flex" role="navigation" aria-label="Navigation principale">
        <SidebarContent activePath={pathname} />
      </aside>

      {/* ====== Main Area ====== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Government Header Bar */}
        <header
          className={`gov-header-bar sticky top-0 z-30 ${scrolled ? "gov-header-bar-scrolled" : ""}`}
          role="banner"
        >
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left side */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-white hover:bg-white/10 cursor-pointer touch-target"
                    aria-label="Ouvrir le menu de navigation"
                  >
                    <Menu className="h-5 w-5" />
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

            {/* Center: Search */}
            <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-300/50" />
                <Input
                  placeholder="Rechercher déclarations, impôts, documents..."
                  className="pl-9 h-9 bg-white/10 border-white/10 text-white placeholder:text-emerald-300/40 text-xs rounded-xl focus:bg-white/15 focus:border-emerald-400/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Rechercher"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Security badge */}
              <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[9px] text-emerald-300/70 font-semibold">
                <Lock className="h-3 w-3" />
                Sécurisé
              </div>

              {/* Language toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-200/70 hover:text-white hover:bg-white/10 text-[10px] gap-1 cursor-pointer h-8 px-2 touch-target"
                onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
                aria-label={lang === "fr" ? "Switch to Arabic" : "التبديل إلى الفرنسية"}
              >
                <Globe className="h-3 w-3" />
                <span>{lang === "fr" ? "FR" : "عربي"}</span>
              </Button>

              {/* Notifications Bell */}
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-emerald-200/70 hover:text-white hover:bg-white/10 cursor-pointer h-9 w-9 touch-target"
                  aria-label={`${unreadNotifications} notifications non lues`}
                >
                  <Bell className={`h-4 w-4 ${bellAnimating ? "bell-bounce" : ""}`} />
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
                    className="flex items-center gap-2 text-emerald-200/70 hover:text-white hover:bg-white/10 cursor-pointer h-9 px-2 touch-target"
                    aria-label="Menu utilisateur"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[9px] font-bold text-white ring-2 ring-white/20">
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
                      <Lock className="h-4 w-4" />
                      <span>Sécurité / الأمان</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/setup" className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>Setup DB / إعداد ق.ب</span>
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
        <main
          id="main-content"
          className="flex-1 p-4 md:p-6 lg:p-8 bg-[#FAFAF8] overflow-auto gov-pattern-overlay"
          role="main"
        >
          {/* Welcome Banner */}
          <div className="welcome-banner mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0C4A2E]">
                {greeting}, {userName || "Utilisateur"} 👋
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {new Date().toLocaleDateString("fr-DZ", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="security-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Shield className="h-3 w-3" />
                Vérifié par la DGI
              </div>
            </div>
          </div>

          {children}
        </main>

        {/* Institutional Footer */}
        <footer className="gov-footer" role="contentinfo">
          <p className="font-bold text-white/60 text-[9px] mb-0.5">
            DZ-Fisc — Direction Générale des Impôts — Ministère des Finances
          </p>
          <p>
            © 2026 République Algérienne Démocratique et Populaire ·{" "}
            <a href="#">Mentions légales</a> ·{" "}
            <a href="#">Confidentialité</a> ·{" "}
            <a href="#">Accessibilité</a>
          </p>
          <p className="mt-0.5 text-[8px]">
            مديرية الضرائب — وزارة المالية — الجمهورية الجزائرية الديمقراطية الشعبية
          </p>
        </footer>
      </div>
    </div>
  );
}
