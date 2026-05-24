"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { type Company } from "@/lib/supabase";

// Demo company ID — used when no user is authenticated so the app shows real data
const DEMO_COMPANY_ID = "c0000000-0000-0000-0000-000000000001";

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

  const supabase = useMemo(() => isSupabaseConfigured() ? getSupabaseBrowserClient() : null, []);

  // Use a ref to track whether auth initialization is complete
  // This is more robust than initializedRef because it survives React Strict Mode remounts
  const authInitialized = useRef(false);

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
      // If Supabase is not configured, immediately set loading=false
      // This allows the app to render in demo mode
      setLoading(false);
      return;
    }

    // Guard against double initialization in React Strict Mode
    if (authInitialized.current) return;
    authInitialized.current = true;

    let mounted = true;
    let safetyTimeout: ReturnType<typeof setTimeout> | null = null;

    // Safety timeout: ensure loading=false within 5 seconds even if Supabase hangs
    // This timeout is NOT cleared by the getUser() promise — it's a hard deadline
    safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("[Auth] Safety timeout reached — forcing loading=false");
        setLoading(false);
      }
    }, 5000);

    // Get initial session
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (!mounted) return;
      if (safetyTimeout) clearTimeout(safetyTimeout);
      setUser(currentUser);
      if (currentUser) {
        fetchProfileAndCompany(currentUser.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        // No user — demo mode: fetch the demo company so the dashboard works
        supabase
          .from("companies")
          .select("*")
          .eq("id", DEMO_COMPANY_ID)
          .single()
          .then(({ data: demoCompany }) => {
            if (mounted && demoCompany) setCompany(demoCompany as Company);
            if (mounted) setLoading(false);
          })
          .catch(() => {
            if (mounted) setLoading(false);
          });
      }
    }).catch((err) => {
      if (!mounted) return;
      if (safetyTimeout) clearTimeout(safetyTimeout);
      console.error("[Auth] getUser() failed:", err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfileAndCompany(session.user.id);
      } else {
        setProfile(null);
        // In demo mode: fetch the demo company data so it's available
        // even when no user is authenticated
        try {
          const { data: demoCompany } = await supabase
            .from("companies")
            .select("*")
            .eq("id", DEMO_COMPANY_ID)
            .single();
          if (demoCompany) setCompany(demoCompany as Company);
        } catch {
          setCompany(null);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (safetyTimeout) clearTimeout(safetyTimeout);
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

  // When not authenticated but Supabase is configured, provide the demo company
  // so that the dashboard and other pages can display real data from Supabase
  const effectiveCompanyId = useMemo(() => {
    if (company?.id) return company.id;
    if (profile?.company_id) return profile.company_id;
    // Demo mode: if Supabase is configured but user isn't logged in,
    // use the demo company ID so pages can read real data
    if (isSupabaseConfigured() && !user && !loading) return DEMO_COMPANY_ID;
    return null;
  }, [company?.id, profile?.company_id, user, loading]);

  const value: AuthContextType = {
    user,
    profile,
    company,
    companyId: effectiveCompanyId,
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
