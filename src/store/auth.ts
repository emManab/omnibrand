import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types";
import { supabase, supabaseEnabled } from "@/lib/supabase";

type AuthState = {
  user: Profile | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

function localUsers() {
  try {
    return JSON.parse(localStorage.getItem("omnibrand.users") || "[]") as {
      email: string;
      password: string;
      profile: Profile;
    }[];
  } catch {
    return [];
  }
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      hydrate: async () => {
        if (!supabaseEnabled || !supabase) return;
        const { data } = await supabase.auth.getUser();
        const u = data.user;
        if (!u) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .maybeSingle();
        const role =
          (profile?.role as Profile["role"]) ||
          (u.app_metadata?.role === "admin" ? "admin" : "customer");
        set({
          user: {
            id: u.id,
            email: u.email ?? "",
            fullName: profile?.full_name ?? u.email?.split("@")[0] ?? "Account",
            role,
          },
        });
      },
      signIn: async (email, password) => {
        if (supabaseEnabled && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          const u = data.user;
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", u.id)
            .maybeSingle();
          set({
            user: {
              id: u.id,
              email: u.email ?? email,
              fullName: profile?.full_name ?? email.split("@")[0],
              role: (profile?.role as Profile["role"]) ?? "customer",
            },
          });
          return;
        }
        const users = localUsers();
        const found = users.find((u) => u.email === email && u.password === password);
        if (email === "admin@omnibrand.com" && password === "admin123") {
          set({
            user: {
              id: "admin-local",
              email,
              fullName: "Studio admin",
              role: "admin",
            },
          });
          return;
        }
        if (!found) throw new Error("No account matches that email and password.");
        set({ user: found.profile });
      },
      signUp: async (email, password, fullName) => {
        if (supabaseEnabled && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
          if (error) throw error;
          const u = data.user;
          if (!u) throw new Error("Check your email to confirm the account.");
          set({
            user: {
              id: u.id,
              email,
              fullName,
              role: "customer",
            },
          });
          return;
        }
        const users = localUsers();
        if (users.some((u) => u.email === email)) {
          throw new Error("An account already exists for that email.");
        }
        const profile: Profile = {
          id: crypto.randomUUID(),
          email,
          fullName,
          role: "customer",
        };
        localStorage.setItem(
          "omnibrand.users",
          JSON.stringify([...users, { email, password, profile }]),
        );
        set({ user: profile });
      },
      signOut: async () => {
        if (supabaseEnabled && supabase) await supabase.auth.signOut();
        set({ user: null });
      },
    }),
    { name: "omnibrand.auth", partialize: (s) => ({ user: s.user }) },
  ),
);
