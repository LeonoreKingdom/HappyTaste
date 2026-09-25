import type { Metadata } from "next";

import { MemberLoginForm } from "@/components/account/member-login-form";

export const metadata: Metadata = {
  title: "Masuk - HappyTaste Resto",
  description: "Masuk ke akun HappyTaste dengan akses yang ditentukan oleh peran akun.",
};

export default function MemberLoginPage() {
  return <MemberLoginForm />;
}
