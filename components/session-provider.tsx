"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface SessionState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionState>({
  user: null,
  profile: null,
  loading: true,
  configured: false,
  refresh: async () => {},
  signOut: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = supabaseConfigured();

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!configured) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();

      if (!active) return;
      setUser(sessionUser ?? null);

      if (sessionUser) {
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();
        if (active) setProfile(profileRow ?? null);
      }

      if (active) setLoading(false);
    }

    void bootstrap();

    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((_event, sessionUser) => {
      if (!active) return;
      setUser(sessionUser?.user ?? null);
      setLoading(false);
      if (!sessionUser) setProfile(null);
      else {
        void createClient()
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (active) setProfile(data ?? null);
          });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  async function refresh() {
    if (!configured) return;
    const supabase = createClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();
    setUser(sessionUser ?? null);
    if (sessionUser) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();
      setProfile(data ?? null);
    } else {
      setProfile(null);
    }
  }

  async function signOut() {
    if (!configured) return;
    await createClient().auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <SessionContext.Provider value={{ user, profile, loading, configured, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}