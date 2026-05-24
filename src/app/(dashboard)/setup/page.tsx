"use client";

import React, { useState } from "react";
import {
  Database,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Shield,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeedResult {
  success: boolean;
  results?: Record<string, unknown>;
  error?: string;
  instructions?: Record<string, string>;
}

export default function SetupPage() {
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  const runSeed = async () => {
    if (!serviceRoleKey.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-service-role-key": serviceRoleKey.trim(),
        },
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySQL = async () => {
    try {
      const res = await fetch("/api/seed/sql");
      if (res.ok) {
        const sql = await res.text();
        await navigator.clipboard.writeText(sql);
      } else {
        await navigator.clipboard.writeText(
          "Run the SQL file at: supabase/comprehensive-seed.sql"
        );
      }
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    } catch {
      setSqlCopied(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 view-enter">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <Database className="h-5 w-5 text-[#0C4A2E]" />
          Configuration de la Base de Données / إعداد قاعدة البيانات
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Populate your database with realistic Algerian tax compliance test data
        </p>
      </div>

      {/* Status Banner */}
      <div className="gov-card p-4 border-l-4 border-l-emerald-500 bg-emerald-50">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Mode démonstration actif
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              The app is already reading real data from Supabase using the demo
              company (SARL TechAlger). This page adds MORE data: declarations,
              historical records, a second company, audit logs, and a demo user
              account.
            </p>
          </div>
        </div>
      </div>

      {/* Method 1: Service Role Key */}
      <div className="gov-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Key className="h-4 w-4 text-[#0C4A2E]" />
          <h2 className="text-sm font-bold text-[#1A1A1A]">
            Méthode 1: Clé Service Role (Recommandée)
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Supabase Service Role Key
            </label>
            <input
              type="password"
              value={serviceRoleKey}
              onChange={(e) => setServiceRoleKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Get it from: Supabase Dashboard → Settings → API → service_role
              key (secret)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={runSeed}
              disabled={loading || !serviceRoleKey.trim()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold gap-1"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Database className="h-3.5 w-3.5" />
              )}
              {loading
                ? "Seeding..."
                : "Seed Database / remplir la base de données"}
            </Button>

            <a
              href="https://supabase.com/dashboard/project/htwxqoklsnyezddgmika/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Open Supabase Settings
            </a>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div
            className={`p-4 rounded-lg ${result.success ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}
          >
            {result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">
                    Seed Complete!
                  </span>
                </div>
                {result.results && (
                  <div className="text-xs space-y-1">
                    {Object.entries(result.results).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-mono text-gray-800">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {result.results?.demo_user && (
                  <div className="mt-2 p-2 bg-emerald-100 rounded text-xs">
                    <p className="font-semibold">Demo User Created:</p>
                    <p>Email: admin@dzfisc.dz</p>
                    <p>Password: Admin2026!DZ</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">
                    Seed Failed
                  </span>
                </div>
                {result.error && (
                  <p className="text-xs text-red-700">{result.error}</p>
                )}
                {result.instructions && (
                  <div className="text-xs text-gray-600 mt-2">
                    <p className="font-semibold">Alternative methods:</p>
                    <ul className="list-disc ml-4 mt-1">
                      {Object.entries(result.instructions).map(
                        ([key, value]) => (
                          <li key={key}>{value}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Method 2: SQL Editor */}
      <div className="gov-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-[#0C4A2E]" />
          <h2 className="text-sm font-bold text-[#1A1A1A]">
            Méthode 2: Supabase SQL Editor (Manuelle)
          </h2>
        </div>

        <div className="space-y-3">
          <ol className="text-xs text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold shrink-0">
                1
              </span>
              <span>
                Open the Supabase Dashboard SQL Editor:{" "}
                <a
                  href="https://supabase.com/dashboard/project/htwxqoklsnyezddgmika/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  Open SQL Editor
                  <ExternalLink className="h-3 w-3" />
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold shrink-0">
                2
              </span>
              <span>
                Copy the seed SQL from the project file{" "}
                <code className="bg-gray-100 px-1 rounded text-[10px]">
                  supabase/comprehensive-seed.sql
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold shrink-0">
                3
              </span>
              <span>Paste it into the SQL Editor and click &quot;Run&quot;</span>
            </li>
          </ol>

          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={copySQL}
          >
            {sqlCopied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {sqlCopied ? "Copied!" : "Copy SQL to Clipboard"}
          </Button>
        </div>
      </div>

      {/* What gets seeded */}
      <div className="gov-card p-6">
        <h2 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#0C4A2E]" />
          Contenu du Seed / محتوى البذور
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="font-bold text-emerald-800">2 Companies</p>
            <p className="text-emerald-600 mt-1">
              SARL TechAlger + EURL Oran Services
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-bold text-blue-800">25+ Tax Obligations</p>
            <p className="text-blue-600 mt-1">
              TAP, TVA, IRG, IBS Jan–Jun 2026
            </p>
          </div>
          <div className="p-3 bg-violet-50 rounded-lg">
            <p className="font-bold text-violet-800">12 Declarations</p>
            <p className="text-violet-600 mt-1">
              Draft, generated, submitted
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="font-bold text-amber-800">10+ Employees</p>
            <p className="text-amber-600 mt-1">
              With CNAS rates, varied salaries
            </p>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg">
            <p className="font-bold text-teal-800">8+ Social Contributions</p>
            <p className="text-teal-600 mt-1">
              CNAS + CASNOS records
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="font-bold text-red-800">20+ Deadlines</p>
            <p className="text-red-600 mt-1">
              Tax, social, filing deadlines
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="font-bold text-indigo-800">5 Audit Logs</p>
            <p className="text-indigo-600 mt-1">
              INSERT, UPDATE tracked
            </p>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg">
            <p className="font-bold text-pink-800">Demo User</p>
            <p className="text-pink-600 mt-1">
              admin@dzfisc.dz / Admin2026!DZ
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-bold text-gray-800">Auto Profile</p>
            <p className="text-gray-600 mt-1">
              New users get profile automatically
            </p>
          </div>
        </div>
      </div>

      {/* Demo credentials info */}
      <div className="gov-card p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
        <h3 className="text-xs font-bold text-emerald-800 mb-2">
          After seeding, log in with:
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Email:</span>{" "}
            <code className="bg-white px-1.5 py-0.5 rounded font-mono">
              admin@dzfisc.dz
            </code>
          </div>
          <div>
            <span className="text-gray-500">Password:</span>{" "}
            <code className="bg-white px-1.5 py-0.5 rounded font-mono">
              Admin2026!DZ
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
