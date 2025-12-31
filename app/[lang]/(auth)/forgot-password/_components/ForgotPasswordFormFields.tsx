import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
import { Label } from "@/components/shadcnUI/label";
import { Language, ForgotPasswordTranslations } from "./types";

interface ForgotPasswordFormFieldsProps {
  lang: Language;
  email: string;
  isLoading: boolean;
  isRTL: boolean;
  translations: ForgotPasswordTranslations;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ForgotPasswordFormFields({
  lang,
  email,
  isLoading,
  isRTL,
  translations,
  onEmailChange,
  onSubmit,
}: ForgotPasswordFormFieldsProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              {translations.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{translations.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{translations.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={translations.emailPlaceholder}
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                disabled={isLoading}
                className="w-full"
                dir="ltr"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {translations.sending}
                </>
              ) : (
                translations.sendButton
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href={`/${lang}/signin`}
              className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium inline-flex items-center"
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? "mr-2 rotate-180" : "mr-2"}`} />
              {translations.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
