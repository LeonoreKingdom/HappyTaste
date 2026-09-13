"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Promo } from "@/types/promo";
import { X, Sparkles, Tag, ArrowRight } from "lucide-react";

interface PromoPopupDialogProps {
  promo: Promo;
  sessionKey?: string;
  delayMs?: number;
}

export function PromoPopupDialog({
  promo,
  sessionKey = "happytaste_promo_popup_seen",
  delayMs = 1200,
}: PromoPopupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem(sessionKey);
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem(sessionKey, "true");
        }, delayMs);

        return () => clearTimeout(timer);
      }
    } catch {
      // Handle private browsing or disabled storage safely
    }
  }, [sessionKey, delayMs]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
      aria-describedby="promo-popup-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          ref={closeButtonRef}
          aria-label="Tutup Pop Up Promo"
          className="absolute right-3 top-3 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Promo Image Header */}
        <Link
          href={`/promo/${promo.id}`}
          onClick={handleClose}
          className="group relative block h-48 w-full cursor-pointer overflow-hidden bg-orange-600"
        >
          <Image
            src={promo.bannerUrl}
            alt={promo.title}
            fill
            sizes="(min-width: 768px) 448px, 100vw"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center gap-1 shadow">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Spesial Hari Ini!</span>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </Link>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Link
              href={`/promo/${promo.id}`}
              onClick={handleClose}
              className="block group"
            >
              <h2
                id="promo-popup-title"
                className="text-xl font-bold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors"
              >
                {promo.title}
              </h2>
            </Link>
            <p
              id="promo-popup-description"
              className="text-sm text-gray-600 leading-relaxed"
            >
              {promo.description}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Nanti Saja
            </button>
            <Link
              href={`/promo/${promo.id}`}
              onClick={handleClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-md transition-all active:scale-95"
            >
              <Tag className="w-4 h-4" />
              <span>Lihat Promo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
