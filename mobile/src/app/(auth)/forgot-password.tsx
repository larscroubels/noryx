import { Link } from "expo-router";
import { useState } from "react";

import { forgotPasswordSchema } from "@/lib/validation/auth";

import { useT } from "~/i18n";
import { authErrorMessage } from "~/lib/auth-errors";
import { fieldErrors, type FieldErrors } from "~/lib/form";
import { SITE_URL, supabase } from "~/lib/supabase";
import { AuthLayout } from "~/ui/AuthLayout";
import { Button } from "~/ui/Button";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";

export default function ForgotPassword() {
  const { t } = useT();
  const f = t.auth.forgot;
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<{ tone: "success" | "danger"; message: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  async function submit() {
    const parsed = forgotPasswordSchema(t).safeParse({ email: email.trim() });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setBusy(true);
    // The new password is chosen on the website, like a reset requested there.
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${SITE_URL}/auth/confirm?next=/reset-password`,
    });
    setBusy(false);
    // As on the website: the same answer whether or not the account exists.
    setResult(
      error?.code === "over_request_rate_limit" || error?.code === "over_email_send_rate_limit"
        ? { tone: "danger", message: authErrorMessage("signUp", error, t) }
        : { tone: "success", message: t.auth.messages.resetSent },
    );
  }

  return (
    <AuthLayout
      title={f.title}
      lead={f.lead}
      footer={
        <Link href="/sign-in" asChild>
          <Button variant="ghost">{f.backToSignIn}</Button>
        </Link>
      }
    >
      {result ? <Notice tone={result.tone} message={result.message} /> : null}
      <Field
        label={t.auth.fields.email}
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        onSubmitEditing={submit}
      />
      <Button onPress={submit} loading={busy}>
        {f.submit}
      </Button>
    </AuthLayout>
  );
}
