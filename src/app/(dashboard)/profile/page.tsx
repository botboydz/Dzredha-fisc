"use client";

import React, { useState } from "react";
import {
  User,
  Building2,
  MapPin,
  FileText,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";

/* ------------------------------------------------------------------ */
/*  Profile Page                                                       */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const { user, profile, company } = useAuth();
  const [editing, setEditing] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "Utilisateur Demo",
    email: user?.email || "demo@dz-fisc.dz",
    phone: "+213 555 123 456",
    companyName: company?.name || "SARL Demo Algérie",
    nif: company?.nif || "00016XXXXXXXXX",
    nis: company?.nis || "16XXXXXX",
    ai: company?.ai || "16XXXXXXX",
    rc: company?.rc || "16/00-XXXXXXX",
    wilaya: company?.wilaya || "Alger",
    address: company?.address || "123 Rue Didouche Mourad, Alger Centre",
    activityType: company?.activity_type || "Services informatiques",
    taxRegime: company?.tax_regime || "Réel",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 view-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <User className="h-5 w-5 text-[#0C4A2E]" />
            Profil & Paramètres / الملف الشخصي والإعدادات
          </h1>
          <p className="text-xs text-gray-500 mt-1">Gérez vos informations personnelles et professionnelles</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
                className="text-xs gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() => setEditing(false)}
                className="bg-[#0C4A2E] hover:bg-[#166534] text-white text-xs gap-1 cursor-pointer"
              >
                <Save className="h-3 w-3" />
                Enregistrer / حفظ
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setEditing(true)}
              className="bg-[#0C4A2E] hover:bg-[#166534] text-white text-xs gap-1 cursor-pointer"
            >
              <Edit3 className="h-3 w-3" />
              Modifier / تعديل
            </Button>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="gov-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-[#0C4A2E]" />
          <h2 className="gov-section-title">Informations Personnelles / المعلومات الشخصية</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-gray-500">Nom complet / الاسم الكامل</Label>
            {editing ? (
              <Input
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className="mt-1 h-10 rounded-xl"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-gray-800">{formData.fullName}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">Email / البريد الإلكتروني</Label>
            {editing ? (
              <Input
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="mt-1 h-10 rounded-xl"
                type="email"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-gray-800">{formData.email}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">Téléphone / الهاتف</Label>
            {editing ? (
              <Input
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="mt-1 h-10 rounded-xl"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-gray-800">{formData.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="gov-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-4 w-4 text-[#0C4A2E]" />
          <h2 className="gov-section-title">Détails de l&apos;Entreprise / تفاصيل الشركة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-gray-500">Raison Sociale / اسم الشركة</Label>
            {editing ? (
              <Input
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className="mt-1 h-10 rounded-xl"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-gray-800">{formData.companyName}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">NIF (Numéro d&apos;Identification Fiscale)</Label>
            {editing ? (
              <Input
                value={formData.nif}
                onChange={(e) => updateField("nif", e.target.value)}
                className="mt-1 h-10 rounded-xl font-mono"
              />
            ) : (
              <p className="mt-1 text-sm font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                {formData.nif}
              </p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">NIS (Numéro d&apos;Identification Statistique)</Label>
            {editing ? (
              <Input
                value={formData.nis}
                onChange={(e) => updateField("nis", e.target.value)}
                className="mt-1 h-10 rounded-xl font-mono"
              />
            ) : (
              <p className="mt-1 text-sm font-mono text-gray-800">{formData.nis}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">AI (Article d&apos;Imposition)</Label>
            {editing ? (
              <Input
                value={formData.ai}
                onChange={(e) => updateField("ai", e.target.value)}
                className="mt-1 h-10 rounded-xl font-mono"
              />
            ) : (
              <p className="mt-1 text-sm font-mono text-gray-800">{formData.ai}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">RC (Registre du Commerce)</Label>
            {editing ? (
              <Input
                value={formData.rc}
                onChange={(e) => updateField("rc", e.target.value)}
                className="mt-1 h-10 rounded-xl font-mono"
              />
            ) : (
              <p className="mt-1 text-sm font-mono text-gray-800">{formData.rc}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">Wilaya / الولاية</Label>
            {editing ? (
              <Input
                value={formData.wilaya}
                onChange={(e) => updateField("wilaya", e.target.value)}
                className="mt-1 h-10 rounded-xl"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-gray-800 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                {formData.wilaya}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs font-semibold text-gray-500">Adresse / العنوان</Label>
            {editing ? (
              <Input
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="mt-1 h-10 rounded-xl"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-800">{formData.address}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">Type d&apos;Activité / نوع النشاط</Label>
            {editing ? (
              <Input
                value={formData.activityType}
                onChange={(e) => updateField("activityType", e.target.value)}
                className="mt-1 h-10 rounded-xl"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-800">{formData.activityType}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-500">Régime Fiscal / النظام الجبائي</Label>
            {editing ? (
              <Input
                value={formData.taxRegime}
                onChange={(e) => updateField("taxRegime", e.target.value)}
                className="mt-1 h-10 rounded-xl"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                {formData.taxRegime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="gov-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-[#0C4A2E]" />
          <h2 className="gov-section-title">Informations du Compte / معلومات الحساب</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">ID du compte</p>
            <p className="font-mono text-xs text-gray-600">{user?.id || "demo-user"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Rôle</p>
            <p className="font-medium text-gray-800">{profile?.role || "Administrateur"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Date de création</p>
            <p className="text-gray-800">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-DZ") : "15 Jan 2026"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
