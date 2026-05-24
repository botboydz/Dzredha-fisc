"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Landmark, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas / كلمات المرور غير متطابقة");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères / يجب أن تتكون كلمة المرور من 8 أحرف على الأقل");
      return;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre / يجب أن تحتوي كلمة المرور على حرف صغير وحرف كبير ورقم على الأقل");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-100/40 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="rounded-2xl border-emerald-100/60 shadow-xl shadow-emerald-500/5 bg-white/90 backdrop-blur-xl">
            <CardContent className="pt-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-4">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Vérifiez votre e-mail / تحقق من بريدك الإلكتروني
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Nous avons envoyé un lien de confirmation à <strong className="text-emerald-700">{email}</strong>.
                Cliquez sur le lien pour activer votre compte.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Aller à la connexion / الانتقال إلى تسجيل الدخول
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-100/40 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & brand */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="DZ-Fisc" width={64} height={64} className="rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-extrabold text-gray-900">
            DZ-Fisc
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Créer votre compte / إنشاء حسابك
          </p>
        </div>

        {/* Signup card */}
        <Card className="rounded-2xl border-emerald-100/60 shadow-xl shadow-emerald-500/5 bg-white/90 backdrop-blur-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 font-semibold text-xs">
                  Nom complet / الاسم الكامل
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Mohamed Ben Ahmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

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
                    className="pl-10 h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold text-xs">
                  Mot de passe / كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold text-xs">
                  Confirmer le mot de passe / تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
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
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création...
                  </span>
                ) : (
                  <>
                    Créer le compte / إنشاء الحساب
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-3 pb-6">
            <div className="w-full border-t border-gray-100 my-2" />
            <p className="text-sm text-gray-500">
              Déjà un compte؟ / لديك حساب بالفعل؟{" "}
              <a
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Se connecter / تسجيل الدخول
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

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-6">
          DZ-Fisc v1.0 — Conformité fiscale algérienne automatisée
        </p>
      </div>
    </div>
  );
}
