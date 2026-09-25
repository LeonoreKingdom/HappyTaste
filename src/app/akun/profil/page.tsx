import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Bell, CalendarDays, Gift, Info, Mail, Sparkles, Utensils } from "lucide-react";
import Link from "next/link";

import { mockLoyaltyActivities } from "@/data/mock-loyalty";
import { mockMemberProfile } from "@/data/mock-member-profile";
import { getCurrentSession } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Profil Saya - HappyTaste Resto",
  description: "Lihat informasi akun member HappyTaste.",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

const pointsFormatter = new Intl.NumberFormat("id-ID");

export default async function MemberProfilePage() {
  const session = await getCurrentSession(await headers());

  if (!session?.user) {
    redirect("/akun/masuk");
  }

  if (session.user.role !== "user") {
    redirect("/");
  }

  const displayName = session.user.name.trim() || "Nama belum diatur";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("id-ID") ?? "")
    .join("");
  const latestEarnedActivity = mockLoyaltyActivities.find((activity) => activity.type === "earn");

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke beranda
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">AKUN MEMBER</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Profil Saya
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Informasi akun ditampilkan dari sesi member yang sedang aktif.
        </p>
      </header>

      {latestEarnedActivity ? (
        <aside
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800">
              <Bell aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                Notifikasi poin · Demo
              </p>
              <p className="mt-1 font-semibold text-emerald-950">
                +{pointsFormatter.format(latestEarnedActivity.points)} poin contoh bertambah dari{" "}
                {latestEarnedActivity.title}.
              </p>
              <p className="mt-1 text-sm leading-5 text-emerald-900">
                Ini notifikasi pratinjau; saldo akun dan transaksi nyata tidak berubah.
              </p>
              <time
                className="mt-1 block text-xs text-emerald-800"
                dateTime={latestEarnedActivity.date}
              >
                {formatDate(new Date(`${latestEarnedActivity.date}T00:00:00.000Z`))}
              </time>
            </div>
          </div>
          <Link
            href="/loyalty#loyalty-activity-heading"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            Lihat riwayat poin demo
          </Link>
        </aside>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="profile-account-heading"
          className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
        >
          <div className="bg-gradient-to-r from-orange-700 to-amber-500 px-5 py-6 text-white sm:px-7 sm:py-8">
            <div className="flex flex-wrap items-center gap-4">
              <div
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-inset ring-white/30"
              >
                {initials || "M"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-orange-50">Akun member</p>
                <h2 id="profile-account-heading" className="mt-1 break-words text-2xl font-bold">
                  {displayName}
                </h2>
                <p className="mt-1 break-all text-sm text-orange-50">{session.user.email}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-orange-800">
                <BadgeCheck aria-hidden="true" className="h-4 w-4" /> Member
              </span>
            </div>
          </div>

          <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <Mail aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Email</dt>
                <dd className="mt-1 break-all text-sm font-semibold text-stone-900">
                  {session.user.email}
                </dd>
                <dd className="mt-1 text-xs text-stone-500">
                  {session.user.emailVerified ? "Email terverifikasi" : "Email belum terverifikasi"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <CalendarDays aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Bergabung sejak
                </dt>
                <dd className="mt-1 text-sm font-semibold text-stone-900">
                  {formatDate(session.user.createdAt)}
                </dd>
              </div>
            </div>
          </dl>
        </section>

        <aside className="space-y-5">
          <section
            aria-labelledby="profile-demo-heading"
            className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
                  Pratinjau saja · Demo
                </p>
                <h2 id="profile-demo-heading" className="mt-1 text-xl font-bold text-stone-900">
                  Ringkasan member
                </h2>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>

            <dl className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-violet-50/70 p-3">
                <dt className="flex items-center gap-2 text-sm text-stone-700">
                  <Gift aria-hidden="true" className="h-4 w-4 text-violet-700" /> Poin contoh
                </dt>
                <dd className="font-bold text-violet-900">{mockMemberProfile.points}</dd>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <BadgeCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
                <div>
                  <dt className="text-xs text-stone-500">Level contoh</dt>
                  <dd className="mt-0.5 font-semibold text-stone-900">{mockMemberProfile.tier}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Utensils aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
                <div>
                  <dt className="text-xs text-stone-500">Menu favorit contoh</dt>
                  <dd className="mt-0.5 font-semibold text-stone-900">
                    {mockMemberProfile.favoriteMenu}
                  </dd>
                </div>
              </div>
            </dl>

            <p className="mt-5 flex items-start gap-2 border-t border-violet-100 pt-4 text-xs leading-5 text-stone-600">
              <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
              Poin, level, dan menu favorit di atas hanyalah contoh tampilan; bukan data akun,
              belum berasal dari API, dan tidak disimpan.
            </p>
          </section>

          <section className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
            <h2 className="font-bold text-stone-900">Jelajahi HappyTaste</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Temukan hidangan dan promo yang tersedia.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
              >
                Lihat menu
              </Link>
              <Link
                href="/promo"
                className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-800 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
              >
                Lihat promo
              </Link>
              <Link
                href="/loyalty"
                className="rounded-lg border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800 transition hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
              >
                Loyalty & poin demo
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
