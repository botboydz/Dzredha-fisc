"use client";

import React, { useState } from "react";
import {
  Settings,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  BarChart3,
  ShieldAlert,
  MapPin,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { DeclarationBadge } from "@/components/gov/status-badge";
import { AdminSkeleton } from "@/components/skeletons";
import { useLoadingState } from "@/hooks/use-loading-state";

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_PENDING_REVIEWS = [
  { id: "DEC-007", company: "SARL TechAlger", nif: "00016A2026XXXX", type: "TAP", period: "Mai 2026", amount: 145000, status: "submitted" as const, risk: "low" },
  { id: "DEC-008", company: "EURL BatiPlus", nif: "00016B2026XXXX", type: "TVA", period: "Mai 2026", amount: 3200000, status: "submitted" as const, risk: "medium" },
  { id: "DEC-009", company: "SPA HydroDZ", nif: "00016C2026XXXX", type: "IBS", period: "T1 2026", amount: 8900000, status: "submitted" as const, risk: "high" },
  { id: "DEC-010", company: "SARL ServicesPro", nif: "00016D2026XXXX", type: "IRG", period: "Mai 2026", amount: 230000, status: "submitted" as const, risk: "low" },
  { id: "DEC-011", company: "EURL TransportExpress", nif: "00016E2026XXXX", type: "TAP", period: "Avril 2026", amount: 45000, status: "submitted" as const, risk: "high" },
  { id: "DEC-012", company: "SARL AgroPlus", nif: "00016F2026XXXX", type: "TVA", period: "Mai 2026", amount: 1250000, status: "submitted" as const, risk: "medium" },
];

const MOCK_REVENUE_DATA = [
  { month: "Jan", TAP: 1200000, TVA: 22800000, IBS: 4500000, IRG: 890000 },
  { month: "Fév", TAP: 1100000, TVA: 21500000, IBS: 4200000, IRG: 820000 },
  { month: "Mar", TAP: 1350000, TVA: 25600000, IBS: 5100000, IRG: 950000 },
  { month: "Avr", TAP: 1400000, TVA: 26600000, IBS: 5300000, IRG: 980000 },
  { month: "Mai", TAP: 1500000, TVA: 28500000, IBS: 5700000, IRG: 1050000 },
  { month: "Jun", TAP: 1450000, TVA: 27600000, IBS: 5500000, IRG: 1010000 },
];

const MOCK_FRAUD_DATA = [
  { id: "FR-001", company: "EURL TransportExpress", nif: "00016E2026XXXX", riskScore: 92, flag: "TAP < 0.3% du CA", amount: 45000 },
  { id: "FR-002", company: "SPA HydroDZ", nif: "00016C2026XXXX", riskScore: 78, flag: "Déduction > 80% du CA", amount: 8900000 },
  { id: "FR-003", company: "SARL BatiPlus", nif: "00016B2026XXXX", riskScore: 65, flag: "TVA déclarée incohérente", amount: 3200000 },
  { id: "FR-004", company: "EURI ServicesPro", nif: "00016D2026XXXX", riskScore: 30, flag: "RAS", amount: 230000 },
  { id: "FR-005", company: "SARL AgroPlus", nif: "00016F2026XXXX", riskScore: 55, flag: "Retard récurrent", amount: 1250000 },
];

const RISK_COLORS = ["#16A34A", "#D97706", "#EA580C", "#DC2626"];

const MOCK_RISK_DISTRIBUTION = [
  { name: "Faible", value: 45, color: "#16A34A" },
  { name: "Moyen", value: 30, color: "#D97706" },
  { name: "Élevé", value: 15, color: "#EA580C" },
  { name: "Critique", value: 10, color: "#DC2626" },
];

const MOCK_REGIONAL_DATA: Record<string, { collections: number; rate: number; taxpayers: number }> = {
  "Alger": { collections: 125000000, rate: 92, taxpayers: 45000 },
  "Oran": { collections: 85000000, rate: 88, taxpayers: 28000 },
  "Constantine": { collections: 65000000, rate: 85, taxpayers: 22000 },
  "Annaba": { collections: 45000000, rate: 82, taxpayers: 15000 },
  "Sétif": { collections: 38000000, rate: 79, taxpayers: 12000 },
  "Blida": { collections: 42000000, rate: 84, taxpayers: 14000 },
  "Tizi Ouzou": { collections: 32000000, rate: 77, taxpayers: 10000 },
  "Batna": { collections: 28000000, rate: 75, taxpayers: 9000 },
};

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

/* ------------------------------------------------------------------ */
/*  Admin Page                                                         */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("reviews");
  const [selectedWilaya, setSelectedWilaya] = useState("Alger");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const loading = useLoadingState(500);

  // Overview stats
  const totalDeclarations = 1247;
  const pendingReviews = MOCK_PENDING_REVIEWS.length;
  const revenueCollected = 487500000;
  const fraudAlerts = MOCK_FRAUD_DATA.filter((f) => f.riskScore > 60).length;

  if (loading) {
    return <AdminSkeleton />;
  }

  return (
    <div className="space-y-6 view-enter">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#0C4A2E]" />
          Administration / الإدارة
        </h1>
        <p className="text-xs text-gray-500 mt-1">Portail d&apos;administration DZ-Fisc</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="gov-card gov-card-accent p-5 animate-fade-in-up animate-delay-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Déclarations</span>
          </div>
          <p className="text-2xl font-extrabold text-[#0C4A2E] animate-count">{totalDeclarations.toLocaleString()}</p>
        </div>

        <div className="gov-card gov-card-accent-orange p-5 animate-fade-in-up animate-delay-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">En Attente</span>
          </div>
          <p className="text-2xl font-extrabold text-orange-600 animate-count">{pendingReviews}</p>
        </div>

        <div className="gov-card gov-card-accent-green p-5 animate-fade-in-up animate-delay-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recettes Collectées</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dzd-badge animate-count">{formatShortDZD(revenueCollected)}</p>
        </div>

        <div className="gov-card gov-card-accent-red p-5 animate-fade-in-up animate-delay-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alertes Fraude</span>
          </div>
          <p className="text-2xl font-extrabold text-red-600 animate-count">{fraudAlerts}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger value="reviews" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            File d&apos;attente
          </TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Recettes
          </TabsTrigger>
          <TabsTrigger value="fraud" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Fraude
          </TabsTrigger>
          <TabsTrigger value="regional" className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer">
            Statistiques Régionales
          </TabsTrigger>
        </TabsList>

        {/* Review Queue Tab */}
        <TabsContent value="reviews" className="mt-4">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Réf</th>
                    <th>Entreprise</th>
                    <th>Type</th>
                    <th>Période</th>
                    <th>Risque</th>
                    <th className="text-right">Montant</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PENDING_REVIEWS.map((dec) => (
                    <tr key={dec.id}>
                      <td className="font-mono text-xs">{dec.id}</td>
                      <td>
                        <p className="text-sm font-medium">{dec.company}</p>
                        <p className="text-[9px] text-gray-400 font-mono">{dec.nif}</p>
                      </td>
                      <td><DeclarationBadge status={dec.status} /></td>
                      <td className="text-sm">{dec.period}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                          dec.risk === "high" ? "bg-red-50 text-red-700 border-red-200" :
                          dec.risk === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {dec.risk === "high" ? "Élevé" : dec.risk === "medium" ? "Moyen" : "Faible"}
                        </span>
                      </td>
                      <td className="text-right font-bold dzd-badge text-sm">{formatDZD(dec.amount)}</td>
                      <td>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-0.5 cursor-pointer px-2"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50 gap-0.5 cursor-pointer px-2"
                          >
                            <XCircle className="h-3 w-3" />
                            Rejeter
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="mt-4 space-y-6">
          <div className="gov-card p-6">
            <h3 className="gov-section-title mb-4">Recettes par Type d&apos;Impôt / الإيرادات حسب نوع الضريبة</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MOCK_REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#666" }} />
                <YAxis tick={{ fontSize: 10, fill: "#999" }} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip
                  formatter={(value: number) => formatShortDZD(value)}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Legend />
                <Bar dataKey="TAP" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="TVA" fill="#0C4A2E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="IBS" fill="#B8860B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="IRG" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="gov-card p-6">
            <h3 className="gov-section-title mb-4">Tendance Mensuelle / الاتجاه الشهري</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={MOCK_REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#666" }} />
                <YAxis tick={{ fontSize: 10, fill: "#999" }} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip
                  formatter={(value: number) => formatShortDZD(value)}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Legend />
                <Line type="monotone" dataKey="TAP" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="TVA" stroke="#0C4A2E" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="gov-section-title mb-3">Transactions Signalées / المعاملات المشبوهة</h3>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Entreprise</th>
                        <th>Score Risque</th>
                        <th>Motif</th>
                        <th className="text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_FRAUD_DATA.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <p className="text-sm font-medium">{item.company}</p>
                            <p className="text-[9px] text-gray-400 font-mono">{item.nif}</p>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${item.riskScore}%`,
                                    backgroundColor: item.riskScore > 70 ? "#DC2626" : item.riskScore > 50 ? "#D97706" : "#16A34A",
                                  }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${
                                item.riskScore > 70 ? "text-red-600" : item.riskScore > 50 ? "text-amber-600" : "text-emerald-600"
                              }`}>
                                {item.riskScore}%
                              </span>
                            </div>
                          </td>
                          <td className="text-xs text-gray-600">{item.flag}</td>
                          <td className="text-right font-bold dzd-badge text-sm">{formatShortDZD(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="gov-card p-6">
              <h3 className="gov-section-title mb-4">Distribution du Risque / توزيع المخاطر</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={MOCK_RISK_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {MOCK_RISK_DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Regional Stats Tab */}
        <TabsContent value="regional" className="mt-4 space-y-6">
          <div className="flex items-center gap-3">
            <Label className="text-xs font-semibold text-gray-500">Wilaya / الولاية</Label>
            <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
              <SelectTrigger className="w-48 h-9 rounded-xl cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(MOCK_REGIONAL_DATA).map((w) => (
                  <SelectItem key={w} value={w} className="cursor-pointer">{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="gov-card p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Recettes / الإيرادات</p>
              <p className="text-2xl font-extrabold text-[#0C4A2E] dzd-badge">
                {formatShortDZD(MOCK_REGIONAL_DATA[selectedWilaya]?.collections || 0)}
              </p>
            </div>
            <div className="gov-card p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Taux de Collecte / معدل التحصيل</p>
              <p className="text-2xl font-extrabold text-emerald-700">
                {MOCK_REGIONAL_DATA[selectedWilaya]?.rate || 0}%
              </p>
            </div>
            <div className="gov-card p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Contribuables / المكلفون</p>
              <p className="text-2xl font-extrabold text-gray-800">
                {(MOCK_REGIONAL_DATA[selectedWilaya]?.taxpayers || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="gov-card p-6">
            <h3 className="gov-section-title mb-4">Taux de Collecte par Wilaya / معدل التحصيل حسب الولاية</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={Object.entries(MOCK_REGIONAL_DATA).map(([name, data]) => ({ name, rate: data.rate }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#999" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#666" }} width={80} />
                <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="rate" fill="#0C4A2E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
