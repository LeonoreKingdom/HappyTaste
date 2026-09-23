import type { Metadata } from "next";

import { MemberRegistrationForm } from "@/components/account/member-registration-form";

export const metadata: Metadata = {
  title: "Daftar Akun Member (Demo) - HappyTaste Resto",
  description: "Pratinjau formulir pendaftaran akun member HappyTaste.",
};

export default function MemberRegistrationPage() {
  return <MemberRegistrationForm />;
}
