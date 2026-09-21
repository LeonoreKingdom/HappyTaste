"use client";

import { useEffect, useState } from "react";

type OutletOpeningStatusProps = {
  opensAt: string;
  closesAt: string;
  timeZone: string;
};

function parseMinutes(time: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function isOpenAtCurrentTime(opensAt: string, closesAt: string, timeZone: string) {
  const openingMinute = parseMinutes(opensAt);
  const closingMinute = parseMinutes(closesAt);

  if (openingMinute === null || closingMinute === null || openingMinute === closingMinute) {
    return null;
  }

  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const currentHour = Number(timeParts.find((part) => part.type === "hour")?.value);
  const currentMinute = Number(timeParts.find((part) => part.type === "minute")?.value);

  if (!Number.isInteger(currentHour) || !Number.isInteger(currentMinute)) return null;

  const currentTime = currentHour * 60 + currentMinute;

  return openingMinute < closingMinute
    ? currentTime >= openingMinute && currentTime < closingMinute
    : currentTime >= openingMinute || currentTime < closingMinute;
}

export function OutletOpeningStatus({ opensAt, closesAt, timeZone }: OutletOpeningStatusProps) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const updateStatus = () => setIsOpen(isOpenAtCurrentTime(opensAt, closesAt, timeZone));

    updateStatus();
    const intervalId = window.setInterval(updateStatus, 60_000);

    return () => window.clearInterval(intervalId);
  }, [opensAt, closesAt, timeZone]);

  const statusLabel =
    isOpen === null ? "Menyiapkan status demo" : isOpen ? "Buka sekarang (demo)" : "Tutup sekarang (demo)";
  const statusStyle =
    isOpen === true
      ? "bg-emerald-100 text-emerald-800"
      : isOpen === false
        ? "bg-stone-100 text-stone-700"
        : "bg-amber-100 text-amber-900";

  return (
    <span
      aria-live="polite"
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyle}`}
    >
      {statusLabel}
    </span>
  );
}
