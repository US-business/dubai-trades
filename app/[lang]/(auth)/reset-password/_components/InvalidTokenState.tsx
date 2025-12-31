import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/shadcnUI/button";
import { Language } from "./types";

interface InvalidTokenStateProps {
  lang: Language;
  message: string;
}

export function InvalidTokenState({ lang, message }: InvalidTokenStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            {message}
          </h1>
          <Link href={`/${lang}/forgot-password`}>
            <Button className="mt-4">Request New Link</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
