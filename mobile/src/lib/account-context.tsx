import { useQuery } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loadAccount, type Account } from "./account";
import { useSession } from "./session";
import { chooseSide, getLastSide, rememberSide, type Side } from "./side";

type AccountValue = {
  status: "loading" | "error" | "ready";
  account: Account | null;
  userId: string | null;
  /** Where the app should go: a side, or the picker when both apply. */
  side: Side | "pick" | null;
  setSide: (side: Side) => void;
  /** True when the user can switch sides (team member with client links). */
  canSwitch: boolean;
  /** The active business on the salon side, re-validated against the memberships. */
  businessId: string | null;
  setBusinessId: (businessId: string) => void;
  refetch: () => void;
};

const AccountContext = createContext<AccountValue | null>(null);
const BUSINESS_KEY = "noryx.business";

export function AccountProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [lastSide, setLastSide] = useState<Side | null | undefined>(undefined);
  const [preferred, setPreferred] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    void getLastSide().then(setLastSide);
    void SecureStore.getItemAsync(BUSINESS_KEY).then(setPreferred);
  }, []);

  const query = useQuery({
    queryKey: ["account", userId],
    queryFn: () => loadAccount(userId!),
    enabled: Boolean(userId),
  });

  const setSide = useCallback((side: Side) => {
    setLastSide(side);
    void rememberSide(side);
  }, []);

  const setBusinessId = useCallback((businessId: string) => {
    setPreferred(businessId);
    void SecureStore.setItemAsync(BUSINESS_KEY, businessId);
  }, []);

  const value = useMemo<AccountValue>(() => {
    const account = query.data ?? null;
    const ready = account !== null && lastSide !== undefined && preferred !== undefined;
    const memberships = account?.memberships ?? [];
    const business = memberships.find((m) => m.business.id === preferred) ?? memberships[0];
    return {
      status: query.isError ? "error" : ready ? "ready" : "loading",
      account,
      userId,
      side: ready
        ? chooseSide({
            memberships: account.memberships.length,
            links: account.links.length,
            lastSide: lastSide ?? null,
          })
        : null,
      setSide,
      canSwitch: Boolean(account && account.memberships.length > 0 && account.links.length > 0),
      businessId: business?.business.id ?? null,
      setBusinessId,
      refetch: () => void query.refetch(),
    };
  }, [query, lastSide, preferred, userId, setSide, setBusinessId]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountValue {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount() must be used inside <AccountProvider>.");
  return value;
}
