import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/shadcnUI/button";
import { ResetPasswordTranslations } from "./types";
import { PasswordInput } from "./PasswordInput";

interface ResetPasswordFormFieldsProps {
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  isRTL: boolean;
  translations: ResetPasswordTranslations;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResetPasswordFormFields({
  newPassword,
  confirmPassword,
  isLoading,
  isRTL,
  translations,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ResetPasswordFormFieldsProps) {
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
              <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              {translations.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{translations.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* New Password */}
            <PasswordInput
              id="newPassword"
              label={translations.newPasswordLabel}
              placeholder={translations.passwordPlaceholder}
              value={newPassword}
              onChange={onNewPasswordChange}
              disabled={isLoading}
              helperText={translations.passwordRequirements}
            />

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPassword"
              label={translations.confirmPasswordLabel}
              placeholder={translations.passwordPlaceholder}
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
              disabled={isLoading}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {translations.resetting}
                </>
              ) : (
                translations.resetButton
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
