"use client";

import { use, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ResetPasswordForm } from "./_components";

interface ResetPasswordPageProps {
  params: Promise<{
    lang: "ar" | "en";
  }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { lang } = use(params);
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
        </div>
      }
    >
      <ResetPasswordForm lang={lang} />
    </Suspense>
  );
}
