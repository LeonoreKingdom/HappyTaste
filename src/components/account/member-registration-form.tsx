"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowLeft, Check, Info, UserRoundPlus } from "lucide-react";

type RegistrationPreview = {
  name: string;
  email: string;
  phone: string;
};

export function MemberRegistrationForm() {
  const [preview, setPreview] = useState<RegistrationPreview | null>(null);
  const [formError, setFormError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

    if (password !== passwordConfirmation) {
      setFormError("Konfirmasi kata sandi belum sama.");
      setPreview(null);
      return;
    }

    const nextPreview = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
    };

    form.reset();
    setFormError("");
    setPreview(nextPreview);
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke beranda
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">AKUN MEMBER · DEMO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Daftar sebagai member
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Isi data singkat untuk melihat pratinjau pendaftaran akun HappyTaste.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="registration-form-title"
          className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <UserRoundPlus aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-700">FORMULIR DEMO</p>
              <h2 id="registration-form-title" className="text-xl font-bold text-stone-900">
                Data akun
              </h2>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            onInput={() => {
              setPreview(null);
              setFormError("");
            }}
            className="space-y-5"
          >
            <div>
              <label htmlFor="member-name" className="mb-2 block text-sm font-semibold text-stone-800">
                Nama lengkap
              </label>
              <input
                id="member-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="Nama kamu"
              />
            </div>

            <div>
              <label htmlFor="member-email" className="mb-2 block text-sm font-semibold text-stone-800">
                Email
              </label>
              <input
                id="member-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label htmlFor="member-phone" className="mb-2 block text-sm font-semibold text-stone-800">
                Nomor telepon <span className="font-normal text-stone-500">(opsional)</span>
              </label>
              <input
                id="member-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={32}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="08xx xxxx xxxx"
              />
            </div>

            <div>
              <label htmlFor="member-password" className="mb-2 block text-sm font-semibold text-stone-800">
                Kata sandi demo
              </label>
              <input
                id="member-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                aria-describedby="password-demo-note"
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="Minimal 8 karakter"
              />
              <p id="password-demo-note" className="mt-2 text-xs leading-5 text-stone-500">
                Gunakan kata sandi contoh, bukan kata sandi akun sungguhan.
              </p>
            </div>

            <div>
              <label
                htmlFor="member-password-confirmation"
                className="mb-2 block text-sm font-semibold text-stone-800"
              >
                Konfirmasi kata sandi
              </label>
              <input
                id="member-password-confirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="Ulangi kata sandi demo"
              />
            </div>

            {formError ? (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-900">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Tampilkan preview pendaftaran
            </button>
          </form>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section
            aria-labelledby="registration-preview-title"
            className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-orange-700">PREVIEW LOKAL</p>
            <h2 id="registration-preview-title" className="mt-1 text-xl font-bold text-stone-900">
              Ringkasan pendaftaran
            </h2>

            {preview ? (
              <div role="status" className="mt-5 space-y-4">
                <p className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  Preview siap ditinjau. Akun belum dibuat dan data tidak dikirim atau disimpan.
                </p>
                <dl className="grid gap-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Nama</dt>
                    <dd className="mt-1 font-semibold text-stone-900">{preview.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Email</dt>
                    <dd className="mt-1 break-all font-semibold text-stone-900">{preview.email}</dd>
                  </div>
                  {preview.phone ? (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Nomor telepon
                      </dt>
                      <dd className="mt-1 font-semibold text-stone-900">{preview.phone}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-orange-200 bg-orange-50/60 p-4 text-sm leading-6 text-stone-600">
                Isi formulir untuk melihat ringkasan lokal. Preview ini tidak membuat akun member.
              </p>
            )}
          </section>

          <section
            aria-labelledby="registration-demo-note"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
          >
            <div className="flex items-start gap-3">
              <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
              <div>
                <h2 id="registration-demo-note" className="font-bold text-amber-950">
                  Pendaftaran belum terhubung
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Ini hanya simulasi tampilan. Jangan gunakan kata sandi asli; data formulir tidak
                  dikirim ke server, tidak disimpan, dan tidak memberi akses ke fitur member.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
