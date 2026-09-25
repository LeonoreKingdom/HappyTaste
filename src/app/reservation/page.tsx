import type { Metadata } from "next";

import { MemberReservationForm } from "@/components/reservation/member-reservation-form";
import { requireMemberPage } from "@/lib/member-page-guard";

export const metadata: Metadata = {
  title: "Reservasi Meja - HappyTaste Resto",
  description: "Atur jadwal kunjungan melalui preview reservasi member HappyTaste.",
};

export default async function ReservationPage() {
  await requireMemberPage("/reservation");

  return <MemberReservationForm />;
}
