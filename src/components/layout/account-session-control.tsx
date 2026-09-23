"use client";

import Link from "next/link";
import { useState } from "react";
import { Info, LoaderCircle, LogOut, UserRound } from "lucide-react";

import { signOut, useSession } from "@/lib/auth-client";

export function AccountSessionControl() {
  const { data: session, error: sessionError, isPending } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError("");

    try {
      const { error } = await signOut();

      if (error) {
        setSignOutError("Tidak dapat keluar. Coba lagi.");
      }
    } catch {
      setSignOutError("Tidak dapat keluar. Coba lagi.");
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isPending) {
    return (
      <span
        role="status"
        aria-label="Memeriksa status akun"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-500"
      >
        <UserRound aria-hidden="true" className="h-4 w-4" />
      </span>
    );
  }

  if (sessionError) {
    return (
      <span
        role="status"
        title="Status akun tidak tersedia"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-amber-800"
      >
        <Info aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="sr-only sm:not-sr-only">Akun tidak tersedia</span>
      </span>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/akun/masuk"
        aria-label="Masuk ke akun member"
        title="Masuk"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <UserRound aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="sr-only sm:not-sr-only">Masuk</span>
      </Link>
    );
  }

  const accountLabel = session.user.role === "admin" ? "Admin" : "Member";
  const displayName = session.user.name?.trim() || accountLabel;

  return (
    <div className="relative flex items-center gap-1">
      {session.user.role === "user" ? (
        <Link
          href="/akun/profil"
          aria-label="Buka Profil Saya"
          title="Profil Saya"
          className="inline-flex items-center gap-1 rounded-lg px-1 py-1 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          <span
            title={displayName}
            className="max-w-28 truncate text-xs font-medium text-stone-700 lg:max-w-40 lg:text-sm"
          >
            <span className="hidden lg:inline">{displayName}</span>
          </span>
          <span
            aria-label={`Status akun: ${accountLabel}`}
            className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold leading-none text-emerald-800 ring-1 ring-inset ring-emerald-200 sm:text-xs"
          >
            {accountLabel}
          </span>
        </Link>
      ) : (
        <>
          <span
            title={displayName}
            className="max-w-28 truncate text-xs font-medium text-stone-700 lg:max-w-40 lg:text-sm"
          >
            <span className="hidden lg:inline">{displayName}</span>
          </span>
          <span
            aria-label={`Status akun: ${accountLabel}`}
            className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold leading-none text-emerald-800 ring-1 ring-inset ring-emerald-200 sm:text-xs"
          >
            {accountLabel}
          </span>
        </>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        aria-label={isSigningOut ? "Sedang keluar" : "Keluar dari akun"}
        aria-busy={isSigningOut}
        title={isSigningOut ? "Sedang keluar" : "Keluar"}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-stone-600 transition hover:bg-orange-50 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-wait disabled:opacity-70"
      >
        {isSigningOut ? (
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut aria-hidden="true" className="h-4 w-4" />
        )}
        <span className="sr-only sm:not-sr-only">{isSigningOut ? "Keluar..." : "Keluar"}</span>
      </button>
      {signOutError ? (
        <span
          role="alert"
          className="absolute right-0 top-full z-50 mt-2 w-max max-w-56 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-800 shadow-lg"
        >
          {signOutError}
        </span>
      ) : null}
    </div>
  );
}
