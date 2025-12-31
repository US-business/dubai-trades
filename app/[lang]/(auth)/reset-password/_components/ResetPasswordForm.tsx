"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Language } from "./types";
import { translations } from "./translations";
import { VerifyingState } from "./VerifyingState";
import { InvalidTokenState } from "./InvalidTokenState";
import { ResetSuccessState } from "./ResetSuccessState";
import { ResetPasswordFormFields } from "./ResetPasswordFormFields";

interface ResetPasswordFormProps {
  lang: Language;
}

export function ResetPasswordForm({ lang }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const isRTL = lang === "ar";
  const t = translations[lang];

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsVerifying(false);
        toast.error(t.invalidToken);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}&lang=${lang}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          toast.error(data.error || t.invalidToken);
        }
      } catch (error) {
        // console.error("Token verification error:", error);
        setTokenValid(false);
        toast.error(t.invalidToken);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, lang, t.invalidToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error(t.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.passwordsNotMatch);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
          lang,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        toast.success(t.successTitle);
        setTimeout(() => {
          router.push(`/${lang}/signin`);
        }, 2000);
      } else {
        toast.error(data.error || t.errorResetting);
      }
    } catch (error) {
      // console.error("Reset password error:", error);
      toast.error(t.errorResetting);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return <VerifyingState message={t.verifying} />;
  }

  if (!tokenValid) {
    return <InvalidTokenState lang={lang} message={t.invalidToken} />;
  }

  if (resetSuccess) {
    return <ResetSuccessState lang={lang} translations={t} />;
  }

  return (
    <ResetPasswordFormFields
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      isLoading={isLoading}
      isRTL={isRTL}
      translations={t}
      onNewPasswordChange={setNewPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
    />
  );
}
