import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/shadcnUI/button";
import { Language, ResetPasswordTranslations } from "./types";

interface ResetSuccessStateProps {
  lang: Language;
  translations: ResetPasswordTranslations;
}

export function ResetSuccessState({ lang, translations }: ResetSuccessStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            {translations.successTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {translations.successMessage}
          </p>
          <Link href={`/${lang}/signin`}>
            <Button className="w-full">{translations.goToLogin}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
