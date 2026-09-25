export type MockAdminOrderStatus = "Menunggu" | "Diproses" | "Siap" | "Selesai";

export const mockAdminDashboardSummary = {
  revenueToday: 4_280_000,
  revenueChange: "+8,2% dari kemarin",
  ordersToday: 38,
  pendingOrders: 6,
  reservationsToday: 12,
  pendingReservations: 3,
  activeMembers: 128,
  newMembersThisMonth: 7,
} as const;

export const mockAdminRecentOrders: ReadonlyArray<{
  id: string;
  customer: string;
  time: string;
  total: number;
  status: MockAdminOrderStatus;
}> = [
  { id: "HT-1048", customer: "Dina Pratama", time: "12.42", total: 156_000, status: "Diproses" },
  { id: "HT-1047", customer: "Rafi Mahendra", time: "12.35", total: 89_000, status: "Menunggu" },
  { id: "HT-1046", customer: "Nadia Putri", time: "12.18", total: 214_000, status: "Siap" },
  { id: "HT-1045", customer: "Bima Saputra", time: "11.56", total: 72_000, status: "Selesai" },
];

export const mockAdminBestSellers = [
  { id: "nasi-goreng-rendang", name: "Nasi Goreng Rendang", category: "Makanan utama", sold: 24 },
  { id: "ayam-bakar-madu", name: "Ayam Bakar Madu", category: "Makanan utama", sold: 18 },
  { id: "es-kopi-susu", name: "Es Kopi Susu", category: "Minuman", sold: 15 },
] as const;
