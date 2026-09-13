"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Banner, Promo } from "@/types/promo";
import { ChevronLeft, ChevronRight, Tag, Sparkles, ArrowRight } from "lucide-react";

interface PromoCarouselProps {
  banners: Banner[];
  promos: Promo[];
  autoPlayInterval?: number;
}

export function PromoCarousel({
  banners,
  promos,
  autoPlayInterval = 5000,
}: PromoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const total = banners.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-advance
  useEffect(() => {
    if (isPaused || total <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, total, autoPlayInterval, handleNext]);

  // Touch gesture handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  if (banners.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 shadow-xl select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Slider Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const promo = promos.find((p) => p.id === banner.promoId);

          return (
            <div
              key={banner.id}
              className="w-full flex-shrink-0 grid md:grid-cols-2 gap-6 p-6 sm:p-8 md:p-10 items-center text-white"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider text-orange-50">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Promo Spesial #{index + 1}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {banner.title}
                </h1>

                <p className="text-orange-100 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {promo?.description ||
                    "Kunjungi HappyTaste dan nikmati beragam promo menarik serta sajian hidangan lezat berkualitas."}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-semibold text-sm shadow-md transition-all transform active:scale-95"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Lihat Detail Promo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="relative aspect-[16/9] md:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-orange-700/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  draggable={false}
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-xs font-medium">
                  HappyTaste Resto
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Promo Sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Promo Berikutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur transition-all active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots / Indicators */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => handleDotClick(index)}
              aria-label={`Pindah ke banner ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? "w-7 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
