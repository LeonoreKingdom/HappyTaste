import type { Metadata } from "next";

import { QrTableScanner } from "@/components/order/qr-table-scanner";

export const metadata: Metadata = {
  title: "Scan QR Meja - HappyTaste Resto",
  description: "Pindai QR meja HappyTaste untuk memulai pesanan di tempat.",
};

export default function ScanTablePage() {
  return <QrTableScanner />;
}
