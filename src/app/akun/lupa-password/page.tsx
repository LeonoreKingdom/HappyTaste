import type { Metadata } from "next";

import { MemberForgotPasswordForm } from "@/components/account/member-forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi - HappyTaste Resto",
  description: "Minta tautan reset kata sandi akun member HappyTaste.",
};

export default function ForgotPasswordPage() {
  return <MemberForgotPasswordForm />;
}
