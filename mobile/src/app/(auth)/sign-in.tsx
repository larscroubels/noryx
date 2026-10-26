import { Link } from "expo-router";
import { useState } from "react";

import { signInSchema } from "@/lib/validation/auth";

import { useT } from "~/i18n";
import { authErrorMessage } from "~/lib/auth-errors";
import { fieldErrors, type FieldErrors } from "~/lib/form";
import { useSession } from "~/lib/session";
import { isConfigured, supabase } from "~/lib/supabase";
import { AuthLayout } from "~/ui/AuthLayout";
import { Button } from "~/ui/Button";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Text } from "~/ui/Text";

export default function SignIn() {
  const { t, app } = useT();
  const { message, clearMessage } = useSession();
  const l = t.auth.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    clearMessage();
    setFailure(null);
    const parsed = signInSchema(t).safeParse({ email: email.trim(), password });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    // On success the session listener routes into the app.
    if (error) setFailure(authErrorMessage("signIn", error, t));
  }

  return (
    <AuthLayout
      title={l.title}
      lead={l.lead}
      footer={
        <>
          <Text color="fg-muted">{l.newHere}</Text>
          <Link href="/sign-up" asChild>
            <Button variant="ghost">{l.createAccount}</Button>
          </Link>
        </>
      }
    >
      {!isConfigured ? <Notice tone="danger" message={app.auth.notConfigured} /> : null}
      {message ? <Notice tone="info" message={message} /> : null}
      {failure ? <Notice tone="danger" message={failure} /> : null}
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
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={submit}
      />
      <Button onPress={submit} loading={busy} haptic>
        {l.submit}
      </Button>
      <Link href="/forgot-password" asChild>
        <Button variant="ghost">{l.forgot}</Button>
      </Link>
    </AuthLayout>
  );
}
