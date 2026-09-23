"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowLeft, Check, CircleAlert, KeyRound, LoaderCircle } from "lucide-react";

import { authClient } from "@/lib/auth-client";

type MemberResetPasswordFormProps = {
  token: string | null;
  invalidLink: boolean;
};

export function MemberResetPasswordForm({ token, invalidLink }: MemberResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || invalidLink) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

    if (newPassword !== passwordConfirmation) {
      setFormError("Konfirmasi kata sandi belum sama.");
      setIsComplete(false);
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const { error } = await authClient.resetPassword({ newPassword, token });

      if (error) {
        setFormError("Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.");
        return;
      }

      form.reset();
      setIsComplete(true);
    } catch {
      setFormError("Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.");
    } finally {
      setIsSubmitting(false);
    }
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
        <p className="text-sm font-semibold tracking-wide text-orange-700">AKUN MEMBER</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Atur ulang kata sandi
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Buat kata sandi baru untuk melindungi akun member HappyTaste.
        </p>
      </header>

      <section
        aria-labelledby="reset-password-heading"
        className="max-w-2xl rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <KeyRound aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-700">PEMULIHAN AKUN</p>
            <h2 id="reset-password-heading" className="text-xl font-bold text-stone-900">
              Kata sandi baru
            </h2>
          </div>
        </div>

        {isComplete ? (
          <div role="status" className="space-y-5">
            <p className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Kata sandi berhasil diatur ulang. Sesi akun sebelumnya telah dicabut.
            </p>
            <Link
              href="/akun/masuk"
              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Kembali masuk
            </Link>
          </div>
        ) : invalidLink || !token ? (
          <div className="space-y-5">
            <p role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru untuk melanjutkan.
            </p>
            <Link
              href="/akun/lupa-password"
              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Minta tautan baru
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            onInput={() => setFormError("")}
            className="space-y-5"
          >
            <div>
              <label htmlFor="member-reset-password" className="mb-2 block text-sm font-semibold text-stone-800">
                Kata sandi baru
              </label>
              <input
                id="member-reset-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="Masukkan kata sandi baru"
              />
            </div>

            <div>
              <label htmlFor="member-reset-password-confirmation" className="mb-2 block text-sm font-semibold text-stone-800">
                Konfirmasi kata sandi baru
              </label>
              <input
                id="member-reset-password-confirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                placeholder="Ulangi kata sandi baru"
              />
            </div>

            {formError ? (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-900">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Menyimpan kata sandi..." : "Simpan kata sandi baru"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
