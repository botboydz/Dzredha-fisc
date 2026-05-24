"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Smartphone,
  Monitor,
  Globe,
  Lock,
  Key,
  Eye,
  EyeOff,
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_LOGIN_ACTIVITY = [
  { id: 1, date: "2026-05-24 08:32", ip: "197.15.xxx.xxx", device: "Chrome / macOS", location: "Alger, DZ", status: "success" },
  { id: 2, date: "2026-05-23 14:15", ip: "197.15.xxx.xxx", device: "Safari / iOS", location: "Alger, DZ", status: "success" },
  { id: 3, date: "2026-05-22 09:45", ip: "41.220.xxx.xxx", device: "Firefox / Windows", location: "Oran, DZ", status: "success" },
  { id: 4, date: "2026-05-20 22:10", ip: "102.156.xxx.xxx", device: "Chrome / Android", location: "Constantine, DZ", status: "failed" },
  { id: 5, date: "2026-05-20 22:12", ip: "102.156.xxx.xxx", device: "Chrome / Android", location: "Constantine, DZ", status: "success" },
  { id: 6, date: "2026-05-19 08:00", ip: "197.15.xxx.xxx", device: "Chrome / macOS", location: "Alger, DZ", status: "success" },
  { id: 7, date: "2026-05-18 16:30", ip: "197.15.xxx.xxx", device: "Edge / Windows", location: "Alger, DZ", status: "success" },
  { id: 8, date: "2026-05-17 10:20", ip: "41.220.xxx.xxx", device: "Chrome / Linux", location: "Oran, DZ", status: "success" },
  { id: 9, date: "2026-05-15 07:45", ip: "197.15.xxx.xxx", device: "Safari / macOS", location: "Alger, DZ", status: "failed" },
  { id: 10, date: "2026-05-15 07:48", ip: "197.15.xxx.xxx", device: "Safari / macOS", location: "Alger, DZ", status: "success" },
];

const MOCK_ACTIVE_SESSIONS = [
  { id: 1, device: "Chrome / macOS", ip: "197.15.xxx.xxx", location: "Alger, DZ", lastActive: "Actif maintenant", current: true },
  { id: 2, device: "Safari / iOS", ip: "197.15.xxx.xxx", location: "Alger, DZ", lastActive: "Il y a 2 heures", current: false },
  { id: 3, device: "Chrome / Android", ip: "102.156.xxx.xxx", location: "Constantine, DZ", lastActive: "Il y a 4 jours", current: false },
];

const MOCK_SECURITY_EVENTS = [
  { id: 1, type: "login", message: "Connexion réussie depuis Alger", date: "2026-05-24 08:32" },
  { id: 2, type: "password_change", message: "Mot de passe modifié avec succès", date: "2026-05-20 14:00" },
  { id: 3, type: "alert", message: "Tentative de connexion échouée depuis Constantine", date: "2026-05-20 22:10" },
  { id: 4, type: "2fa", message: "2FA activé sur le compte", date: "2026-05-18 10:00" },
  { id: 5, type: "login", message: "Nouvelle connexion depuis Oran", date: "2026-05-22 09:45" },
];

const MOCK_AUDIT_LOG = [
  { id: 1, timestamp: "2026-05-24 08:35", user: "Admin", action: "Consultation", details: "Tableau de bord consulté" },
  { id: 2, timestamp: "2026-05-24 08:32", user: "Admin", action: "Connexion", details: "Authentification réussie" },
  { id: 3, timestamp: "2026-05-23 14:20", user: "Admin", action: "Soumission", details: "Déclaration TAP Mai 2026" },
  { id: 4, timestamp: "2026-05-22 09:50", user: "Admin", action: "Export", details: "Export rapport mensuel" },
  { id: 5, timestamp: "2026-05-20 22:12", user: "Admin", action: "Connexion", details: "Connexion depuis nouvel appareil" },
];

const BACKUP_CODES = ["A3B7-K9M2", "P4Q8-R1S6", "T5U0-V2W4", "X6Y8-Z0A1", "B2C4-D6E8", "F0G2-H4I6"];

/* ------------------------------------------------------------------ */
/*  Security Page                                                      */
/* ------------------------------------------------------------------ */

export default function SecurityPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [smsNotif, setSmsNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const securityScore = twoFAEnabled ? 85 : 65;

  return (
    <div className="space-y-6 view-enter">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#0C4A2E]" />
          Sécurité & Confiance / الأمان والثقة
        </h1>
        <p className="text-xs text-gray-500 mt-1">Gérez la sécurité de votre compte et vos paramètres de confiance</p>
      </div>

      {/* Security Score */}
      <div className="gov-card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <svg width="100" height="100" className="compliance-ring">
              <circle cx="50" cy="50" r="40" className="compliance-ring-track" />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="compliance-ring-fill"
                stroke={securityScore >= 80 ? "#16A34A" : securityScore >= 60 ? "#D97706" : "#DC2626"}
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 - (securityScore / 100) * 2 * Math.PI * 40}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold" style={{ color: securityScore >= 80 ? "#16A34A" : "#D97706" }}>
                {securityScore}
              </span>
              <span className="text-[8px] text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h3 className="text-sm font-bold text-[#1A1A1A]">Score de Sécurité / نقاط الأمان</h3>
            <Progress value={securityScore} className="h-2" />
            <p className="text-xs text-gray-500">
              {securityScore >= 80
                ? "Votre compte est bien protégé / حسابك محمي جيداً"
                : "Activez la 2FA pour améliorer votre sécurité / فعّل المصادقة الثنائية"}
            </p>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="gov-card gov-card-accent-green p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="gov-section-title text-emerald-700">Session Sécurisée / جلسة آمنة</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Dernière connexion</p>
            <p className="font-medium text-gray-700">24 Mai 2026, 08:32</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Adresse IP</p>
            <p className="font-mono text-gray-700">197.15.xxx.xxx</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Appareil / Navigateur</p>
            <p className="font-medium text-gray-700">Chrome / macOS</p>
          </div>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gov-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[#0C4A2E]" />
              <h3 className="gov-section-title">Authentification 2FA / المصادقة الثنائية</h3>
            </div>
            <Switch
              checked={twoFAEnabled}
              onCheckedChange={setTwoFAEnabled}
              className="cursor-pointer"
            />
          </div>

          {twoFAEnabled ? (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                2FA activé — Votre compte est protégé / المصادقة الثنائية مفعّلة
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                className="text-xs gap-1 cursor-pointer"
              >
                {showBackupCodes ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showBackupCodes ? "Masquer" : "Afficher"} les codes de secours
              </Button>
              {showBackupCodes && (
                <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3">
                  {BACKUP_CODES.map((code) => (
                    <span key={code} className="font-mono text-xs font-bold text-gray-700 text-center py-1 bg-white rounded border">
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Ajoutez une couche de sécurité supplémentaire à votre compte en activant l&apos;authentification
                à deux facteurs.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg h-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-[10px] font-bold text-gray-400">QR CODE</span>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-[#0C4A2E] hover:bg-[#166534] text-white text-xs gap-1 cursor-pointer">
                <Key className="h-3.5 w-3.5" />
                Activer la 2FA / تفعيل المصادقة الثنائية
              </Button>
            </div>
          )}
        </div>

        {/* Password Change */}
        <div className="gov-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#0C4A2E]" />
            <h3 className="gov-section-title">Changer le Mot de Passe / تغيير كلمة المرور</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-500">Mot de passe actuel</Label>
              <div className="relative mt-1">
                <Input type={showPassword ? "text" : "password"} className="h-9 rounded-xl pr-10" placeholder="••••••••" />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Nouveau mot de passe</Label>
              <Input type="password" className="h-9 rounded-xl mt-1" placeholder="••••••••" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Confirmer le mot de passe</Label>
              <Input type="password" className="h-9 rounded-xl mt-1" placeholder="••••••••" />
            </div>
            <Button className="w-full bg-[#0C4A2E] hover:bg-[#166534] text-white text-xs gap-1 cursor-pointer">
              <Lock className="h-3.5 w-3.5" />
              Mettre à jour / تحديث
            </Button>
          </div>
        </div>
      </div>

      {/* Login Activity */}
      <div>
        <h2 className="gov-section-title mb-3">Activité de Connexion / نشاط تسجيل الدخول</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>IP</th>
                  <th>Appareil</th>
                  <th>Localisation</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LOGIN_ACTIVITY.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs font-mono text-gray-600">{log.date}</td>
                    <td className="text-xs font-mono">{log.ip}</td>
                    <td className="text-xs">{log.device}</td>
                    <td className="text-xs">{log.location}</td>
                    <td>
                      {log.status === "success" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Réussi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <AlertTriangle className="h-3 w-3" /> Échoué
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Device Management */}
      <div>
        <h2 className="gov-section-title mb-3">Appareils Actifs / الأجهزة النشطة</h2>
        <div className="space-y-2">
          {MOCK_ACTIVE_SESSIONS.map((session) => (
            <div key={session.id} className="gov-card p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                {session.device.includes("iOS") || session.device.includes("Android") ? (
                  <Smartphone className="h-4 w-4 text-gray-600" />
                ) : (
                  <Monitor className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {session.device}
                  {session.current && (
                    <span className="ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Cet appareil
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400">
                  {session.ip} · {session.location} · {session.lastActive}
                </p>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm" className="text-[10px] text-red-600 border-red-200 hover:bg-red-50 gap-1 cursor-pointer">
                  Révoquer / إلغاء
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Notifications */}
      <div>
        <h2 className="gov-section-title mb-3">Événements de Sécurité / أحداث أمنية</h2>
        <div className="space-y-2">
          {MOCK_SECURITY_EVENTS.map((event) => (
            <div key={event.id} className="gov-card p-3 flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                event.type === "alert" ? "bg-red-50" : event.type === "2fa" ? "bg-emerald-50" : "bg-blue-50"
              }`}>
                {event.type === "alert" ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> :
                 event.type === "2fa" ? <Shield className="h-3.5 w-3.5 text-emerald-500" /> :
                 <Globe className="h-3.5 w-3.5 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">{event.message}</p>
                <p className="text-[9px] text-gray-400">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Toggles */}
      <div className="gov-card p-6 space-y-4">
        <h3 className="gov-section-title">Notifications de Connexion / إشعارات تسجيل الدخول</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Notification SMS</p>
                <p className="text-[10px] text-gray-400">Recevez un SMS à chaque connexion / إشعار SMS</p>
              </div>
            </div>
            <Switch checked={smsNotif} onCheckedChange={setSmsNotif} className="cursor-pointer" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Notification Email</p>
                <p className="text-[10px] text-gray-400">Recevez un email à chaque connexion / إشعار بالبريد</p>
              </div>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} className="cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div>
        <h2 className="gov-section-title mb-3">Journal d&apos;Audit / سجل التدقيق</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Horodatage</th>
                  <th>Utilisateur</th>
                  <th>Action</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_AUDIT_LOG.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs font-mono text-gray-600">{log.timestamp}</td>
                    <td className="text-xs font-medium">{log.user}</td>
                    <td className="text-xs">{log.action}</td>
                    <td className="text-xs text-gray-500">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
