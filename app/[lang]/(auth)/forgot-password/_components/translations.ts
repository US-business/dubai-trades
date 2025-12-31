import { ForgotPasswordTranslations } from "./types";

export const translations: Record<"ar" | "en", ForgotPasswordTranslations> = {
  ar: {
    title: "نسيت كلمة المرور",
    subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "example@domain.com",
    sendButton: "إرسال رابط إعادة التعيين",
    sending: "جارٍ الإرسال...",
    backToLogin: "العودة لتسجيل الدخول",
    successTitle: "تم إرسال البريد!",
    successMessage: "تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.",
    successNote: "إذا لم تجد البريد، تحقق من مجلد الرسائل غير المرغوب فيها.",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "البريد الإلكتروني غير صالح",
    errorSending: "فشل إرسال البريد. حاول مرة أخرى.",
  },
  en: {
    title: "Forgot Password",
    subtitle: "Enter your email and we'll send you a link to reset your password",
    emailLabel: "Email",
    emailPlaceholder: "example@domain.com",
    sendButton: "Send Reset Link",
    sending: "Sending...",
    backToLogin: "Back to Sign In",
    successTitle: "Email Sent!",
    successMessage: "Check your email for a password reset link.",
    successNote: "If you don't see the email, check your spam folder.",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email address",
    errorSending: "Failed to send email. Try again.",
  },
};
