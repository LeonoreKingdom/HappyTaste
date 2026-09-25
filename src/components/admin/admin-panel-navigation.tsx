"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import {
  CircleUserRound,
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Utensils,
} from "lucide-react";

const comingSoonItems = [
  { label: "Member & poin", icon: CircleUserRound },
] as const;

export function AdminPanelNavigation() {
  const activeSegment = useSelectedLayoutSegment();
  const dashboardIsActive = activeSegment === null;
  const menuIsActive = activeSegment === "menu";
  const promoIsActive = activeSegment === "promo";
  const operationsAreActive = activeSegment === "pesanan-reservasi";

  return (
    <nav aria-label="Menu panel pengelola" className="mt-4">
      <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
        Workspace
      </p>
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        <li>
          <Link
            href="/admin"
            aria-current={dashboardIsActive ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
              dashboardIsActive
                ? "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-100"
                : "text-stone-600 hover:bg-stone-50 hover:text-orange-800"
            }`}
          >
            <LayoutDashboard aria-hidden="true" className="h-4 w-4 shrink-0" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/admin/menu"
            aria-current={menuIsActive ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
              menuIsActive
                ? "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-100"
                : "text-stone-600 hover:bg-stone-50 hover:text-orange-800"
            }`}
          >
            <Utensils aria-hidden="true" className="h-4 w-4 shrink-0" />
            Kelola menu
          </Link>
        </li>
        <li>
          <Link
            href="/admin/promo"
            aria-current={promoIsActive ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
              promoIsActive
                ? "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-100"
                : "text-stone-600 hover:bg-stone-50 hover:text-orange-800"
            }`}
          >
            <Tags aria-hidden="true" className="h-4 w-4 shrink-0" />
            Promo &amp; banner
          </Link>
        </li>
        <li>
          <Link
            href="/admin/pesanan-reservasi"
            aria-current={operationsAreActive ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
              operationsAreActive
                ? "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-100"
                : "text-stone-600 hover:bg-stone-50 hover:text-orange-800"
            }`}
          >
            <ShoppingBag aria-hidden="true" className="h-4 w-4 shrink-0" />
            Pesanan &amp; reservasi
          </Link>
        </li>
        {comingSoonItems.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.label}>
              <span
                aria-disabled="true"
                className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-500"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                  Segera
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
