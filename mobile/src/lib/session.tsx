import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Database } from "@/types/database";

import { onAuthFailure } from "./auth-failure";
import { supabase } from "./supabase";

type Status = "loading" | "signedOut" | "signedIn";

type SessionValue = {
  status: Status;
  session: Session | null;
  /** Shown once on the sign-in screen, e.g. after the session expired. */
  message: string | null;
  clearMessage: () => void;
  signOut: (message?: string) => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Tracks the Supabase session. When it ends — signed out here, or the refresh token
 * is rejected (expired, revoked, account deleted) — cached data is dropped and the
 * app returns to sign-in instead of waiting on requests that will fail.
 */
export function SessionProvider({
  children,
  client = supabase,
  onSignedOut,
  endedMessage,
}: {
  children: ReactNode;
  client?: SupabaseClient<Database>;
  onSignedOut?: () => void;
  /** Shown when the session ends without the user signing out. */
  endedMessage?: string;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const signedOut = useRef(onSignedOut);
  const ended = useRef(endedMessage);
  const userSignedOut = useRef(false);
  useEffect(() => {
    signedOut.current = onSignedOut;
    ended.current = endedMessage;
  }, [onSignedOut, endedMessage]);

  useEffect(() => {
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setStatus(data.session ? "signedIn" : "signedOut");
    });
    const { data } = client.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next);
      if (next) {
        setStatus("signedIn");
      } else if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
        setStatus("signedOut");
        if (event === "SIGNED_OUT") {
          if (!userSignedOut.current) setMessage(ended.current ?? null);
          userSignedOut.current = false;
          signedOut.current?.();
          router.replace("/sign-in");
        }
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  // A request was refused as unauthorised: if Supabase confirms the session is gone,
  // end it on this device (the SIGNED_OUT event shows the "signed out" message).
  useEffect(() => {
    onAuthFailure(() => {
      void client.auth.getUser().then(({ error }) => {
        if (error) void client.auth.signOut({ scope: "local" });
      });
    });
    return () => onAuthFailure(null);
  }, [client]);

  const signOut = useCallback(
    async (reason?: string) => {
      userSignedOut.current = true;
      setMessage(reason ?? null);
      const { error } = await client.auth.signOut();
      // Offline the server can't be told; still end the session on this device.
      if (error) await client.auth.signOut({ scope: "local" });
    },
    [client],
  );

  const value = useMemo<SessionValue>(
    () => ({ status, session, message, clearMessage: () => setMessage(null), signOut }),
    [status, session, message, signOut],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession() must be used inside <SessionProvider>.");
  return value;
}
