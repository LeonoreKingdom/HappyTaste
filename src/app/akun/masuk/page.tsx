import type { Metadata } from "next";

import { MemberLoginForm } from "@/components/account/member-login-form";

export const metadata: Metadata = {
  title: "Masuk Member - HappyTaste Resto",
  description: "Masuk ke akun member HappyTaste dengan aman.",
};

export default function MemberLoginPage() {
  return <MemberLoginForm />;
}
