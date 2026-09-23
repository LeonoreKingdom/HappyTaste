"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowLeft, Check, Info, MailQuestion } from "lucide-react";

export function MemberForgotPasswordForm() {
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setIsPreviewReady(true);
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/akun/masuk"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke halaman masuk
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">AKUN MEMBER · DEMO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Lupa kata sandi?
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Masukkan email untuk melihat pratinjau langkah pemulihan akun.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="forgot-password-heading"
          className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <MailQuestion aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-700">PEMULIHAN AKUN · DEMO</p>
              <h2 id="forgot-password-heading" className="text-xl font-bold text-stone-900">
                Minta petunjuk pemulihan
              </h2>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            onInput={() => setIsPreviewReady(false)}
            className="space-y-5"
          >
            <div>
              <label htmlFor="member-recovery-email" className="mb-2 block text-sm font-semibold text-stone-800">
                Email akun
              </label>
              <input
                id="member-recovery-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                maxLength={254}
                aria-describedby="recovery-email-note"
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="nama@email.com"
              />
              <p id="recovery-email-note" className="mt-2 text-xs leading-5 text-stone-500">
                Formulir ini hanya simulasi dan tidak memeriksa status email akun.
              </p>
            </div>

            {isPreviewReady ? (
              <p
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"
              >
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Pratinjau selesai. Tidak ada email yang dikirim, alamat tidak diperiksa, dan kata
                  sandi tidak diubah.
                </span>
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Lihat pratinjau pemulihan
            </button>
          </form>

          <p className="mt-6 border-t border-orange-100 pt-5 text-sm text-stone-600">
            Ingat kata sandi?{" "}
            <Link
              href="/akun/masuk"
              className="font-semibold text-orange-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Kembali masuk
            </Link>
          </p>
        </section>

        <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
            <div>
              <h2 className="font-bold text-amber-950">Pemulihan belum terhubung</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Halaman ini hanya demonstrasi antarmuka. Tidak ada permintaan yang dikirim ke
                Better Auth, email tidak dikirim, dan tidak ada token pemulihan yang dibuat.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
