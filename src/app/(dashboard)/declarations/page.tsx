"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Save,
  Download,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { DeclarationBadge } from "@/components/gov/status-badge";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DECLARATION_TYPES = [
  { key: "IRG", label: "IRG", labelAr: "ض.د.ع" },
  { key: "IBS", label: "IBS", labelAr: "ض.أ.ش" },
  { key: "TVA", label: "TVA", labelAr: "ر.ق" },
  { key: "TAP", label: "TAP", labelAr: "ض.م.م" },
  { key: "FONCIERE", label: "Taxe Foncière", labelAr: "الضريبة العقارية" },
  { key: "AUTO", label: "Auto-entrepreneur", labelAr: "مستقل" },
];

const STEPS = [
  { num: 1, label: "Informations", labelAr: "المعلومات" },
  { num: 2, label: "Données Financières", labelAr: "البيانات المالية" },
  { num: 3, label: "Calcul", labelAr: "الحساب" },
  { num: 4, label: "Vérification", labelAr: "التحقق" },
];

/* Mock existing declarations */
const MOCK_DECLARATIONS = [
  { id: "DEC-001", type: "TAP", period: "Avril 2026", status: "approved" as const, amount: 132000, date: "2026-04-19" },
  { id: "DEC-002", type: "TVA", period: "Avril 2026", status: "approved" as const, amount: 2480000, date: "2026-04-19" },
  { id: "DEC-003", type: "IBS", period: "T1 2026", status: "submitted" as const, amount: 1850000, date: "2026-04-28" },
  { id: "DEC-004", type: "IRG", period: "Avril 2026", status: "submitted" as const, amount: 78000, date: "2026-04-20" },
  { id: "DEC-005", type: "TAP", period: "Mai 2026", status: "draft" as const, amount: 145000, date: "" },
  { id: "DEC-006", type: "TVA", period: "Mai 2026", status: "rejected" as const, amount: 2755000, date: "2026-05-10" },
];

function formatDZD(amount: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " DZD";
}

/* ------------------------------------------------------------------ */
/*  Step Indicator — Enhanced                                          */
/* ------------------------------------------------------------------ */

function StepIndicator({ currentStep }: { currentStep: number }) {
  const progress = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);
  return (
    <div>
      {/* Progress bar at top */}
      <div className="h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i + 1 < currentStep
                    ? "step-completed shadow-soft"
                    : i + 1 === currentStep
                      ? "step-active shadow-card ring-2 ring-emerald-200"
                      : "step-pending"
                }`}
              >
                {i + 1 < currentStep ? <Check className="h-4 w-4" /> : step.num}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-semibold ${i + 1 === currentStep ? "text-[#0C4A2E]" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className="text-[9px] text-gray-300">{step.labelAr}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded ${i + 1 < currentStep ? "bg-emerald-500" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Declaration Form                                                   */
/* ------------------------------------------------------------------ */

function DeclarationForm({ type, declarations, setDeclarations }: { type: string; declarations: typeof MOCK_DECLARATIONS; setDeclarations: React.Dispatch<React.SetStateAction<typeof MOCK_DECLARATIONS>> }) {
  const { company, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nif: company?.nif || "00016XXXXXXXXX",
    nis: company?.nis || "16XXXXXX",
    companyName: company?.name || "SARL Demo",
    wilaya: company?.wilaya || "Alger",
    revenue: "14500000",
    expenses: "8200000",
    deductions: "500000",
    salaryMass: "575000",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setAutoSaveStatus("saving");
    setTimeout(() => setAutoSaveStatus("saved"), 1000);
    setTimeout(() => setAutoSaveStatus("idle"), 3000);
  };

  const calculations = useMemo(() => {
    const revenue = Number(formData.revenue) || 0;
    const expenses = Number(formData.expenses) || 0;
    const deductions = Number(formData.deductions) || 0;
    const salaryMass = Number(formData.salaryMass) || 0;
    const profit = revenue - expenses - deductions;

    const rates: Record<string, { amount: number; rate: string; base: number }> = {
      TAP: { amount: revenue * 0.01, rate: "1%", base: revenue },
      TVA: { amount: revenue * 0.19, rate: "19%", base: revenue },
      IBS: { amount: profit > 0 ? profit * 0.19 : 0, rate: "19%", base: profit },
      IRG: {
        amount: (() => {
          let irg = 0;
          let remaining = salaryMass;
          const brackets = [
            { limit: 240000, rate: 0 },
            { limit: 360000, rate: 0.2 },
            { limit: 480000, rate: 0.3 },
            { limit: Infinity, rate: 0.35 },
          ];
          let prev = 0;
          for (const b of brackets) {
            const taxable = Math.min(remaining, b.limit - prev);
            if (taxable <= 0) break;
            irg += taxable * b.rate;
            remaining -= taxable;
            prev = b.limit;
          }
          return irg;
        })(),
        rate: "Progressif",
        base: salaryMass,
      },
      FONCIERE: { amount: 0, rate: "3%", base: 0 },
      AUTO: { amount: revenue * 0.005, rate: "0.5%", base: revenue },
    };

    return rates[type] || { amount: 0, rate: "—", base: 0 };
  }, [formData, type]);

  const canAdvance = () => {
    if (step === 1) return formData.nif && formData.companyName;
    if (step === 2) return formData.revenue !== "0";
    if (step === 3) return true;
    return agreed;
  };

  // Validation indicators
  const isValid = (field: string) => {
    if (field === "nif") return formData.nif.length > 5;
    if (field === "companyName") return formData.companyName.length > 2;
    if (field === "revenue") return Number(formData.revenue) > 0;
    return false;
  };

  return (
    <div>
      {/* Auto-save indicator */}
      <div className="flex items-center justify-end gap-2 mb-4">
        {autoSaveStatus === "saving" && (
          <span className="flex items-center gap-1 text-[10px] text-amber-600">
            <Clock className="h-3 w-3 animate-spin" /> Sauvegarde...
          </span>
        )}
        {autoSaveStatus === "saved" && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-600">
            <Check className="h-3 w-3" /> Brouillon sauvegardé
          </span>
        )}
      </div>

      <StepIndicator currentStep={step} />

      {/* Step 1: Informations Contribuable */}
      {step === 1 && (
        <div className="gov-card p-6 space-y-4 mt-4">
          <h3 className="gov-section-title">Informations du Contribuable / معلومات المكلف</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-gray-500">NIF (Numéro d&apos;Identification Fiscale)</Label>
              <div className="relative mt-1">
                <Input
                  value={formData.nif}
                  onChange={(e) => updateField("nif", e.target.value)}
                  className="h-11 rounded-xl pr-8"
                  placeholder="00016XXXXXXXXX"
                />
                {isValid("nif") && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Identifiant fiscal unique à 15 chiffres</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-500">NIS (Numéro d&apos;Identification Statistique)</Label>
              <Input
                value={formData.nis}
                onChange={(e) => updateField("nis", e.target.value)}
                className="mt-1 h-11 rounded-xl"
                placeholder="16XXXXXX"
              />
              <p className="text-[10px] text-gray-400 mt-1">Numéro délivré par l&apos;ONS</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-500">Raison Sociale / اسم الشركة</Label>
              <div className="relative mt-1">
                <Input
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  className="h-11 rounded-xl pr-8"
                />
                {isValid("companyName") && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-500">Wilaya / الولاية</Label>
              <Input
                value={formData.wilaya}
                onChange={(e) => updateField("wilaya", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
              <p className="text-[10px] text-gray-400 mt-1">Wilaya du siège social</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Données Financières */}
      {step === 2 && (
        <div className="gov-card p-6 space-y-4 mt-4">
          <h3 className="gov-section-title">Données Financières / البيانات المالية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-gray-500">
                Chiffre d&apos;affaires HT / رقم الأعمال (بدون ر.ق)
              </Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => updateField("revenue", e.target.value)}
                  className="h-11 rounded-xl pr-12 dzd-badge"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
                {isValid("revenue") && (
                  <CheckCircle2 className="absolute right-16 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Total des ventes hors taxes pour la période</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-500">
                Charges déductibles / المصاريف القابلة للخصم
              </Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={formData.expenses}
                  onChange={(e) => updateField("expenses", e.target.value)}
                  className="h-11 rounded-xl pr-12 dzd-badge"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-500">
                Déductions supplémentaires / خصومات إضافية
              </Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => updateField("deductions", e.target.value)}
                  className="h-11 rounded-xl pr-12 dzd-badge"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
              </div>
            </div>
            {(type === "IRG") && (
              <div>
                <Label className="text-xs font-semibold text-gray-500">
                  Masse salariale brute / الكتلة الأجرية الإجمالية
                </Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    value={formData.salaryMass}
                    onChange={(e) => updateField("salaryMass", e.target.value)}
                    className="h-11 rounded-xl pr-12 dzd-badge"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">DZD</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Total des salaires bruts mensuels</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Calcul */}
      {step === 3 && (
        <div className="space-y-4 mt-4">
          <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-xl p-6 text-white shadow-card">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">
              Montant Calculé — {DECLARATION_TYPES.find((d) => d.key === type)?.label}
            </p>
            <p className="text-emerald-200/60 text-[10px] mb-4">
              {DECLARATION_TYPES.find((d) => d.key === type)?.labelAr}
            </p>
            <p className="text-4xl font-extrabold dzd-badge animate-count">
              {formatDZD(calculations.amount)}
            </p>
            <div className="flex items-center gap-4 mt-4 text-emerald-100 text-xs">
              <span>Taux: {calculations.rate}</span>
              <span>Base: {formatDZD(calculations.base)}</span>
            </div>
          </div>

          <div className="gov-card p-5">
            <h4 className="gov-section-title mb-3">Détail du Calcul / تفصيل الحساب</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Chiffre d&apos;affaires HT</span>
                <span className="font-medium dzd-badge">{formatDZD(Number(formData.revenue) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Charges déductibles</span>
                <span className="font-medium dzd-badge text-red-600">− {formatDZD(Number(formData.expenses) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Déductions supplémentaires</span>
                <span className="font-medium dzd-badge text-red-600">− {formatDZD(Number(formData.deductions) || 0)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-bold text-gray-800">Résultat imposable</span>
                <span className="font-bold dzd-badge text-[#0C4A2E]">
                  {formatDZD((Number(formData.revenue) || 0) - (Number(formData.expenses) || 0) - (Number(formData.deductions) || 0))}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-bold text-[#0C4A2E]">Impôt dû ({calculations.rate})</span>
                <span className="font-extrabold dzd-badge text-[#0C4A2E] text-lg">
                  {formatDZD(calculations.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Vérification & Soumission */}
      {step === 4 && (
        <div className="space-y-4 mt-4">
          <div className="gov-card p-6">
            <h3 className="gov-section-title mb-4">Récapitulatif / ملخص</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{DECLARATION_TYPES.find((d) => d.key === type)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">NIF</span><span className="font-mono text-xs">{formData.nif}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Contribuable</span><span className="font-medium">{formData.companyName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Wilaya</span><span className="font-medium">{formData.wilaya}</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">CA HT</span><span className="font-medium dzd-badge">{formatDZD(Number(formData.revenue) || 0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Taux</span><span className="font-medium">{calculations.rate}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-2"><span className="font-bold text-[#0C4A2E]">Montant dû</span><span className="font-extrabold text-[#0C4A2E] dzd-badge">{formatDZD(calculations.amount)}</span></div>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">Mention Légale / إقرار قانوني</p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Conformément à l&apos;article 115 du Code des Impôts Directs et Taxes Assimilées, toute déclaration inexacte
                  ou incomplète expose le contribuable à une amende fiscale de 10% à 25% du montant éludé, sans préjudice
                  des poursuites pénales prévues par la législation en vigueur.
                </p>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => {
            const files = e.target.files;
            if (files) {
              setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
            }
          }} />
          <div className="drop-zone cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">Glisser-déposer vos justificatifs</p>
            <p className="text-[10px] text-gray-400">PDF, JPEG, PNG — Max 10 MB / إسقاط المستندات هنا</p>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="space-y-1">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                  <FileText className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">{f.name}</span>
                  <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Agreement checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5 cursor-pointer"
            />
            <Label htmlFor="agree" className="text-xs text-gray-600 cursor-pointer">
              J&apos;atteste l&apos;exactitude des informations fournies et reconnais avoir pris connaissance
              des sanctions prévues en cas de fausse déclaration / أقر بصحة المعلومات المقدمة
            </Label>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="gap-1 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-1 cursor-pointer text-xs" onClick={() => {
            const newDec = {
              id: `DEC-${String(declarations.length + 1).padStart(3, "0")}`,
              type,
              period: "Mai 2026",
              status: "draft" as const,
              amount: calculations.amount,
              date: "",
            };
            setDeclarations((prev) => [...prev, newDec]);
            setAutoSaveStatus("saved");
            setTimeout(() => setAutoSaveStatus("idle"), 3000);
          }}>
            <Save className="h-3.5 w-3.5" />
            Sauvegarder
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="bg-[#0C4A2E] hover:bg-[#1A6B42] text-white gap-1 cursor-pointer"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={!agreed || submitStatus === "submitting"}
              onClick={async () => {
                setSubmitStatus("submitting");
                await new Promise((r) => setTimeout(r, 1500));
                const newDec = {
                  id: `DEC-${String(declarations.length + 1).padStart(3, "0")}`,
                  type,
                  period: "Mai 2026",
                  status: "submitted" as const,
                  amount: calculations.amount,
                  date: new Date().toISOString().slice(0, 10),
                };
                setDeclarations((prev) => [...prev, newDec]);
                setSubmitStatus("success");
                setTimeout(() => {
                  setSubmitStatus("idle");
                  setStep(1);
                }, 2000);
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white gap-1 cursor-pointer"
            >
              {submitStatus === "submitting" ? (
                <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
              ) : submitStatus === "success" ? (
                <><Check className="h-4 w-4" /> Soumis!</>
              ) : (
                <><Check className="h-4 w-4" /> Soumettre / إرسال</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Declarations Page                                                  */
/* ------------------------------------------------------------------ */

export default function DeclarationsPage() {
  const [activeType, setActiveType] = useState("TAP");
  const [declarations, setDeclarations] = useState(MOCK_DECLARATIONS);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDeclarations = declarations.filter((d) => {
    const matchesSearch = d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    const matchesType = filterType === "all" || d.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const exportToCSV = () => {
    const headers = ["Réf", "Type", "Période", "Statut", "Montant", "Date"];
    const rows = declarations.map((d) => [
      d.id,
      d.type,
      d.period,
      d.status,
      d.amount.toString(),
      d.date,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dz-fisc-declarations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 view-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0C4A2E]" />
            Déclarations Fiscales / التصريحات الجبائية
          </h1>
          <p className="text-xs text-gray-500 mt-1">Créez et gérez vos déclarations fiscales</p>
        </div>
        <Button className="bg-[#0C4A2E] hover:bg-[#1A6B42] text-white text-xs gap-1 cursor-pointer" onClick={exportToCSV}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {/* Existing declarations with filters */}
      <div>
        <h2 className="gov-section-title mb-3">Déclarations Existantes / التصريحات الموجودة</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Rechercher par réf ou type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl text-xs"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-9 rounded-xl text-xs cursor-pointer">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">Tous les statuts</SelectItem>
              <SelectItem value="draft" className="cursor-pointer">Brouillon</SelectItem>
              <SelectItem value="submitted" className="cursor-pointer">Soumis</SelectItem>
              <SelectItem value="approved" className="cursor-pointer">Approuvé</SelectItem>
              <SelectItem value="rejected" className="cursor-pointer">Rejeté</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-9 rounded-xl text-xs cursor-pointer">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">Tous les types</SelectItem>
              {DECLARATION_TYPES.map((dt) => (
                <SelectItem key={dt.key} value={dt.key} className="cursor-pointer">{dt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Réf</th>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th className="text-right">Montant</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeclarations.map((dec) => (
                  <tr key={dec.id} className="cursor-pointer">
                    <td className="font-mono text-xs">{dec.id}</td>
                    <td className="font-semibold text-sm">{dec.type}</td>
                    <td className="text-sm">{dec.period}</td>
                    <td><DeclarationBadge status={dec.status} /></td>
                    <td className="text-right font-bold dzd-badge text-sm">{formatDZD(dec.amount)}</td>
                    <td className="text-xs text-gray-500">{dec.date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDeclarations.length === 0 && (
          <div className="empty-state py-8">
            <div className="empty-state-icon bg-gray-50">
              <FileText className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">Aucune déclaration trouvée</p>
            <p className="text-[10px] text-gray-300 mt-1">Modifiez vos filtres ou créez une nouvelle déclaration</p>
          </div>
        )}
      </div>

      {/* Declaration type tabs */}
      <div>
        <h2 className="gov-section-title mb-3">Nouvelle Déclaration / تصريح جديد</h2>
        <Tabs value={activeType} onValueChange={setActiveType}>
          <TabsList className="bg-gray-100 p-1 rounded-xl h-auto flex-wrap">
            {DECLARATION_TYPES.map((dt) => (
              <TabsTrigger
                key={dt.key}
                value={dt.key}
                className="text-xs data-[state=active]:bg-[#0C4A2E] data-[state=active]:text-white rounded-lg cursor-pointer"
              >
                {dt.label} <span className="text-[9px] opacity-50 ml-1">{dt.labelAr}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Multi-step form */}
      <DeclarationForm type={activeType} declarations={declarations} setDeclarations={setDeclarations} />
    </div>
  );
}
