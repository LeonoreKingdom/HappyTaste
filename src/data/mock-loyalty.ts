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
    id: "welcome-preview",
    date: "2026-09-20",
    title: "Bonus sambutan demo",
    description: "Contoh perolehan poin pembuka",
    points: 50,
  },
  {
    id: "visit-preview",
    date: "2026-09-22",
    title: "Kunjungan demo",
    description: "Aktivitas transaksi contoh",
    points: 70,
  },
] as const;
