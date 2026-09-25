import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
} from "lucide-react";

import { AdminPanelNavigation } from "@/components/admin/admin-panel-navigation";
import { getCurrentSession } from "@/lib/auth-session";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession(await headers());

  if (!session?.user) {
    redirect(`/akun/masuk?next=${encodeURIComponent("/admin")}`);
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const managerName = session.user.name.trim() || session.user.email;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-100/70 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-stone-100 px-2 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-700 text-white shadow-sm">
              <ChartNoAxesCombined aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold leading-5 text-stone-900">HappyTaste</p>
              <p className="text-xs text-stone-500">Panel pengelola</p>
            </div>
          </div>

          <AdminPanelNavigation />

          <div className="mt-5 rounded-2xl bg-stone-50 p-3">
            <p className="text-xs font-semibold text-stone-800">Sesi administrator</p>
            <p className="mt-1 truncate text-xs text-stone-500" title={managerName}>
              {managerName}
            </p>
          </div>

          <Link
            href="/"
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 text-sm font-semibold text-stone-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Lihat situs pelanggan
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </aside>

        <div className="min-w-0">
          <header className="mb-5 flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                HappyTaste Resto <span aria-hidden="true">/</span> Operasional
              </p>
              <p className="mt-1 text-sm text-stone-600">Selamat datang, {managerName}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-500" />
              Pratinjau data demo
            </span>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
