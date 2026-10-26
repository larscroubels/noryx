import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

import { signUpSchema } from "@/lib/validation/auth";

import { useT } from "~/i18n";
import { authErrorMessage } from "~/lib/auth-errors";
import { fieldErrors, type FieldErrors } from "~/lib/form";
import { SITE_URL, supabase } from "~/lib/supabase";
import { colors, TOUCH } from "~/theme/tokens";
import { AuthLayout } from "~/ui/AuthLayout";
import { Button } from "~/ui/Button";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Text } from "~/ui/Text";

export default function SignUp() {
  const { t, app } = useT();
  const s = t.auth.signup;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setFailure(null);
    const parsed = signUpSchema(t).safeParse({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      terms: terms ? "on" : undefined,
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
        // Client accounts confirm on the website, then come back to the app.
        emailRedirectTo: `${SITE_URL}/auth/confirm?next=${encodeURIComponent("/apps")}`,
      },
    });
    setBusy(false);
    if (error) return setFailure(authErrorMessage("signUp", error, t));
    // With confirmation off Supabase signs in at once; the session listener takes over.
    if (!data.session) setSentTo(parsed.data.email);
  }

  if (sentTo) {
    return (
      <AuthLayout title={s.checkInbox}>
        <Notice tone="success" message={t.auth.messages.confirmationSent(sentTo)} />
        <Text color="fg-muted">{s.noEmail}</Text>
        <Button variant="secondary" onPress={() => setSentTo(null)}>
          {s.tryAgain}
        </Button>
        <Link href="/sign-in" asChild>
          <Button variant="ghost">{s.signIn}</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={s.title}
      lead={app.auth.signUpLead}
      footer={
        <>
          <Text color="fg-muted">{s.haveAccount}</Text>
          <Link href="/sign-in" asChild>
            <Button variant="ghost">{s.signIn}</Button>
          </Link>
        </>
      }
    >
      {failure ? <Notice tone="danger" message={failure} /> : null}
      <Field
        label={t.auth.fields.yourName}
        value={fullName}
        onChangeText={setFullName}
        error={errors.fullName}
        autoComplete="name"
        textContentType="name"
      />
      <Field
        label={t.auth.fields.email}
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        label={t.auth.fields.password}
        hint={t.auth.passwordHint}
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: terms }}
        onPress={() => setTerms(!terms)}
        style={styles.terms}
      >
        <Switch
          value={terms}
          onValueChange={setTerms}
          trackColor={{ true: colors.primary }}
          accessibilityLabel={app.auth.termsLabel}
        />
        <Text style={styles.termsText}>{app.auth.termsLabel}</Text>
      </Pressable>
      {errors.terms ? (
        <Text variant="caption" color="danger-700">
          {errors.terms}
        </Text>
      ) : null}
      <View style={styles.links}>
        <Button variant="ghost" onPress={() => WebBrowser.openBrowserAsync(`${SITE_URL}/terms`)}>
          {app.auth.readTerms}
        </Button>
        <Button variant="ghost" onPress={() => WebBrowser.openBrowserAsync(`${SITE_URL}/privacy`)}>
          {app.auth.readPrivacy}
        </Button>
      </View>
      <Button onPress={submit} loading={busy} haptic>
        {s.submit}
      </Button>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  terms: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: TOUCH },
  termsText: { flex: 1 },
  links: { flexDirection: "row", flexWrap: "wrap" },
});
