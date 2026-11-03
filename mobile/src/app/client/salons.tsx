import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { listLinks, unlinkSalon, type ClientCategory, type ClientLink } from "~/client/api";
import { CategoryIcon } from "~/client/CategoryIcon";
import { linkErrorMessage } from "~/client/errors";
import { CATEGORY_ORDER, categoryLabel } from "~/client/links";
import { linkCodes, replaceSalon } from "~/client/manage-links";
import { useT } from "~/i18n";
import { useAccount } from "~/lib/account-context";
import { colors, radius, TOUCH } from "~/theme/tokens";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { ErrorState } from "~/ui/ErrorState";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Screen } from "~/ui/Screen";
import { Sheet } from "~/ui/Sheet";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

type Editor =
  | { kind: "add" }
  | { kind: "addService"; link: ClientLink }
  | { kind: "replace"; link: ClientLink }
  | { kind: "unlink"; link: ClientLink };

/** Add, replace or unlink salons. Unlinking never cancels anything. */
export default function Salons() {
  const { t, app } = useT();
  const s = app.client.salons;
  const queryClient = useQueryClient();
  const { refetch: refetchAccount } = useAccount();
  const links = useQuery({ queryKey: ["client", "links"], queryFn: listLinks });
  const [editor, setEditor] = useState<Editor | null>(null);
  const [code, setCode] = useState("");
  const [categories, setCategories] = useState<ClientCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function open(next: Editor) {
    setEditor(next);
    setCode("");
    setError(null);
    setCategories(next.kind === "replace" ? next.link.categories : []);
  }

  function done(message: string) {
    setEditor(null);
    setNotice(message);
    refetchAccount();
    void queryClient.invalidateQueries({ queryKey: ["client"] });
  }

  async function save() {
    if (!editor || editor.kind === "unlink") return;
    setBusy(true);
    setError(null);
    const existing = links.data ?? [];
    const outcome =
      editor.kind === "replace"
        ? await replaceSalon(editor.link.business_id, code, categories, existing)
        : ((
            await linkCodes(
              categories.map((category) => ({ category, code })),
              existing,
            )
          )
            .values()
            .next().value ?? { ok: false as const, error: "categories_required" });
    setBusy(false);
    if (!outcome.ok) return setError(linkErrorMessage(outcome.error, t, app));
    done(editor.kind === "replace" ? s.replaced(outcome.name) : s.added(outcome.name));
  }

  async function unlink(link: ClientLink) {
    setBusy(true);
    try {
      await unlinkSalon(link.business_id);
      done(s.unlinked(link.name));
    } catch {
      setError(app.common.loadFailed);
    } finally {
      setBusy(false);
    }
  }

  const title = <Stack.Screen options={{ headerShown: true, title: s.title }} />;
  if (links.isPending)
    return (
      <>
        {title}
        <Skeleton label={app.common.loading} lines={5} />
      </>
    );
  if (links.isError) {
    return (
      <>
        {title}
        <Screen scroll={false}>
          <ErrorState
            message={app.common.loadFailed}
            retryLabel={app.common.retry}
            onRetry={() => void links.refetch()}
          />
        </Screen>
      </>
    );
  }

  const active = links.data.filter((l) => l.unlinked_at === null);
  const previous = links.data.filter((l) => l.unlinked_at !== null);
  const editing = editor && editor.kind !== "unlink" ? editor : null;
  const choosable =
    editing?.kind === "addService"
      ? CATEGORY_ORDER.filter((c) => !editing.link.categories.includes(c))
      : CATEGORY_ORDER;

  return (
    <>
      {title}
      <Screen>
        {notice ? <Notice tone="success" message={notice} /> : null}
        <Card>
          <Text variant="heading" accessibilityRole="header">
            {s.linked}
          </Text>
          {active.map((link) => (
            <View key={link.business_id} style={styles.salon}>
              <Text variant="heading">{link.name}</Text>
              <Text color="fg-muted">
                {link.categories.map((c) => categoryLabel(c, t)).join(" · ")}
              </Text>
              <View style={styles.actions}>
                <Button variant="secondary" onPress={() => open({ kind: "addService", link })}>
                  {s.addService}
                </Button>
                <Button variant="secondary" onPress={() => open({ kind: "replace", link })}>
                  {s.replace}
                </Button>
                <Button variant="ghost" onPress={() => setEditor({ kind: "unlink", link })}>
                  {s.unlink}
                </Button>
              </View>
            </View>
          ))}
          <Button onPress={() => open({ kind: "add" })}>{s.add}</Button>
        </Card>

        {previous.length > 0 ? (
          <Card>
            <Text variant="heading" accessibilityRole="header">
              {s.previous}
            </Text>
            {previous.map((link) => (
              <Text key={link.business_id} color="fg-muted">
                {link.name}
              </Text>
            ))}
          </Card>
        ) : null}
      </Screen>

      {editing ? (
        <Sheet
          visible
          onClose={() => setEditor(null)}
          closeLabel={app.common.close}
          title={
            editing.kind === "add"
              ? s.add
              : editing.kind === "replace"
                ? `${s.replace}: ${editing.link.name}`
                : `${s.addService}: ${editing.link.name}`
          }
        >
          <Field
            label={s.code}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="ATEL-7KQ2MX"
            error={error ?? undefined}
          />
          <Text variant="label">{s.services}</Text>
          <View style={styles.chips} accessibilityRole="list">
            {choosable.map((category) => {
              const selected = categories.includes(category);
              return (
                <Pressable
                  key={category}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() =>
                    setCategories((list) =>
                      selected ? list.filter((c) => c !== category) : [...list, category],
                    )
                  }
                  style={[styles.chip, selected && styles.selected]}
                >
                  <CategoryIcon
                    category={category}
                    size={20}
                    color={selected ? colors["primary-fg"] : colors["fg-accent"]}
                  />
                  <Text variant="label" color={selected ? "primary-fg" : "fg"}>
                    {categoryLabel(category, t)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Button
            loading={busy}
            disabled={!code.trim() || categories.length === 0}
            onPress={() => void save()}
            haptic
          >
            {s.save}
          </Button>
        </Sheet>
      ) : null}

      {editor?.kind === "unlink" ? (
        <Sheet
          visible
          onClose={() => setEditor(null)}
          closeLabel={app.common.close}
          title={s.unlinkTitle(editor.link.name)}
        >
          <Text>{s.unlinkText}</Text>
          {error ? <Notice tone="danger" message={error} /> : null}
          <Button variant="danger" loading={busy} onPress={() => void unlink(editor.link)}>
            {s.unlinkConfirm}
          </Button>
        </Sheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  salon: {
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: TOUCH,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors["border-strong"],
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
