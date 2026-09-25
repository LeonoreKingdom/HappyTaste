import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, ExternalLink, MapPin } from "lucide-react";

import { mockLocationContactInfo } from "@/data/mock-location-contact";
import { mockReservationOutlets } from "@/data/mock-reservations";
import { OutletOpeningStatus } from "@/components/location/outlet-opening-status";
import { OutletContactChannels } from "@/components/location/outlet-contact-channels";

type OutletDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return mockReservationOutlets.map((outlet) => ({ id: outlet.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: OutletDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const outlet = mockReservationOutlets.find((item) => item.id === id);

  return {
    title: outlet ? `${outlet.name} - HappyTaste Resto` : "Outlet tidak ditemukan - HappyTaste Resto",
    description: outlet
      ? `Informasi demo lokasi dan kontak untuk ${outlet.name}.`
      : "Detail outlet HappyTaste tidak ditemukan.",
  };
}

export default async function OutletDetailPage({ params }: OutletDetailPageProps) {
  const { id } = await params;
  const outlet = mockReservationOutlets.find((item) => item.id === id);

  if (!outlet) notFound();

  const mapPaddingDegrees = 0.006;
  const mapParams = new URLSearchParams({
    bbox: [
      outlet.longitude - mapPaddingDegrees,
      outlet.latitude - mapPaddingDegrees,
      outlet.longitude + mapPaddingDegrees,
      outlet.latitude + mapPaddingDegrees,
    ].join(","),
    layer: "mapnik",
    marker: `${outlet.latitude},${outlet.longitude}`,
  });
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?${mapParams.toString()}`;
  const navigationUrl = new URL("https://www.google.com/maps/dir/");
  navigationUrl.searchParams.set("api", "1");
  navigationUrl.searchParams.set("destination", `${outlet.latitude},${outlet.longitude}`);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
        <Link href="/lokasi-kontak" className="font-medium transition hover:text-orange-700">
          Lokasi & Kontak
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-stone-900">
          {outlet.name}
        </span>
      </nav>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">DETAIL OUTLET DEMO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          {outlet.name}
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Informasi ini memakai fixture demo yang sama dengan alur reservasi.
        </p>
      </header>

      <aside
        role="note"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"
      >
        Ini lokasi demo untuk development/testing, bukan alamat outlet resmi HappyTaste. Koordinat
        berikut hanya digunakan untuk demonstrasi. Jam, fasilitas, dan status buka juga simulasi;
        informasi operasional resmi belum tersedia di project.
      </aside>

      <section aria-labelledby="outlet-details-title" className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 id="outlet-details-title" className="text-xl font-bold text-stone-900">
            Informasi lokasi
          </h2>
          <dl className="mt-5 space-y-5 border-t border-stone-100 pt-5">
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <MapPin aria-hidden="true" className="h-4 w-4" /> Alamat
              </dt>
              <dd className="mt-1 leading-6 text-stone-800">{outlet.address}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <Clock3 aria-hidden="true" className="h-4 w-4" /> Jam operasional demo
              </dt>
              <dd className="mt-1 leading-6 text-stone-800">
                <p>
                  {mockLocationContactInfo.operatingHours.daysLabel},{" "}
                  {mockLocationContactInfo.operatingHours.opensAt.replace(":", ".")}–
                  {mockLocationContactInfo.operatingHours.closesAt.replace(":", ".")} WIB
                  {" "}
                  <span className="text-sm text-stone-500">(simulasi)</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-stone-600">Status saat ini:</span>
                  <OutletOpeningStatus
                    opensAt={mockLocationContactInfo.operatingHours.opensAt}
                    closesAt={mockLocationContactInfo.operatingHours.closesAt}
                    timeZone={mockLocationContactInfo.operatingHours.timeZone}
                  />
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Fasilitas demo
              </dt>
              <dd>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {mockLocationContactInfo.facilities.map((facility) => (
                    <li
                      key={facility}
                      className="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-900"
                    >
                      {facility} <span className="text-orange-700">(contoh)</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </article>

        <article className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-orange-700">LOKASI DEMO</p>
              <h2 className="mt-1 font-semibold text-stone-900">Peta koordinat demonstrasi</h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                {mockLocationContactInfo.mapAvailability}
              </p>
            </div>
            <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-orange-600" />
          </div>
          <iframe
            title={`Peta lokasi demo, bukan outlet resmi HappyTaste (${outlet.latitude}, ${outlet.longitude})`}
            src={mapUrl}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-64 w-full border-y border-orange-100 bg-orange-50"
          />
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="text-sm text-stone-700">
              <span className="font-medium">Koordinat demo:</span> {outlet.latitude}, {outlet.longitude}
            </p>
            <a
              href={navigationUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Buka Navigasi <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
          <p className="px-5 pb-5 text-xs text-stone-500 sm:px-6 sm:pb-6">
            Peta dari OpenStreetMap untuk demonstrasi koordinat saja. © OpenStreetMap contributors.
          </p>
        </article>
      </section>

      <section aria-labelledby="outlet-contact-title" className="space-y-4">
        <div>
          <h2 id="outlet-contact-title" className="text-xl font-bold text-stone-900">
            Kontak outlet
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Informasi kontak resmi belum ditambahkan pada data demo.
          </p>
        </div>
        <OutletContactChannels />
      </section>

      <Link
        href="/lokasi-kontak"
        className="inline-flex items-center gap-2 text-sm font-semibold text-orange-800 transition hover:text-orange-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke semua outlet
      </Link>
    </main>
  );
}
