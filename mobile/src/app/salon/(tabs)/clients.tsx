import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useT } from "~/i18n";
import { searchCustomers } from "~/lib/customers";
import { useWorkspace } from "~/lib/workspace";
import { colors, TOUCH } from "~/theme/tokens";
import { Card } from "~/ui/Card";
import { EmptyState } from "~/ui/EmptyState";
import { ErrorState } from "~/ui/ErrorState";
import { Field } from "~/ui/Field";
import { Screen } from "~/ui/Screen";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

/** Waits until typing pauses before searching. */
function useDebounced(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

export default function Clients() {
  const { t, app } = useT();
  const { business, can } = useWorkspace();
  const c = t.customers;
  const [term, setTerm] = useState("");
  const q = useDebounced(term.trim(), 300);

  const query = useQuery({
    queryKey: ["customers", business.id, q],
    queryFn: () => searchCustomers(business.id, q),
    placeholderData: (previous) => previous,
  });

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <Field
        label={c.searchLabel}
        placeholder={c.searchPlaceholder}
        value={term}
        onChangeText={setTerm}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {!can("customers.view") ? (
        <Text variant="caption" color="fg-muted">
          {c.ownOnly}
        </Text>
      ) : null}
      {query.isPending ? (
        <Skeleton label={app.common.loading} lines={6} />
      ) : query.isError ? (
        <ErrorState
          message={app.common.loadFailed}
          retryLabel={app.common.retry}
          onRetry={() => void query.refetch()}
        />
      ) : query.data.length === 0 ? (
        q ? (
          <EmptyState title={c.noMatch} text={c.noMatchText} />
        ) : (
          <EmptyState title={c.empty} />
        )
      ) : (
        <Card>
          {query.data.map((customer) => {
            const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ");
            return (
              <Pressable
                key={customer.id}
                accessibilityRole="button"
                accessibilityLabel={name}
                onPress={() => router.push(`/salon/client/${customer.id}`)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.grow}>
                  <Text variant="heading" numberOfLines={1}>
                    {name}
                  </Text>
                  {customer.email || customer.phone ? (
                    <Text color="fg-muted" numberOfLines={1}>
                      {customer.email ?? customer.phone}
                    </Text>
                  ) : null}
                </View>
                <ChevronRight size={20} color={colors["fg-subtle"]} />
              </Pressable>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  grow: { flex: 1 },
});
