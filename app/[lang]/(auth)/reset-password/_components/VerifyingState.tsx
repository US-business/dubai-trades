import { Loader2 } from "lucide-react";

interface VerifyingStateProps {
  message: string;
}

export function VerifyingState({ message }: VerifyingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}
