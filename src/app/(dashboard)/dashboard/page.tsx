"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Receipt,
  Heart,
  FileText,
  Shield,
  Download,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Calculator,
  FolderOpen,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDZFiscData } from "@/lib/use-dzfisc-data";
import { useAuth } from "@/contexts/auth-context";
import { PaymentBadge, UrgencyBadge } from "@/components/gov/status-badge";
import { DashboardSkeleton } from "@/components/skeletons";

/* ------------------------------------------------------------------ */
/*  Constants & Helpers                                                */
/* ------------------------------------------------------------------ */

const TAX_NAMES: Record<string, { name: string; nameAr: string; rate: string }> = {
  TAP: { name: "TAP — Taxe sur l'Activité Professionnelle", nameAr: "ض.م.م — ضريبة النشاط المهني", rate: "1%" },
  TVA: { name: "TVA — Taxe sur la Valeur Ajoutée", nameAr: "ر.ق — الرسم على القيمة المضافة", rate: "19%" },
  IBS: { name: "IBS — Impôt sur les Bénéfices des Sociétés", nameAr: "ض.أ.ش — ضريبة أرباح الشركات", rate: "19%" },
  IRG: { name: "IRG — Impôt sur le Revenu Global", nameAr: "ض.د.ع — ضريبة الدخل الإجمالي", rate: "Progressif" },
};

function formatDZD(amount: number): string {
  return (
    new Intl.NumberFormat("fr-DZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " DZD"
  );
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
/*  Compliance Ring Component                                          */
/* ------------------------------------------------------------------ */

function ComplianceRing({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#D97706" : "#E54D4D";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="120" height="120" className="compliance-ring">
          <circle cx="60" cy="60" r={radius} className="compliance-ring-track" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="compliance-ring-fill"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold animate-count" style={{ color }}>
            {score}%
          </span>
          <span className="text-[9px] text-gray-400">Conformité</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-600">Score de Conformité / نقاط الامتثال</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card Component — Enhanced                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  accent,
  iconBg,
  icon: Icon,
  iconColor,
  label,
  value,
  subtitle,
  delay,
  trend,
  trendLabel,
  progress,
  progressColor,
}: {
  accent: string;
  iconBg: string;
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string;
  subtitle: React.ReactNode;
  delay: string;
  trend?: { value: string; up: boolean };
  trendLabel?: string;
  progress?: number;
  progressColor?: string;
}) {
  return (
    <div className={`stat-card ${accent} animate-fade-in-up ${delay}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} shadow-soft`}>
            <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
            {trend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-xl font-extrabold dzd-badge animate-count">
        {value}
      </p>
      <div className="text-[11px] mt-1">{subtitle}</div>
      {progress !== undefined && (
        <div className="stat-card-progress">
          <div
            className="stat-card-progress-fill"
            style={{ width: `${progress}%`, backgroundColor: progressColor || "#16A34A" }}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity Timeline                                                  */
/* ------------------------------------------------------------------ */

const MOCK_ACTIVITY = [
  { id: 1, text: "Déclaration TVA soumise", textAr: "تم تقديم تصريح ر.ق", time: "il y a 2h", color: "#16A34A", bgColor: "bg-emerald-50" },
  { id: 2, text: "Paiement TAP confirmé", textAr: "تم تأكيد دفع ض.م.م", time: "il y a 1j", color: "#0C4A2E", bgColor: "bg-emerald-50" },
  { id: 3, text: "Document IBS téléchargé", textAr: "تم تحميل وثيقة ض.أ.ش", time: "il y a 2j", color: "#B8860B", bgColor: "bg-amber-50" },
  { id: 4, text: "Rappel échéance IRG", textAr: "تذكير آجال ض.د.ع", time: "il y a 3j", color: "#EA580C", bgColor: "bg-orange-50" },
  { id: 5, text: "Score de conformité mis à jour", textAr: "تم تحديث نقاط الامتثال", time: "il y a 5j", color: "#0C4A2E", bgColor: "bg-emerald-50" },
];

function ActivityTimeline() {
  return (
    <div className="gov-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="gov-section-title">Activité Récente / النشاط الأخير</h2>
          <p className="gov-section-subtitle">Dernières actions sur votre compte</p>
        </div>
        <Clock className="h-4 w-4 text-gray-300" />
      </div>
      <div className="space-y-0">
        {MOCK_ACTIVITY.map((item) => (
          <div key={item.id} className="timeline-item py-2">
            <div className="timeline-dot" style={{ borderColor: item.color }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.text}</p>
                <p className="text-[10px] text-gray-400">{item.textAr}</p>
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-4">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contextual Tip                                                     */
/* ------------------------------------------------------------------ */

function ContextualTip() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 shrink-0">
        <Lightbulb className="h-4 w-4 text-amber-600" />
      </div>
      <div>
        <p className="text-xs font-bold text-amber-800">Astuce / نصيحة</p>
        <p className="text-[11px] text-amber-700 mt-0.5">
          Vos déclarations TAP sont dues dans 3 jours. Soumettez-les à temps pour éviter les pénalités de 10%.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { company, companyId } = useAuth();
  const { taxObligations, employees, deadlines, isLoading, isConnected } =
    useDZFiscData(companyId);
  const [chartPeriod, setChartPeriod] = useState<"monthly" | "quarterly">("monthly");

  // Computed metrics
  const metrics = useMemo(() => {
    const totalPending = taxObligations
      .filter((t) => t.status === "pending")
      .reduce((s, t) => s + t.tax_amount, 0);

    const totalPaid = taxObligations
      .filter((t) => t.status === "paid")
      .reduce((s, t) => s + t.paid_amount, 0);

    const totalOverdue = taxObligations
      .filter((t) => t.status === "overdue")
      .reduce((s, t) => s + t.tax_amount, 0);

    const overdueDeadlines = deadlines.filter(
      (d) => d.status === "overdue" || d.urgency === "overdue"
    );
    const urgentDeadlines = deadlines.filter((d) => d.urgency === "urgent");

    const nextDeadline = deadlines
      .filter((d) => d.status !== "done")
      .sort(
        (a, b) =>
          new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime()
      )[0];

    const nextDays = nextDeadline ? daysUntil(nextDeadline.deadline_date) : null;

    const totalCNAS = employees.reduce(
      (s, e) => s + (e.salary * e.cnas_employer_rate) / 100,
      0
    );

    const pendingDocs = deadlines.filter(d => d.status === "pending").length;

    const complianceScore = Math.round(
      (taxObligations.filter((t) => t.status === "paid").length /
        Math.max(taxObligations.length, 1)) *
        100
    );

    const tvaObligations = taxObligations.filter((t) => t.tax_type === "TVA");
    const tvaStatus = tvaObligations.some((t) => t.status === "overdue")
      ? "En retard"
      : tvaObligations.some((t) => t.status === "pending")
        ? "En attente"
        : "Conforme";

    const taxTypes = ["TAP", "TVA", "IBS", "IRG"] as const;
    const taxProgress = taxTypes.map((type) => {
      const obligations = taxObligations.filter((t) => t.tax_type === type);
      const paid = obligations.filter((t) => t.status === "paid").length;
      const total = obligations.length;
      return {
        type,
        name: TAX_NAMES[type]?.name.split(" — ")[0] || type,
        nameAr: TAX_NAMES[type]?.nameAr.split(" — ")[0] || type,
        progress: total > 0 ? Math.round((paid / total) * 100) : 0,
        paid,
        total,
      };
    });

    return {
      totalPending,
      totalPaid,
      totalOverdue,
      overdueCount: overdueDeadlines.length,
      urgentCount: urgentDeadlines.length,
      nextDeadline,
      nextDays,
      totalCNAS,
      pendingDocs,
      complianceScore,
      tvaStatus,
      taxProgress,
    };
  }, [taxObligations, employees, deadlines]);

  // Revenue chart data
  const revenueData = useMemo(
    () => [
      { month: "Jan", revenu: 12500000, impots: 2375000 },
      { month: "Fév", revenu: 11800000, impots: 2242000 },
      { month: "Mar", revenu: 13200000, impots: 2508000 },
      { month: "Avr", revenu: 14500000, impots: 2755000 },
      { month: "Mai", revenu: 13800000, impots: 2622000 },
      { month: "Jun", revenu: 15200000, impots: 2888000 },
      { month: "Jul", revenu: 14100000, impots: 2679000 },
      { month: "Aoû", revenu: 12900000, impots: 2451000 },
      { month: "Sep", revenu: 15600000, impots: 2964000 },
      { month: "Oct", revenu: 16300000, impots: 3097000 },
      { month: "Nov", revenu: 14800000, impots: 2812000 },
      { month: "Déc", revenu: 17200000, impots: 3268000 },
    ],
    []
  );

  // Tax breakdown data
  const taxBreakdownData = useMemo(() => {
    const types = ["TAP", "TVA", "IBS", "IRG"] as const;
    return types.map((type) => {
      const obligations = taxObligations.filter((t) => t.tax_type === type);
      const paid = obligations
        .filter((t) => t.status === "paid")
        .reduce((s, t) => s + t.paid_amount, 0);
      const pending = obligations
        .filter((t) => t.status !== "paid")
        .reduce((s, t) => s + t.tax_amount, 0);
      return { name: type, Payé: paid, "En attente": pending };
    });
  }, [taxObligations]);

  // Fiscal year summary pie data
  const fiscalSummaryData = useMemo(() => [
    { name: "Payé", value: metrics.totalPaid, color: "#16A34A" },
    { name: "En attente", value: metrics.totalPending, color: "#D97706" },
    { name: "En retard", value: metrics.totalOverdue, color: "#E54D4D" },
  ], [metrics]);

  const exportToCSV = () => {
    const headers = ["Statut", "Impôt", "Période", "Échéance", "Montant"];
    const rows = taxObligations.map((t) => [
      t.status,
      t.tax_type,
      t.period,
      t.due_date,
      t.tax_amount.toString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dz-fisc-obligations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 view-enter">
      {/* ====== Header ====== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2 text-balance">
            <LayoutDashboard className="h-5 w-5 text-[#0C4A2E]" />
            Tableau de Bord / لوحة القيادة
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7280]">
            {company?.nif && (
              <span className="font-mono bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 border border-emerald-100">
                NIF: {company.nif}
              </span>
            )}
            <span>Exercice 2026</span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              {isConnected ? "Sync DGI active" : "Mode démonstration"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold gap-1 cursor-pointer shadow-soft"
          >
            <Link href="/declarations">
              <FileText className="h-3.5 w-3.5" />
              Nouvelle Déclaration
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1 cursor-pointer" onClick={exportToCSV}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* ====== Contextual Tip ====== */}
      <ContextualTip />

      {/* ====== 8 Stat Cards (2 rows of 4) ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          accent="gov-card-accent-red"
          iconBg="bg-red-50"
          icon={AlertTriangle}
          iconColor="text-red-500"
          label="Impôts Impayés"
          value={formatShortDZD(metrics.totalPending + metrics.totalOverdue)}
          subtitle={
            <span className="text-red-500">
              {taxObligations.filter((t) => t.status !== "paid").length} déclarations en attente
            </span>
          }
          delay="animate-delay-1"
          trend={{ value: "12%", up: false }}
          progress={Math.min(100, Math.round(((metrics.totalPending + metrics.totalOverdue) / Math.max(metrics.totalPaid, 1)) * 100))}
          progressColor="#E54D4D"
        />

        <StatCard
          accent="gov-card-accent-orange"
          iconBg="bg-orange-50"
          icon={CalendarDays}
          iconColor="text-orange-500"
          label="Échéances Proches"
          value={
            metrics.nextDeadline
              ? `J-${metrics.nextDays !== null ? metrics.nextDays : "–"}`
              : "Aucune"
          }
          subtitle={
            <span className="text-orange-500">
              {metrics.nextDeadline?.title || "Aucune échéance"}
            </span>
          }
          delay="animate-delay-2"
        />

        <StatCard
          accent="gov-card-accent-green"
          iconBg="bg-emerald-50"
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          label="Paiements Récents"
          value={formatShortDZD(metrics.totalPaid)}
          subtitle={
            <span className="text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Conforme
            </span>
          }
          delay="animate-delay-3"
          trend={{ value: "8%", up: true }}
          progress={metrics.complianceScore}
          progressColor="#16A34A"
        />

        <StatCard
          accent="gov-card-accent-gold"
          iconBg="bg-amber-50"
          icon={Receipt}
          iconColor="text-amber-600"
          label="Statut TVA"
          value={metrics.tvaStatus}
          subtitle={
            <span className="text-amber-600">
              {metrics.tvaStatus === "Conforme"
                ? "TVA à jour / ر.ق محدث"
                : "Action requise / إجراء مطلوب"}
            </span>
          }
          delay="animate-delay-4"
        />

        <div className="stat-card gov-card-accent animate-fade-in-up animate-delay-5 flex flex-col items-center py-6">
          <ComplianceRing score={metrics.complianceScore} />
        </div>

        <StatCard
          accent="gov-card-accent-blue"
          iconBg="bg-blue-50"
          icon={Heart}
          iconColor="text-blue-500"
          label="Cotisations Sociales"
          value={formatShortDZD(metrics.totalCNAS)}
          subtitle={
            <span className="text-blue-500">
              CNAS — {employees.length} employés
            </span>
          }
          delay="animate-delay-1"
        />

        <StatCard
          accent="gov-card-accent-purple"
          iconBg="bg-violet-50"
          icon={FileText}
          iconColor="text-violet-500"
          label="Documents en Attente"
          value={String(metrics.pendingDocs)}
          subtitle={<span className="text-violet-500">À traiter / قيد المعالجة</span>}
          delay="animate-delay-2"
        />

        <StatCard
          accent="gov-card-accent-teal"
          iconBg="bg-teal-50"
          icon={Shield}
          iconColor="text-teal-600"
          label="Audit Status"
          value="Aucun audit"
          subtitle={
            <span className="text-teal-600">
              Aucun audit en cours / لا يوجد تدقيق
            </span>
          }
          delay="animate-delay-3"
        />
      </div>

      {/* ====== Revenue Chart ====== */}
      <div className="gov-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="gov-section-title">Revenus & Impôts Mensuels</h2>
            <p className="gov-section-subtitle">
              الإيرادات والضرائب الشهرية — Exercice 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setChartPeriod("monthly")}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  chartPeriod === "monthly" ? "bg-white shadow-soft text-[#0C4A2E]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setChartPeriod("quarterly")}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  chartPeriod === "quarterly" ? "bg-white shadow-soft text-[#0C4A2E]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Trimestriel
              </button>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1 cursor-pointer" onClick={exportToCSV}>
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartPeriod === "monthly" ? revenueData : [
            { month: "T1", revenu: 37500000, impots: 7125000 },
            { month: "T2", revenu: 43500000, impots: 8265000 },
            { month: "T3", revenu: 42600000, impots: 8094000 },
            { month: "T4", revenu: 48300000, impots: 9177000 },
          ]}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0C4A2E" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#0C4A2E" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8860B" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#B8860B" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickFormatter={(v) => `${v / 1000000}M`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatDZD(value),
                name === "revenu" ? "Revenu" : "Impôts",
              ]}
              labelStyle={{ fontSize: 12, fontWeight: 600 }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenu"
              name="Revenu HT"
              stroke="#0C4A2E"
              fill="url(#revenueGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="impots"
              name="Impôts"
              stroke="#B8860B"
              fill="url(#taxGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ====== Tax Obligations Table ====== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="gov-section-title">Obligations Fiscales</h2>
            <p className="gov-section-subtitle">الالتزامات الجبائية</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs gap-1 cursor-pointer" onClick={exportToCSV}>
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Impôt / الضريبة</th>
                  <th>Période</th>
                  <th>Échéance</th>
                  <th className="text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {taxObligations.map((tax) => {
                  const info = TAX_NAMES[tax.tax_type];
                  return (
                    <tr key={tax.id} className="cursor-pointer">
                      <td>
                        <PaymentBadge
                          status={tax.status as "paid" | "pending" | "overdue"}
                        />
                      </td>
                      <td>
                        <p className="font-medium text-gray-800 text-sm">
                          {info?.name.split(" — ")[0] || tax.tax_type}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {info?.nameAr.split(" — ")[0]}
                        </p>
                      </td>
                      <td className="text-sm text-gray-600">{tax.period}</td>
                      <td className="text-sm text-gray-500">{tax.due_date}</td>
                      <td className="text-right font-bold dzd-badge text-sm">
                        {formatDZD(tax.tax_amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-sm">
                    Total / المجموع
                  </td>
                  <td className="text-right font-extrabold dzd-badge text-sm text-[#0C4A2E]">
                    {formatDZD(taxObligations.reduce((s, t) => s + t.tax_amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ====== Activity Timeline ====== */}
      <ActivityTimeline />

      {/* ====== Tax Breakdown BarChart + Declaration Progress ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Breakdown Bar Chart */}
        <div className="gov-card p-6">
          <div className="mb-4">
            <h2 className="gov-section-title">Répartition par Impôt</h2>
            <p className="gov-section-subtitle">
              التوزيع حسب الضريبة — Payé vs En attente
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={taxBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickFormatter={(v) => `${v / 1000}K`}
              />
              <Tooltip
                formatter={(value: number) => formatDZD(value)}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              />
              <Legend />
              <Bar dataKey="Payé" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="En attente" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Declaration Progress Bars */}
        <div className="gov-card p-6">
          <div className="mb-4">
            <h2 className="gov-section-title">Progression des Déclarations</h2>
            <p className="gov-section-subtitle">تقدم التصريحات الضريبية</p>
          </div>
          <div className="space-y-4">
            {metrics.taxProgress.map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1">
                      {item.nameAr}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#0C4A2E]">
                    {item.progress}%
                  </span>
                </div>
                <Progress value={item.progress} className="h-2" />
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {item.paid}/{item.total} déclarées
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== Upcoming Deadlines ====== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="gov-section-title">Échéances à Venir</h2>
            <p className="gov-section-subtitle">الآجال القادمة</p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs gap-1 cursor-pointer">
            <Link href="/notifications">Voir tout</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {deadlines
            .filter((d) => d.status !== "done")
            .sort((a, b) => {
              const urgOrder: Record<string, number> = {
                overdue: 0,
                urgent: 1,
                soon: 2,
                normal: 3,
              };
              return (
                (urgOrder[a.urgency] ?? 3) - (urgOrder[b.urgency] ?? 3) ||
                new Date(a.deadline_date).getTime() -
                  new Date(b.deadline_date).getTime()
              );
            })
            .slice(0, 5)
            .map((dl) => {
              const days = daysUntil(dl.deadline_date);
              return (
                <div
                  key={dl.id}
                  className={`urgency-${dl.urgency} stat-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        dl.deadline_type === "tax"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                          : dl.deadline_type === "social"
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gradient-to-br from-violet-500 to-purple-600"
                      } shadow-soft`}
                    >
                      {dl.deadline_type === "tax" ? (
                        <Receipt className="h-4 w-4 text-white" />
                      ) : dl.deadline_type === "social" ? (
                        <Heart className="h-4 w-4 text-white" />
                      ) : (
                        <FileText className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{dl.title}</p>
                      <p className="text-[10px] text-gray-400">{dl.title_ar}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {dl.amount && (
                      <span className="text-sm font-bold dzd-badge text-gray-700">
                        {formatShortDZD(dl.amount)}
                      </span>
                    )}
                    <UrgencyBadge
                      status={dl.urgency as "overdue" | "urgent" | "soon" | "normal"}
                    />
                    <div className="text-right min-w-[70px]">
                      <p className="text-[11px] font-medium text-gray-600">
                        {dl.deadline_date}
                      </p>
                      <p
                        className={`text-[10px] ${
                          days < 0
                            ? "text-red-500"
                            : days <= 3
                              ? "text-orange-500"
                              : "text-gray-400"
                        }`}
                      >
                        {days < 0
                          ? `${Math.abs(days)}j retard`
                          : days === 0
                            ? "Aujourd'hui"
                            : `${days}j restants`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ====== Quick Action Cards ====== */}
      <div>
        <h2 className="gov-section-title mb-3">Actions Rapides / إجراءات سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/declarations" className="cursor-pointer group">
            <div className="stat-card p-5 flex items-center gap-3 card-hover group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-soft group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Déclarations</p>
                <p className="text-[10px] text-gray-400">
                  Nouvelle déclaration fiscale / تصريح جبائي جديد
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
            </div>
          </Link>

          <Link href="/documents" className="cursor-pointer group">
            <div className="stat-card p-5 flex items-center gap-3 card-hover group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-soft group-hover:scale-110 transition-transform">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Documents</p>
                <p className="text-[10px] text-gray-400">
                  Gestion documentaire / إدارة الوثائق
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
            </div>
          </Link>

          <Link href="/services" className="cursor-pointer group">
            <div className="stat-card p-5 flex items-center gap-3 card-hover group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-soft group-hover:scale-110 transition-transform">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Services</p>
                <p className="text-[10px] text-gray-400">
                  Calculatrices & aides / حاسبات ومساعدات
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
            </div>
          </Link>
        </div>
      </div>

      {/* ====== Fiscal Year Summary ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gov-card p-6">
          <h2 className="gov-section-title mb-4">
            Bilan Exercice 2026 / ميزانية السنة المالية
          </h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={fiscalSummaryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {fiscalSummaryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatDZD(value)}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2">
            {fiscalSummaryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gov-card p-6">
          <h2 className="gov-section-title mb-4">
            Détail Exercice 2026 / تفصيل السنة المالية
          </h2>
          <div className="space-y-5">
            <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                Payé / مدفوع
              </p>
              <p className="text-2xl font-extrabold text-emerald-700 dzd-badge">
                {formatShortDZD(metrics.totalPaid)}
              </p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                En attente / قيد الانتظار
              </p>
              <p className="text-2xl font-extrabold text-amber-700 dzd-badge">
                {formatShortDZD(metrics.totalPending)}
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                En retard / متأخر
              </p>
              <p className="text-2xl font-extrabold text-red-600 dzd-badge">
                {formatShortDZD(metrics.totalOverdue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
