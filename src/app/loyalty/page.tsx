import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Gift,
  Info,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  mockLoyaltyActivities,
  mockLoyaltyOverview,
  mockLoyaltyRewards,
} from "@/data/mock-loyalty";
import { LoyaltyRewardConfirmation } from "@/components/loyalty/loyalty-reward-confirmation";
import { requireMemberPage } from "@/lib/member-page-guard";

export const metadata: Metadata = {
  title: "Loyalty & Poin (Demo) - HappyTaste Resto",
  description: "Pratinjau halaman loyalty member HappyTaste dengan data tiruan.",
};

const pointsFormatter = new Intl.NumberFormat("id-ID");
const activityDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function MemberLoyaltyPage() {
  const session = await requireMemberPage("/loyalty");

  if (session.user.role !== "user") {
    redirect("/");
  }

  const displayName = session.user.name.trim() || "Member HappyTaste";
  const points = Math.max(0, mockLoyaltyOverview.points);
  const hasPoints = points > 0;
  const hasRewards = mockLoyaltyRewards.length > 0;
  const hasActivities = mockLoyaltyActivities.length > 0;
  const progressPercent = Math.min(
    100,
    Math.round((points / mockLoyaltyOverview.nextTierThreshold) * 100),
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/akun/profil"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke profil
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-violet-700">LOYALTY MEMBER · DEMO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Loyalty & Poin
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Hai, {displayName}. Ini pratinjau program loyalty HappyTaste menggunakan data contoh.
        </p>
      </header>

      <section
        aria-labelledby="loyalty-balance-heading"
        className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-violet-800 to-orange-700 p-6 text-white shadow-lg sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-violet-100 ring-1 ring-inset ring-white/15">
              <Sparkles aria-hidden="true" className="h-4 w-4" /> Saldo poin contoh
            </p>
            <h2 id="loyalty-balance-heading" className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              {hasPoints ? (
                <>
                  {pointsFormatter.format(points)}
                  <span className="ml-2 text-xl font-semibold text-violet-100">poin demo</span>
                </>
              ) : (
                <span className="text-2xl font-semibold">Belum ada poin</span>
              )}
            </h2>
            <p className="mt-3 text-sm leading-6 text-violet-100">
              {hasPoints
                ? "Angka ini hanya untuk preview dan bukan saldo milik akun yang sedang login."
                : "Saldo demo belum tersedia. Tidak ada poin dari transaksi akun ini yang dihitung."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-100">
                  Level sekarang · contoh
                </p>
                <p className="mt-1 text-lg font-bold">
                  {hasPoints ? mockLoyaltyOverview.tier : "Belum ada level"}
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Award aria-hidden="true" className="h-6 w-6" />
              </span>
            </div>
            <p className="mt-5 text-xs leading-5 text-violet-100">
              Menuju level contoh berikutnya: {mockLoyaltyOverview.nextTier}
            </p>
            <div
              role="progressbar"
              aria-label="Progres menuju level loyalty contoh berikutnya"
              aria-valuemin={0}
              aria-valuemax={mockLoyaltyOverview.nextTierThreshold}
              aria-valuenow={points}
              className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/20"
            >
              <div
                className="h-full rounded-full bg-amber-300 transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs font-semibold text-white">
              {pointsFormatter.format(points)} / {pointsFormatter.format(mockLoyaltyOverview.nextTierThreshold)} poin · {progressPercent}%
            </p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="loyalty-rewards-heading" className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">KATALOG CONTOH</p>
            <h2 id="loyalty-rewards-heading" className="mt-1 text-2xl font-bold text-stone-900">
              Hadiah loyalty
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Hadiah dan indikator saldonya hanya contoh; penukaran belum aktif.
            </p>
          </div>

          {hasRewards ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {mockLoyaltyRewards.map((reward) => (
                <article
                  key={reward.id}
                  className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <Gift aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-600">
                      Demo
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-stone-900">{reward.name}</h3>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-stone-600">
                    {reward.description}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm font-bold text-violet-900">
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                    {pointsFormatter.format(reward.pointsRequired)} poin contoh
                  </p>
                  <LoyaltyRewardConfirmation
                    rewardId={reward.id}
                    rewardName={reward.name}
                    requiredPoints={reward.pointsRequired}
                    availablePoints={points}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div
              role="status"
              className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 p-6 text-center sm:p-8"
            >
              <Gift aria-hidden="true" className="mx-auto h-8 w-8 text-violet-700" />
              <h3 className="mt-3 font-semibold text-stone-900">Belum ada hadiah contoh</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                Katalog hadiah demo akan muncul di sini setelah tersedia.
              </p>
            </div>
          )}
        </section>

        <section
          aria-labelledby="loyalty-activity-heading"
          className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-700">RIWAYAT DEMO</p>
              <h2 id="loyalty-activity-heading" className="mt-1 text-xl font-bold text-stone-900">
                Aktivitas poin
              </h2>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <TrendingUp aria-hidden="true" className="h-5 w-5" />
            </span>
          </div>

          {hasActivities ? (
            <ol className="mt-5 divide-y divide-orange-100">
              {mockLoyaltyActivities.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <CalendarDays aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900">{activity.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{activity.description}</p>
                    <time className="mt-1 block text-xs text-stone-500" dateTime={activity.date}>
                      {activityDateFormatter.format(new Date(`${activity.date}T00:00:00.000Z`))}
                    </time>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-800">
                    +{pointsFormatter.format(activity.points)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div
              role="status"
              className="mt-5 rounded-xl border border-dashed border-orange-200 bg-orange-50/70 p-5 text-center"
            >
              <CalendarDays aria-hidden="true" className="mx-auto h-7 w-7 text-orange-700" />
              <h3 className="mt-3 text-sm font-semibold text-stone-900">
                Belum ada aktivitas poin
              </h3>
              <p className="mt-1 text-xs leading-5 text-stone-600">
                Riwayat contoh akan ditampilkan di sini saat tersedia.
              </p>
            </div>
          )}
        </section>
      </div>

      <aside
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"
      >
        <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
        <p>
          Semua saldo, level, syarat poin, hadiah, dan aktivitas di halaman ini adalah data demo.
          Poin tidak dihitung dari pesanan, hadiah belum bisa ditukar, dan tidak ada data yang
          disimpan atau dikirim ke server.
        </p>
      </aside>
    </main>
  );
}
