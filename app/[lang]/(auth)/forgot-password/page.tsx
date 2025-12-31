import { use } from "react";
import { ForgotPasswordForm } from "./_components";

interface ForgotPasswordPageProps {
  params: Promise<{
    lang: "ar" | "en";
  }>;
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { lang } = use(params);

  return <ForgotPasswordForm lang={lang} />;
}
