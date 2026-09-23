import type { Metadata } from "next";

import { MemberForgotPasswordForm } from "@/components/account/member-forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi (Demo) - HappyTaste Resto",
  description: "Pratinjau lokal alur pemulihan kata sandi member HappyTaste.",
};

export default function ForgotPasswordPage() {
  return <MemberForgotPasswordForm />;
}
