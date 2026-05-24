"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Landmark, Mail, Lock, ArrowRight, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/";
  const redirect = redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-emerald-100/60 shadow-elevated bg-white/95 backdrop-blur-xl">
      <CardContent className="pt-6">
        {/* Security badges */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="security-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Shield className="h-3 w-3" />
            Sécurisé
          </div>
          <div className="security-badge bg-amber-50 text-amber-700 border border-amber-200">
            <Globe className="h-3 w-3" />
            Officiel DGI
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold text-xs">
              Adresse e-mail / البريد الإلكتروني
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="vous@entreprise.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-11 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-700 font-semibold text-xs">
                Mot de passe / كلمة المرور
              </Label>
              <a href="#" className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium">
                Mot de passe oublié?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 h-11 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion...
              </span>
            ) : (
              <>
                Se connecter / تسجيل الدخول
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-3 pb-6">
        <div className="w-full border-t border-gray-100 my-2" />
        <p className="text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <a
            href="/signup"
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Créer un compte / إنشاء حساب
          </a>
        </p>
        <a
          href="/"
          className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
        >
          Continuer en mode démo / المتابعة في وضع العرض
        </a>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-100/40 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-card mb-4">
            <Image src="/logo.png" alt="DZ-Fisc" width={48} height={48} className="rounded-xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            DZ-Fisc
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Conformité Fiscale & Sociale / الامتثال الضريبي والاجتماعي
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Direction Générale des Impôts — Ministère des Finances
          </p>
        </div>

        {/* Login card with Suspense for useSearchParams */}
        <Suspense fallback={
          <Card className="rounded-2xl border-emerald-100/60 shadow-elevated bg-white/95 backdrop-blur-xl">
            <CardContent className="pt-6 flex items-center justify-center py-12">
              <span className="h-6 w-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
            </CardContent>
          </Card>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-6">
          DZ-Fisc v2.0 — République Algérienne Démocratique et Populaire
        </p>
        <p className="text-center text-[9px] text-gray-300 mt-1">
          الجمهورية الجزائرية الديمقراطية الشعبية
        </p>
      </div>
    </div>
  );
}
