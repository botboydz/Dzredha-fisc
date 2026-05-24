"use client";

import React, { useState } from "react";
import {
  FolderOpen,
  Search,
  Download,
  Eye,
  Grid3X3,
  List,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DocumentBadge } from "@/components/gov/status-badge";
import { DocumentsSkeleton } from "@/components/skeletons";
import { useLoadingState } from "@/hooks/use-loading-state";

/* ------------------------------------------------------------------ */
/*  Mock Documents                                                     */
/* ------------------------------------------------------------------ */

const MOCK_DOCUMENTS = [
  {
    id: "DOC-001",
    title: "Déclaration TAP — Avril 2026",
    titleAr: "تصريح ض.م.م — أفريل 2026",
    type: "declaration",
    category: "Déclarations",
    status: "valid" as const,
    date: "2026-04-19",
    size: "245 KB",
  },
  {
    id: "DOC-002",
    title: "Attestation de Conformité Fiscale",
    titleAr: "شهادة الامتثال الجبائي",
    type: "attestation",
    category: "Attestations",
    status: "valid" as const,
    date: "2026-03-15",
    size: "180 KB",
  },
  {
    id: "DOC-003",
    title: "Reçu Paiement TVA — Mars 2026",
    titleAr: "إيصال دفع ر.ق — مارس 2026",
    type: "receipt",
    category: "Reçus",
    status: "valid" as const,
    date: "2026-03-20",
    size: "120 KB",
  },
  {
    id: "DOC-004",
    title: "Bordereau CNAS — Avril 2026",
    titleAr: "قسيم ص.و.ت.ش — أفريل 2026",
    type: "social",
    category: "Cotisations",
    status: "pending" as const,
    date: "2026-04-30",
    size: "310 KB",
  },
  {
    id: "DOC-005",
    title: "Liasse Fiscale 2025",
    titleAr: "الملف الجبائي 2025",
    type: "declaration",
    category: "Déclarations",
    status: "expired" as const,
    date: "2025-12-31",
    size: "1.2 MB",
  },
  {
    id: "DOC-006",
    title: "Certificat de Situation Fiscale",
    titleAr: "شهادة الحالة الجبائية",
    type: "attestation",
    category: "Attestations",
    status: "valid" as const,
    date: "2026-05-01",
    size: "95 KB",
  },
  {
    id: "DOC-007",
    title: "Reçu Paiement IBS — T1 2026",
    titleAr: "إيصال دفع ض.أ.ش — ت1 2026",
    type: "receipt",
    category: "Reçus",
    status: "valid" as const,
    date: "2026-04-28",
    size: "135 KB",
  },
  {
    id: "DOC-008",
    title: "Avis d'Imposition — Taxe Foncière",
    titleAr: "إشعار فرض الضريبة — الضريبة العقارية",
    type: "administrative",
    category: "Administratifs",
    status: "pending" as const,
    date: "2026-06-01",
    size: "210 KB",
  },
];

const CATEGORIES = [
  { value: "all", label: "Toutes / الكل" },
  { value: "declaration", label: "Déclarations / التصريحات" },
  { value: "attestation", label: "Attestations / الشهادات" },
  { value: "receipt", label: "Reçus / الإيصالات" },
  { value: "social", label: "Cotisations / الاشتراكات" },
  { value: "administrative", label: "Administratifs / إدارية" },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  declaration: FileText,
  attestation: CheckCircle2,
  receipt: Download,
  social: Clock,
  administrative: AlertTriangle,
};

const TYPE_COLORS: Record<string, string> = {
  declaration: "from-emerald-500 to-teal-600",
  attestation: "from-blue-500 to-indigo-600",
  receipt: "from-violet-500 to-purple-600",
  social: "from-orange-500 to-red-500",
  administrative: "from-gray-500 to-gray-600",
};

/* ------------------------------------------------------------------ */
/*  Document Detail Dialog                                             */
/* ------------------------------------------------------------------ */

function DocumentDetailDialog({ doc }: { doc: typeof MOCK_DOCUMENTS[0] }) {
  const Icon = TYPE_ICONS[doc.type] || File;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">{doc.title}</DialogTitle>
        </DialogHeader>
        <div className="doc-frame min-h-[200px] flex flex-col items-center justify-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${TYPE_COLORS[doc.type]} shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <p className="text-base font-bold text-gray-800">{doc.title}</p>
          <p className="text-xs text-gray-400">{doc.titleAr}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span>{doc.date}</span>
            <span>{doc.size}</span>
          </div>
          <DocumentBadge status={doc.status} />
          <div className="qr-placeholder mt-4">QR</div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button className="flex-1 bg-[#0C4A2E] hover:bg-[#166534] text-white text-xs gap-1 cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Télécharger / تحميل
          </Button>
          <Button variant="outline" className="flex-1 text-xs gap-1 cursor-pointer">
            <Eye className="h-3.5 w-3.5" />
            Imprimer / طباعة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Documents Page                                                     */
/* ------------------------------------------------------------------ */

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const loading = useLoadingState(500);

  const filteredDocs = MOCK_DOCUMENTS.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <DocumentsSkeleton />;
  }

  return (
    <div className="space-y-6 view-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-[#0C4A2E]" />
            Documents / الوثائق
          </h1>
          <p className="text-xs text-gray-500 mt-1">Centre de gestion documentaire</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 h-10 rounded-xl cursor-pointer">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="cursor-pointer">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`h-8 w-8 p-0 cursor-pointer ${viewMode === "grid" ? "bg-[#0C4A2E] text-white" : ""}`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={`h-8 w-8 p-0 cursor-pointer ${viewMode === "list" ? "bg-[#0C4A2E] text-white" : ""}`}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div className="drop-zone">
        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-500">Glisser-déposer vos documents ici</p>
        <p className="text-[10px] text-gray-400 mt-1">PDF, JPEG, PNG — Max 10 MB par fichier / إسقاط الوثائق هنا</p>
        <Button variant="outline" size="sm" className="mt-3 text-xs gap-1 cursor-pointer">
          <Upload className="h-3 w-3" />
          Parcourir / تصفح
        </Button>
      </div>

      {/* Document Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const Icon = TYPE_ICONS[doc.type] || File;
            return (
              <div key={doc.id} className="doc-frame pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${TYPE_COLORS[doc.type]} shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentBadge status={doc.status} />
                    <div className="qr-placeholder">QR</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-tight">{doc.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{doc.titleAr}</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span>{doc.date}</span>
                  <span>{doc.size}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] gap-1 cursor-pointer">
                    <Download className="h-3 w-3" />
                    Télécharger
                  </Button>
                  <DocumentDetailDialog doc={doc} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const Icon = TYPE_ICONS[doc.type] || File;
            return (
              <div
                key={doc.id}
                className="gov-card p-4 flex items-center gap-4"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${TYPE_COLORS[doc.type]} shadow-md`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
                  <p className="text-[10px] text-gray-400">{doc.titleAr} · {doc.date} · {doc.size}</p>
                </div>
                <DocumentBadge status={doc.status} />
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <DocumentDetailDialog doc={doc} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun document trouvé / لا توجد وثائق</p>
        </div>
      )}
    </div>
  );
}
