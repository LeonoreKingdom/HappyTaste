import type { Metadata } from "next";

import { MemberResetPasswordForm } from "@/components/account/member-reset-password-form";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi - HappyTaste Resto",
  description: "Buat kata sandi baru untuk akun member HappyTaste.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" && params.token.length > 0 ? params.token : null;
  const invalidLink = params.error === "INVALID_TOKEN";

  return <MemberResetPasswordForm token={token} invalidLink={invalidLink} />;
}
