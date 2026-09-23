import { mockMemberProfile } from "@/data/mock-member-profile";

export const mockLoyaltyOverview = {
  points: mockMemberProfile.points,
  tier: mockMemberProfile.tier,
  nextTier: "Sahabat Plus",
  nextTierThreshold: 500,
} as const;

export const mockLoyaltyRewards = [
  {
    id: "drink-preview",
    name: "Minuman pilihan",
    pointsRequired: 100,
    description: "Contoh hadiah untuk pilihan minuman tertentu.",
  },
  {
    id: "menu-preview",
    name: "Diskon menu",
    pointsRequired: 250,
    description: "Contoh potongan harga untuk menu tertentu.",
  },
] as const;

export const mockLoyaltyActivities = [
  {
    id: "reward-preview-redemption",
    date: "2026-09-23",
    title: "Contoh penukaran poin",
    description: "Riwayat simulasi; tidak ada hadiah yang benar-benar ditukar.",
    type: "redeem",
    points: 30,
  },
  {
    id: "visit-preview",
    date: "2026-09-22",
    title: "Kunjungan demo",
    description: "Aktivitas transaksi contoh",
    type: "earn",
    points: 100,
  },
  {
    id: "welcome-preview",
    date: "2026-09-20",
    title: "Bonus sambutan demo",
    description: "Contoh perolehan poin pembuka",
    type: "earn",
    points: 50,
  },
] as const;
