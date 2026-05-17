"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, type Company } from "@/lib/supabase";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_id: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  companyId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const supabaseConfigured = useMemo(() => isSupabaseConfigured(), []);
  const supabase = supabaseConfigured ? getSupabaseBrowserClient() : null;
  const initializedRef = useRef(false);

  const fetchProfileAndCompany = useCallback(
    async (userId: string) => {
      if (!supabase) return;

      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);

          if (profileData.company_id) {
            const { data: companyData } = await supabase
              .from("companies")
              .select("*")
              .eq("id", profileData.company_id)
              .single();

            if (companyData) {
              setCompany(companyData as Company);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching profile/company:", err);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    // Get initial session
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfileAndCompany(currentUser.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfileAndCompany(session.user.id);
      } else {
        setProfile(null);
        setCompany(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfileAndCompany]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "Supabase is not configured" };

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!supabase) return { error: "Supabase is not configured" };

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCompany(null);
  }, [supabase]);

  const value: AuthContextType = {
    user,
    profile,
    company,
    companyId: company?.id ?? profile?.company_id ?? null,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
