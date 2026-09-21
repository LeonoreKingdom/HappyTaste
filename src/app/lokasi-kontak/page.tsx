import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { mockReservationOutlets } from "@/data/mock-reservations";
import { OutletContactChannels } from "@/components/location/outlet-contact-channels";

export const metadata: Metadata = {
  title: "Lokasi & Kontak (Demo) - HappyTaste Resto",
  description: "Informasi lokasi outlet dan kanal kontak demo HappyTaste Resto.",
};

export default function LocationContactPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">INFORMASI OUTLET</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Lokasi & Kontak
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Temukan informasi outlet HappyTaste dan kanal untuk menghubungi kami.
        </p>
      </header>

      <aside
        role="note"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"
      >
        Halaman ini memakai data demo. Alamat, peta, jam operasional, dan kontak resmi belum
        tersedia; informasi di bawah bukan petunjuk menuju outlet sungguhan.
      </aside>

      <section aria-labelledby="outlets-title" className="space-y-4">
        <div>
          <h2 id="outlets-title" className="text-xl font-bold text-stone-900">
            Outlet HappyTaste
          </h2>
          <p className="mt-1 text-sm text-stone-600">{mockReservationOutlets.length} outlet contoh</p>
        </div>

        <div className="grid gap-5">
          {mockReservationOutlets.map((outlet) => (
            <article
              key={outlet.id}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md sm:p-7"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <MapPin aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-orange-700">OUTLET DEMO</p>
                    <h3 className="mt-1 text-lg font-bold text-stone-950">{outlet.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{outlet.address}</p>
                  </div>
                </div>
                <Link
                  href={`/lokasi-kontak/${outlet.id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                >
                  Lihat detail outlet <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="contact-title" className="space-y-4">
        <div>
          <h2 id="contact-title" className="text-xl font-bold text-stone-900">
            Hubungi HappyTaste
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Kanal kontak akan aktif setelah informasi resmi ditambahkan.
          </p>
        </div>

        <OutletContactChannels />
      </section>
    </main>
  );
}
