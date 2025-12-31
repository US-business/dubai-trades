"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Language } from "./types";
import { translations } from "./translations";
import { validateEmail } from "./utils";
import { EmailSentState } from "./EmailSentState";
import { ForgotPasswordFormFields } from "./ForgotPasswordFormFields";

interface ForgotPasswordFormProps {
  lang: Language;
}

export function ForgotPasswordForm({ lang }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const isRTL = lang === "ar";
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t.emailRequired);
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t.emailInvalid);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, lang }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success(t.successTitle);
      } else {
        toast.error(data.error || t.errorSending);
      }
    } catch (error) {
      // console.error("Forgot password error:", error);
      toast.error(t.errorSending);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return <EmailSentState lang={lang} translations={t} isRTL={isRTL} />;
  }

  return (
    <ForgotPasswordFormFields
      lang={lang}
      email={email}
      isLoading={isLoading}
      isRTL={isRTL}
      translations={t}
      onEmailChange={setEmail}
      onSubmit={handleSubmit}
    />
  );
}
