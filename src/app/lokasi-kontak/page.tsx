import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { mockLocationContactInfo } from "@/data/mock-location-contact";
import { mockReservationOutlets } from "@/data/mock-reservations";

export const metadata: Metadata = {
  title: "Lokasi & Kontak (Demo) - HappyTaste Resto",
  description: "Informasi lokasi outlet dan kanal kontak demo HappyTaste Resto.",
};

const contactIcons = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
} as const;

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
              className="grid gap-6 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]"
            >
              <div>
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <MapPin aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-orange-700">OUTLET DEMO</p>
                    <h3 className="mt-1 text-lg font-bold text-stone-950">{outlet.name}</h3>
                  </div>
                </div>

                <dl className="mt-6 space-y-4 border-t border-stone-100 pt-5">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Alamat
                    </dt>
                    <dd className="mt-1 leading-6 text-stone-800">{outlet.address}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                      <Clock3 aria-hidden="true" className="h-4 w-4" /> Jam operasional
                    </dt>
                    <dd className="mt-1 leading-6 text-stone-800">
                      {mockLocationContactInfo.operatingHours}
                    </dd>
                  </div>
                </dl>
              </div>

              <div
                role="note"
                className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-center"
              >
                <MapPin aria-hidden="true" className="h-8 w-8 text-orange-600" />
                <h4 className="mt-3 font-semibold text-stone-900">Peta outlet</h4>
                <p className="mt-1 max-w-sm text-sm leading-6 text-stone-600">
                  {mockLocationContactInfo.mapAvailability}
                </p>
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

        <ul className="grid gap-4 sm:grid-cols-3">
          {mockLocationContactInfo.contactChannels.map((channel) => {
            const Icon = contactIcons[channel.id];

            return (
              <li key={channel.id}>
                <article className="h-full rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-stone-900">{channel.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{channel.value}</p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
