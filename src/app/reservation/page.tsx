import type { Metadata } from "next";

import { MemberReservationForm } from "@/components/reservation/member-reservation-form";

export const metadata: Metadata = {
  title: "Reservasi Meja - HappyTaste Resto",
  description: "Atur jadwal kunjungan melalui preview reservasi member HappyTaste.",
};

export default function ReservationPage() {
  return <MemberReservationForm />;
}
