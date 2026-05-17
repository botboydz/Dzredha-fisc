"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Calculator,
  Users,
  CalendarDays,
  FileText,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Download,
  Plus,
  Minus,
  Shield,
  Receipt,
  Landmark,
  Heart,
  Briefcase,
  Copy,
  Database,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDZFiscData } from "@/lib/use-dzfisc-data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type View = "dashboard" | "taxes" | "cnas" | "calendar";

/* Types are imported from Supabase lib — these are view-layer adapters */

interface TaxRow {
  id: string;
  name: string;
  nameAr: string;
  rate: string;
  period: string;
  status: "paid" | "pending" | "overdue";
  amount: number;
  paidAmount?: number;
}

interface EmpRow {
  id: string;
  name: string;
  role: string;
  salary: number;
  cnasRate: number;
  casnosRate: number;
}

interface DlRow {
  id: string;
  title: string;
  titleAr: string;
  date: string;
  type: "tax" | "social" | "filing";
  urgency: "overdue" | "urgent" | "soon" | "normal";
  status: "done" | "pending" | "overdue";
  amount?: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Supabase → View data transformers                                  */
/* ------------------------------------------------------------------ */

const TAX_NAMES: Record<string, { name: string; nameAr: string; rate: string }> = {
  TAP: { name: "TAP — Taxe sur l'Activité Professionnelle", nameAr: "ض.م.م — ضريبة النشاط المهني", rate: "1%" },
  TVA: { name: "TVA — Taxe sur la Valeur Ajoutée", nameAr: "ر.ق — الرسم على القيمة المضافة", rate: "19%" },
  IBS: { name: "IBS — Impôt sur les Bénéfices des Sociétés", nameAr: "ض.أ.ش — ضريبة أرباح الشركات", rate: "19%" },
  IRG: { name: "IRG — Impôt sur le Revenu Global", nameAr: "ض.د.ع — ضريبة الدخل الإجمالي", rate: "Progressif" },
};

function transformTaxes(taxes: { id: string; tax_type: string; period: string; tax_amount: number; paid_amount: number; status: string }[]): TaxRow[] {
  return taxes.map((t) => {
    const info = TAX_NAMES[t.tax_type] || { name: t.tax_type, nameAr: "", rate: "" };
    return {
      id: t.id,
      name: info.name,
      nameAr: info.nameAr,
      rate: info.rate,
      period: t.period,
      status: t.status as TaxRow["status"],
      amount: t.tax_amount,
      paidAmount: t.paid_amount || undefined,
    };
  });
}

function transformEmployees(emps: { id: string; name: string; role: string | null; salary: number; cnas_employer_rate: number; casnos_rate: number }[]): EmpRow[] {
  return emps.map((e) => ({
    id: e.id.slice(0, 4).toUpperCase(),
    name: e.name,
    role: e.role || "—",
    salary: e.salary,
    cnasRate: e.cnas_employer_rate,
    casnosRate: e.casnos_rate,
  }));
}

function transformDeadlines(dls: { id: string; title: string; title_ar: string | null; deadline_date: string; deadline_type: string; urgency: string; status: string; amount: number | null }[]): DlRow[] {
  return dls.map((d) => ({
    id: d.id,
    title: d.title,
    titleAr: d.title_ar || "",
    date: d.deadline_date,
    type: d.deadline_type as DlRow["type"],
    urgency: d.urgency as DlRow["urgency"],
    status: d.status as DlRow["status"],
    amount: d.amount || undefined,
  }));
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDZD(amount: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " DZD";
}

function formatShortDZD(amount: number): string {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + "M DZD";
  if (amount >= 1000) return (amount / 1000).toFixed(0) + "K DZD";
  return amount + " DZD";
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

const navItems: { key: View; label: string; labelAr: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Tableau de bord", labelAr: "لوحة القيادة", icon: LayoutDashboard },
  { key: "taxes", label: "Impôts", labelAr: "الضرائب", icon: Calculator },
  { key: "cnas", label: "CNAS / CASNOS", labelAr: "ص.و.ت.ش / ص.و.ت.غ", icon: Users },
  { key: "calendar", label: "Échéances", labelAr: "الآجال", icon: CalendarDays },
];

function Sidebar({ active, onNavigate, overdueCount }: { active: View; onNavigate: (v: View) => void; overdueCount: number }) {

  return (
    <aside className="sidebar-bg w-64 min-h-screen flex flex-col shrink-0 hidden lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
          <Landmark className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-white tracking-tight">DZ-Fisc</span>
          <p className="text-[9px] text-emerald-300/60 font-medium">الجزائر</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`sidebar-item ${active === item.key ? "active" : ""} w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
              active === item.key
                ? "text-white bg-white/10"
                : "text-emerald-200/60 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <div className="flex flex-col items-start">
              <span className="font-medium text-[13px]">{item.label}</span>
              <span className="text-[9px] opacity-50">{item.labelAr}</span>
            </div>
            {item.key === "calendar" && overdueCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-emerald-300/70">Synchronisé avec la DGI</span>
        </div>
        <p className="text-[9px] text-emerald-400/30">v1.0 MVP — Conformité garantie</p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Nav                                                         */
/* ------------------------------------------------------------------ */

function MobileNav({ active, onNavigate }: { active: View; onNavigate: (v: View) => void }) {
  return (
    <div className="lg:hidden flex items-center gap-1 border-b border-emerald-100/60 bg-white/80 backdrop-blur-xl px-2 py-2 sticky top-0 z-20">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.key)}
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            active === item.key
              ? "bg-emerald-50 text-emerald-700"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <item.icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: TaxRow["status"] }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    paid: "Payé / مدفوع",
    pending: "En attente / قيد الانتظار",
    overdue: "En retard / متأخر",
  };
  const icons: Record<string, React.ElementType> = {
    paid: CheckCircle2,
    pending: Clock,
    overdue: AlertTriangle,
  };
  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}>
      <Icon className="h-3 w-3" />
      {labels[status]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Urgency Badge                                                      */
/* ------------------------------------------------------------------ */

function UrgencyBadge({ urgency }: { urgency: DlRow["urgency"] }) {
  const styles: Record<string, string> = {
    overdue: "bg-red-50 text-red-700 border-red-200",
    urgent: "bg-orange-50 text-orange-700 border-orange-200",
    soon: "bg-yellow-50 text-yellow-700 border-yellow-200",
    normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const labels: Record<string, string> = {
    overdue: "En retard",
    urgent: "Urgent",
    soon: "Bientôt",
    normal: "Normal",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${styles[urgency]}`}>
      {labels[urgency]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard View                                                     */
/* ------------------------------------------------------------------ */

function DashboardView({ taxObligations, employees, deadlines }: { taxObligations: TaxRow[]; employees: EmpRow[]; deadlines: DlRow[] }) {
  const totalPending = taxObligations
    .filter((t) => t.status === "pending")
    .reduce((s, t) => s + t.amount, 0);
  const totalPaid = taxObligations
    .filter((t) => t.status === "paid")
    .reduce((s, t) => s + (t.paidAmount || t.amount), 0);
  const overdueCount = deadlines.filter((d) => d.status === "overdue").length;
  const pendingCount = deadlines.filter((d) => d.status === "pending").length;

  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);
  const totalCNAS = employees.reduce((s, e) => s + (e.salary * e.cnasRate) / 100, 0);

  return (
    <div className="view-enter space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Pending taxes */}
        <div className="card-hover bg-white rounded-2xl border border-emerald-100/60 p-5 animate-fade-in-up animate-delay-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Impôts en attente</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dzd-badge animate-count">{formatShortDZD(totalPending)}</p>
          <p className="text-[11px] text-amber-600 mt-1">{pendingCount} déclarations à soumettre</p>
        </div>

        {/* Paid */}
        <div className="card-hover bg-white rounded-2xl border border-emerald-100/60 p-5 animate-fade-in-up animate-delay-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payé ce mois</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dzd-badge animate-count">{formatShortDZD(totalPaid)}</p>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Conforme
          </p>
        </div>

        {/* Overdue */}
        <div className="card-hover bg-white rounded-2xl border border-emerald-100/60 p-5 animate-fade-in-up animate-delay-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">En retard</span>
          </div>
          <p className="text-2xl font-extrabold text-red-600 animate-count">{overdueCount}</p>
          <p className="text-[11px] text-red-500 mt-1">Pénalités 10-25% applicables</p>
        </div>

        {/* CNAS this month */}
        <div className="card-hover bg-white rounded-2xl border border-emerald-100/60 p-5 animate-fade-in-up animate-delay-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <Heart className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CNAS ce mois</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dzd-badge animate-count">{formatShortDZD(totalCNAS)}</p>
          <p className="text-[11px] text-gray-400 mt-1">{employees.length} employés — {((totalCNAS / totalPayroll) * 100).toFixed(0)}% de la masse</p>
        </div>
      </div>

      {/* Recent obligations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Dernières Obligations</h2>
          <span className="text-[10px] text-gray-400">6 déclarations récentes</span>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100/60 overflow-hidden">
          {taxObligations.map((tax) => (
            <div
              key={tax.id}
              className={`urgency-${tax.status === "overdue" ? "overdue" : tax.status === "pending" ? "urgent" : "normal"} flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-b-0 hover:bg-emerald-50/30 transition-colors`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusBadge status={tax.status} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tax.name}</p>
                  <p className="text-[10px] text-gray-400">{tax.nameAr} · {tax.period} · Taux: {tax.rate}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-bold dzd-badge text-gray-900">{formatDZD(tax.amount)}</p>
                {tax.status === "paid" && (
                  <p className="text-[10px] text-emerald-600">Payé ✓</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button className="card-hover flex items-center gap-3 bg-white rounded-2xl border border-emerald-100/60 p-4 text-left cursor-pointer group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Calculer TAP</p>
            <p className="text-[10px] text-gray-400">Estimer votre déclaration</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
        </button>

        <button className="card-hover flex items-center gap-3 bg-white rounded-2xl border border-emerald-100/60 p-4 text-left cursor-pointer group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Générer Déclaration</p>
            <p className="text-[10px] text-gray-400">Formulaire pré-rempli</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
        </button>

        <button className="card-hover flex items-center gap-3 bg-white rounded-2xl border border-emerald-100/60 p-4 text-left cursor-pointer group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20 group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Cotisations Sociales</p>
            <p className="text-[10px] text-gray-400">CNAS + CASNOS</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tax Calculator View                                                */
/* ------------------------------------------------------------------ */

function TaxesView() {
  const [revenue, setRevenue] = useState(14500000);
  const [expenses, setExpenses] = useState(8200000);
  const [salaryMass, setSalaryMass] = useState(575000);
  const [selectedTax, setSelectedTax] = useState<string>("TAP");

  const calculations = useMemo(() => {
    const profit = revenue - expenses;
    const tap = revenue * 0.01;
    const tva = revenue * 0.19;
    const ibs = profit > 0 ? profit * 0.19 : 0;

    // IRG progressive
    let irg = 0;
    let remaining = salaryMass;
    const brackets = [
      { limit: 240000, rate: 0 },      // 0-20k/month * 12
      { limit: 360000, rate: 0.2 },     // 20k-30k * 12
      { limit: 480000, rate: 0.3 },     // 30k-40k * 12
      { limit: Infinity, rate: 0.35 },  // 40k+
    ];
    let prevLimit = 0;
    for (const bracket of brackets) {
      const taxable = Math.min(remaining, bracket.limit - prevLimit);
      if (taxable <= 0) break;
      irg += taxable * bracket.rate;
      remaining -= taxable;
      prevLimit = bracket.limit;
    }

    return {
      TAP: { amount: tap, rate: "1%", base: revenue, label: "Taxe sur l'Activité Professionnelle", labelAr: "ضريبة النشاط المهني" },
      TVA: { amount: tva, rate: "19%", base: revenue, label: "Taxe sur la Valeur Ajoutée", labelAr: "الرسم على القيمة المضافة" },
      IBS: { amount: ibs, rate: "19%", base: profit, label: "Impôt sur les Bénéfices des Sociétés", labelAr: "ضريبة أرباح الشركات" },
      IRG: { amount: irg, rate: "Progressif", base: salaryMass, label: "Impôt sur le Revenu Global", labelAr: "ضريبة الدخل الإجمالي" },
    };
  }, [revenue, expenses, salaryMass]);

  const taxTypes = [
    { key: "TAP", icon: Receipt, color: "from-emerald-500 to-teal-600" },
    { key: "TVA", icon: Calculator, color: "from-blue-500 to-indigo-600" },
    { key: "IBS", icon: Landmark, color: "from-violet-500 to-purple-600" },
    { key: "IRG", icon: Briefcase, color: "from-orange-500 to-red-500" },
  ];

  const current = calculations[selectedTax as keyof typeof calculations];

  return (
    <div className="view-enter space-y-6">
      {/* Tax type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {taxTypes.map((t) => (
          <button
            key={t.key}
            onClick={() => setSelectedTax(t.key)}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all cursor-pointer ${
              selectedTax === t.key
                ? "bg-white border-emerald-200 shadow-md scale-[1.02]"
                : "bg-white/60 border-gray-200/60 hover:bg-white hover:border-gray-300"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} shadow-md`}>
              <t.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">{t.key}</span>
            <span className="text-[10px] text-gray-400">{calculations[t.key as keyof typeof calculations].rate}</span>
          </button>
        ))}
      </div>

      {/* Main calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-emerald-100/60 p-6 space-y-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Paramètres / المعاملات</h3>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Chiffre d'affaires (HT) / رقم الأعمال
            </label>
            <div className="relative">
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 focus:outline-none dzd-badge"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Charges déductibles / المصاريف القابلة للخصم
            </label>
            <div className="relative">
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 focus:outline-none dzd-badge"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Masse salariale brute / الكتلة الأجرية الإجمالية
            </label>
            <div className="relative">
              <input
                type="number"
                value={salaryMass}
                onChange={(e) => setSalaryMass(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 focus:outline-none dzd-badge"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">
              {current.label}
            </p>
            <p className="text-emerald-200/60 text-[10px] mb-4">{current.labelAr}</p>
            <p className="text-4xl font-extrabold dzd-badge animate-count">{formatDZD(current.amount)}</p>
            <div className="flex items-center gap-4 mt-4 text-emerald-100 text-xs">
              <span>Taux: {current.rate}</span>
              <span>Base: {formatShortDZD(current.base)}</span>
            </div>
          </div>

          {/* All taxes summary */}
          <div className="bg-white rounded-2xl border border-emerald-100/60 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Résumé / ملخص</h3>
            <div className="space-y-3">
              {Object.entries(calculations).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">{key}</span>
                    <span className="text-[10px] text-gray-400">{val.rate}</span>
                  </div>
                  <span className={`text-sm font-bold dzd-badge ${selectedTax === key ? "text-emerald-700" : "text-gray-600"}`}>
                    {formatDZD(val.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">Total / المجموع</span>
                <span className="text-base font-extrabold text-emerald-700 dzd-badge">
                  {formatDZD(Object.values(calculations).reduce((s, v) => s + v.amount, 0))}
                </span>
              </div>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-5 rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]">
            <FileText className="h-4 w-4" />
            Générer la Déclaration / إنشاء التصريح
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CNAS / CASNOS View                                                 */
/* ------------------------------------------------------------------ */

function CnasView({ employees }: { employees: EmpRow[] }) {
  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);
  const totalCNAS = employees.reduce((s, e) => s + (e.salary * e.cnasRate) / 100, 0);
  const employeeCNAS = employees.reduce((s, e) => s + (e.salary * 9) / 100, 0);
  const employerCNAS = totalCNAS - employeeCNAS;

  return (
    <div className="view-enter space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-hover bg-white rounded-2xl border border-emerald-100/60 p-5 animate-fade-in-up animate-delay-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <Heart className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total CNAS / Employeur</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dzd-badge animate-count">{formatShortDZD(employerCNAS)}</p>
          <p className="text-[11px] text-gray-400 mt-1">26% × Masse salariale — Part patronale</p>
        </div>

        <div className="card-hover bg-white rounded-2xl border border-emerald-100/60 p-5 animate-fade-in-up animate-delay-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
              <Users className="h-4 w-4 text-violet-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total CNAS / Salarié</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dzd-badge animate-count">{formatShortDZD(employeeCNAS)}</p>
          <p className="text-[11px] text-gray-400 mt-1">9% × Masse salariale — Part salariale</p>
        </div>

        <div className="card-hover bg-white rounded-2xl border border-emerald-100/60 p-5 animate-fade-in-up animate-delay-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <Briefcase className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Masse salariale</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dzd-badge animate-count">{formatShortDZD(totalPayroll)}</p>
          <p className="text-[11px] text-gray-400 mt-1">{employees.length} employés</p>
        </div>
      </div>

      {/* Employee table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Détail par Employé / تفصيل حسب الموظف</h2>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100/60 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <th className="px-5 py-3 text-left text-[10px] font-bold text-white/90 uppercase tracking-widest">Employé / الموظف</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold text-white/90 uppercase tracking-widest">Poste</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-white/90 uppercase tracking-widest">Salaire</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-white/90 uppercase tracking-widest">CNAS (26%)</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-white/90 uppercase tracking-widest">Net estimé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((emp, i) => {
                  const cnas = (emp.salary * emp.cnasRate) / 100;
                  const irg9 = (emp.salary * 9) / 100;
                  const net = emp.salary - irg9;

                  return (
                    <tr key={emp.id} className={`table-row-hover ${i % 2 === 0 ? "bg-white" : "bg-emerald-50/20"}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">
                            {emp.id}
                          </div>
                          <span className="font-medium text-gray-800">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{emp.role}</td>
                      <td className="px-5 py-3 text-right font-medium dzd-badge text-gray-800">{formatDZD(emp.salary)}</td>
                      <td className="px-5 py-3 text-right dzd-badge text-blue-600 font-medium">{formatDZD(cnas)}</td>
                      <td className="px-5 py-3 text-right dzd-badge font-semibold text-emerald-700">{formatDZD(net)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50/50 border-t border-emerald-100">
                  <td colSpan={2} className="px-5 py-3 text-sm font-bold text-gray-800">Total / المجموع</td>
                  <td className="px-5 py-3 text-right font-bold dzd-badge text-gray-900">{formatDZD(totalPayroll)}</td>
                  <td className="px-5 py-3 text-right font-bold dzd-badge text-blue-700">{formatDZD(totalCNAS)}</td>
                  <td className="px-5 py-3 text-right font-bold dzd-badge text-emerald-800">{formatDZD(totalPayroll - employeeCNAS)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl">
        <Download className="h-4 w-4" />
        Générer Bordereau CNAS / إنشاء قسيم ص.و.ت.ش
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendar View                                                      */
/* ------------------------------------------------------------------ */

function CalendarView({ deadlines }: { deadlines: DlRow[] }) {
  const sorted = [...deadlines].sort((a, b) => {
    const urgencyOrder = { overdue: 0, urgent: 1, soon: 2, normal: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || daysUntil(a.date) - daysUntil(b.date);
  });

  const typeIcons: Record<string, React.ElementType> = {
    tax: Receipt,
    social: Heart,
    filing: FileText,
  };

  const typeColors: Record<string, string> = {
    tax: "from-emerald-500 to-teal-600",
    social: "from-blue-500 to-indigo-600",
    filing: "from-violet-500 to-purple-600",
  };

  return (
    <div className="view-enter space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-hover bg-white rounded-2xl border border-red-100/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">En retard / متأخر</span>
          </div>
          <p className="text-3xl font-extrabold text-red-600 animate-count">
            {deadlines.filter((d) => d.urgency === "overdue").length}
          </p>
          <p className="text-[11px] text-red-400 mt-1">Pénalités en cours</p>
        </div>

        <div className="card-hover bg-white rounded-2xl border border-orange-100/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cette semaine / هذا الأسبوع</span>
          </div>
          <p className="text-3xl font-extrabold text-orange-600 animate-count">
            {deadlines.filter((d) => d.urgency === "urgent").length}
          </p>
          <p className="text-[11px] text-orange-400 mt-1">À soumettre avant le 20</p>
        </div>

        <div className="card-hover bg-white rounded-2xl border border-emerald-100/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">À venir / قادم</span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 animate-count">
            {deadlines.filter((d) => d.urgency === "normal" || d.urgency === "soon").length}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">Planifié normalement</p>
        </div>
      </div>

      {/* Deadline list */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Toutes les Échéances / جميع الآجال</h2>
        <div className="space-y-3">
          {sorted.map((dl) => {
            const Icon = typeIcons[dl.type] || FileText;
            const days = daysUntil(dl.date);
            const color = typeColors[dl.type] || "from-gray-500 to-gray-600";

            return (
              <div
                key={dl.id}
                className={`urgency-${dl.urgency} bg-white rounded-2xl border border-gray-100/60 p-5 card-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{dl.title}</p>
                    <p className="text-[10px] text-gray-400">{dl.titleAr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {dl.amount && (
                    <span className="text-sm font-bold dzd-badge text-gray-700">{formatShortDZD(dl.amount)}</span>
                  )}
                  <UrgencyBadge urgency={dl.urgency} />
                  <div className="text-right min-w-[70px]">
                    <p className="text-[11px] font-medium text-gray-600">{dl.date}</p>
                    <p className={`text-[10px] ${days < 0 ? "text-red-500" : days <= 3 ? "text-orange-500" : "text-gray-400"}`}>
                      {days < 0 ? `${Math.abs(days)}j de retard` : days === 0 ? "Aujourd'hui" : `${days}j restants`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const { taxObligations: rawTaxes, employees: rawEmps, deadlines: rawDls, isConnected, isLoading } = useDZFiscData();

  // Transform Supabase data → view-layer format
  const taxRows = useMemo(() => transformTaxes(rawTaxes), [rawTaxes]);
  const empRows = useMemo(() => transformEmployees(rawEmps), [rawEmps]);
  const dlRows = useMemo(() => transformDeadlines(rawDls), [rawDls]);
  const overdueCount = dlRows.filter((d) => d.status === "overdue").length;

  return (
    <div className="min-h-screen flex bg-[#f0fdf4]">
      {/* Sidebar */}
      <Sidebar active={activeView} onNavigate={setActiveView} overdueCount={overdueCount} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile nav */}
        <MobileNav active={activeView} onNavigate={setActiveView} />

        {/* Top bar */}
        <header className="h-14 border-b border-emerald-100/60 bg-white/80 backdrop-blur-xl flex items-center justify-between px-5 sm:px-8 sticky top-0 z-10">
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold gradient-text">DZ-Fisc</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-gray-800">
              {navItems.find((n) => n.key === activeView)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer">
              <Bell className="h-4 w-4 text-emerald-600" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                3
              </span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              SB
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-8 overflow-y-auto custom-scrollbar">
          {/* Database connection banner */}
          {!isConnected && !isLoading && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>Mode démo — données locales. Connectez Supabase pour les données en temps réel.</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-amber-600">
                <Database className="h-3 w-3" /> Non connecté
              </span>
            </div>
          )}
          {isConnected && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <Database className="h-4 w-4 shrink-0" />
              <span>Connecté à Supabase — données en temps réel.</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </span>
            </div>
          )}
          {activeView === "dashboard" && <DashboardView taxObligations={taxRows} employees={empRows} deadlines={dlRows} />}
          {activeView === "taxes" && <TaxesView />}
          {activeView === "cnas" && <CnasView employees={empRows} />}
          {activeView === "calendar" && <CalendarView deadlines={dlRows} />}
        </main>
      </div>
    </div>
  );
}
