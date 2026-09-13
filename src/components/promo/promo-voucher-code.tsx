"use client";

import { useState } from "react";
import { Copy, Check, Ticket } from "lucide-react";

interface PromoVoucherCodeProps {
  code: string;
}

export function PromoVoucherCode({ code }: PromoVoucherCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-orange-50/80 border border-dashed border-orange-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
            Kode Voucher Promo
          </span>
          <div className="font-mono text-base sm:text-lg font-bold text-gray-900 tracking-wider">
            {code}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-orange-200 text-orange-700 hover:bg-orange-100/50 text-xs font-semibold shadow-sm transition-all active:scale-95"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700">Tersalin!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Salin Kode</span>
          </>
        )}
      </button>
    </div>
  );
}
