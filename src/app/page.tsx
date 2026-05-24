"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Landmark,
  Shield,
  FileText,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Lock,
  Award,
  Building2,
  ArrowRight,
  Star,
  Users,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

/* ------------------------------------------------------------------ */
/*  Landing Page — DZ-Fisc Government Portal                          */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: FileText,
    title: "Déclarations Fiscales",
    titleAr: "التصريحات الجبائية",
    description:
      "TAP, TVA, IBS, IRG — formulaires pré-remplis et soumission électronique à la DGI",
    gradient: "from-emerald-600 to-teal-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Calculator,
    title: "Calculs Automatisés",
    titleAr: "حسابات آلية",
    description:
      "Barème IRG progressif, TAP 1%, TVA 19%, IBS 19% — calculs instantanés et conformes",
    gradient: "from-amber-600 to-yellow-600",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: CalendarDays,
    title: "Échéances & Alertes",
    titleAr: "الآجال والتنبيهات",
    description:
      "Suivi des dates limites, alertes SMS/email, pénalités évitées automatiquement",
    gradient: "from-orange-600 to-red-500",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: CheckCircle2,
    title: "Conformité Garantie",
    titleAr: "امتثال مضمون",
    description:
      "Score de conformité en temps réel, audit trail complet, conforme DGI — législation algérienne",
    gradient: "from-teal-600 to-cyan-600",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
];

const trustBadges = [
  { icon: Lock, label: "Sécurisé", labelAr: "آمن", color: "text-[#0C4A2E]" },
  { icon: Building2, label: "Officiel", labelAr: "رسمي", color: "text-[#B8860B]" },
  { icon: Award, label: "Conforme DGI", labelAr: "متوافق مع م.ع.ض", color: "text-[#0C4A2E]" },
];

const stats = [
  { value: "58", label: "Wilayas couvertes", labelAr: "ولاية مغطاة", icon: Users },
  { value: "4", label: "Types d'impôts", labelAr: "أنواع الضرائب", icon: FileText },
  { value: "24/7", label: "Disponibilité", labelAr: "التوفر", icon: Clock },
  { value: "100%", label: "Conforme DGI", labelAr: "متوافق مع م.ع.ض", icon: BadgeCheck },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl skeleton-shimmer" />
          <div className="h-6 w-32 skeleton-shimmer rounded" />
          <div className="h-3 w-48 skeleton-shimmer rounded" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via effect
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* ====== Government Header ====== */}
      <header className="gov-header-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="DZ-Fisc" width={36} height={36} className="rounded-xl" />
            <div>
              <span className="text-base font-bold text-white tracking-tight">DZ-Fisc</span>
              <p className="text-[9px] text-emerald-300/60 font-medium">
                DGI — Direction Générale des Impôts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center bg-white text-[#0C4A2E] hover:bg-emerald-50 font-semibold text-xs px-4 h-8 rounded-lg transition-colors"
            >
              Connexion / دخول
            </a>
          </div>
        </div>
      </header>

      {/* ====== Republic Banner ====== */}
      <div className="bg-[#0C4A2E] border-b border-[#B8860B]/30 py-2 text-center">
        <p className="text-[10px] font-bold text-emerald-200/60 uppercase tracking-[0.2em]">
          République Algérienne Démocratique et Populaire — الجمهورية الجزائرية الديمقراطية الشعبية
        </p>
      </div>

      <main className="flex-1">
        {/* ====== Hero Section ====== */}
        <section className="relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-amber-100/20 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Plateforme officielle DGI
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A1A1A] leading-tight">
                Conformité Fiscale
                <br />
                <span className="gradient-text">Automatisée</span>
              </h1>

              <p className="text-lg text-[#666666] max-w-2xl mx-auto leading-relaxed">
                Gérez vos obligations fiscales et sociales algériennes en toute conformité.
                TAP, TVA, IBS, IRG, CNAS, CASNOS — tout en une seule plateforme.
              </p>

              <p className="text-sm text-[#999]">
                الامتثال الضريبي الآلي — إدارة التزاماتك الجبائية والاجتماعية
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button
                  onClick={() => router.push("/signup")}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 h-12 rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl text-sm"
                >
                  Commencer / ابدأ الآن
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center border border-[#0C4A2E] text-[#0C4A2E] hover:bg-emerald-50 font-semibold px-6 h-12 rounded-xl gap-2 text-sm transition-colors"
                >
                  Se connecter / تسجيل الدخول
                </a>
              </div>

              {/* Demo mode link */}
              <a
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors mt-2"
              >
                <Star className="h-3 w-3" />
                Essayer en mode démonstration / تجربة الوضع التجريبي
              </a>
            </div>
          </div>
        </section>

        {/* ====== Feature Cards ====== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">
              Fonctionnalités / الميزات
            </h2>
            <p className="text-sm text-[#666] mt-1">
              Une plateforme complète pour la gestion fiscale algérienne
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-6 card-hover group"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A] mb-1">{feature.title}</h3>
                <p className="text-[11px] text-emerald-700 mb-2 font-medium">{feature.titleAr}</p>
                <p className="text-sm text-[#666666] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ====== Trust Badges ====== */}
        <section className="bg-white border-y border-gray-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6">
              <h2 className="text-sm font-bold text-[#999] uppercase tracking-wider">
                Certifié & Sécurisé / معتمد وآمن
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAFAF8]">
                    <badge.icon className={`h-5 w-5 ${badge.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">{badge.label}</p>
                    <p className="text-[10px] text-[#999]">{badge.labelAr}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== Stats ====== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-4 w-4 text-[#0C4A2E]" />
                </div>
                <p className="text-3xl font-extrabold text-[#0C4A2E]">{stat.value}</p>
                <p className="text-sm font-medium text-[#333] mt-1">{stat.label}</p>
                <p className="text-[10px] text-[#999]">{stat.labelAr}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ====== CTA Section ====== */}
        <section className="bg-[#0C4A2E] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Prêt à simplifier votre gestion fiscale ?
            </h2>
            <p className="text-sm text-emerald-200/70 mb-6">
              هل أنت مستعد لتبسيط إدارتك الضريبية؟
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => router.push("/signup")}
                className="bg-white text-[#0C4A2E] hover:bg-emerald-50 font-semibold px-8 h-11 rounded-xl gap-2 cursor-pointer text-sm"
              >
                Créer un compte / إنشاء حساب
                <ArrowRight className="h-4 w-4" />
              </Button>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center border border-emerald-300/30 text-emerald-200 hover:text-white hover:bg-white/10 font-medium px-6 h-11 rounded-xl gap-2 text-sm transition-colors"
              >
                <Shield className="h-4 w-4" />
                Mode démonstration
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ====== Footer ====== */}
      <footer className="bg-[#0C4A2E] border-t border-[#B8860B]/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Landmark className="h-4 w-4 text-emerald-300" />
            <span className="text-sm font-bold text-white">DZ-Fisc</span>
          </div>
          <p className="text-[10px] text-emerald-300/50">
            Direction Générale des Impôts — Ministère des Finances — République Algérienne
            Démocratique et Populaire
          </p>
          <p className="text-[9px] text-emerald-400/30 mt-1">
            مديرية الضرائب — وزارة المالية — الجمهورية الجزائرية الديمقراطية الشعبية
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-emerald-400/30">
            <span>© 2026 DZ-Fisc</span>
            <span>|</span>
            <a href="#" className="hover:text-emerald-300/50 transition-colors">Mentions légales / الإشعارات القانونية</a>
            <span>|</span>
            <a href="#" className="hover:text-emerald-300/50 transition-colors">Confidentialité / الخصوصية</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
