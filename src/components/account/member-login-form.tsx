"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowLeft, Check, Info, LoaderCircle, LockKeyhole } from "lucide-react";

import { signIn } from "@/lib/auth-client";

export function MemberLoginForm() {
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setFormError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      const { error } = await signIn.email({ email, password });

      if (error) {
        setFormError("Email atau kata sandi tidak cocok. Periksa kembali lalu coba lagi.");
        return;
      }

      form.reset();
      setStatus("Login berhasil. Sesi member sudah aktif.");
    } catch {
      setFormError("Layanan autentikasi belum dapat dijangkau. Coba lagi sebentar.");
    } finally {
      setIsSubmitting(false);
    }
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
        <p className="text-sm font-semibold tracking-wide text-orange-700">AKUN MEMBER</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Masuk ke akunmu
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Gunakan email dan kata sandi akun member HappyTaste.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="login-form-title"
          className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <LockKeyhole aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-700">LOGIN MEMBER</p>
              <h2 id="login-form-title" className="text-xl font-bold text-stone-900">
                Informasi akun
              </h2>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            onInput={() => {
              setFormError("");
              setStatus("");
            }}
            className="space-y-5"
          >
            <div>
              <label htmlFor="member-login-email" className="mb-2 block text-sm font-semibold text-stone-800">
                Email
              </label>
              <input
                id="member-login-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label htmlFor="member-login-password" className="mb-2 block text-sm font-semibold text-stone-800">
                Kata sandi
              </label>
              <input
                id="member-login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={128}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="Masukkan kata sandi"
              />
            </div>

            {formError ? (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-900">
                {formError}
              </p>
            ) : null}

            {status ? (
              <p
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"
              >
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{status}</span>
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Sedang masuk..." : "Masuk"}
            </button>
          </form>

          <p className="mt-6 border-t border-orange-100 pt-5 text-sm text-stone-600">
            Belum memiliki akun?{" "}
            <Link
              href="/akun/daftar"
              className="font-semibold text-orange-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Lihat form daftar demo
            </Link>
          </p>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section
            aria-labelledby="login-security-note"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
          >
            <div className="flex items-start gap-3">
              <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
              <div>
                <h2 id="login-security-note" className="font-bold text-emerald-950">
                  Login aman
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  Autentikasi diproses oleh Better Auth. Akses fitur member dan admin tetap
                  diperiksa di server.
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="login-signup-note"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
          >
            <div className="flex items-start gap-3">
              <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
              <div>
                <h2 id="login-signup-note" className="font-bold text-amber-950">
                  Pendaftaran belum terhubung
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Form daftar saat ini hanya pratinjau UI dan belum membuat akun. Jangan masukkan
                  kata sandi sungguhan pada form demo tersebut.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
