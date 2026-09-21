"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, QrCode, ScanLine } from "lucide-react";

import {
  findMockTableFromQrValue,
  mockTables,
  type MockTable,
} from "@/data/mock-tables";

type BarcodeResult = { rawValue: string };
type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<BarcodeResult[]>;
};
type BarcodeDetectorConstructor = {
  new (options: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
};

type CameraState = "idle" | "starting" | "scanning";

function getBarcodeDetectorConstructor() {
  return (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor })
    .BarcodeDetector;
}

function getCameraErrorMessage(error: unknown) {
  const errorName = error instanceof DOMException ? error.name : "";

  if (errorName === "NotAllowedError" || errorName === "SecurityError") {
    return "Akses kamera tidak diizinkan. Izinkan kamera di browser atau masukkan kode meja secara manual.";
  }
  if (errorName === "NotFoundError") {
    return "Kamera tidak ditemukan di perangkat ini. Masukkan kode meja secara manual.";
  }
  if (errorName === "NotReadableError") {
    return "Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut atau masukkan kode meja secara manual.";
  }

  return "Kamera belum dapat digunakan. Coba lagi atau masukkan kode meja secara manual.";
}

export function QrTableScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const detectionActiveRef = useRef(false);
  const detectionTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  const cameraRequestIdRef = useRef(0);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [selectedTable, setSelectedTable] = useState<MockTable | null>(null);

  function stopCamera() {
    cameraRequestIdRef.current += 1;
    detectionActiveRef.current = false;
    if (detectionTimerRef.current !== null) {
      window.clearTimeout(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
  }

  function acceptQrValue(value: string) {
    const table = findMockTableFromQrValue(value);
    if (!table) {
      setSelectedTable(null);
      setCameraMessage(
        "QR tidak cocok dengan meja demo HappyTaste. Pastikan kode meja benar, lalu coba lagi.",
      );
      return;
    }

    setSelectedTable(table);
    setManualCode(table.qrValue);
    setCameraMessage(null);
  }

  async function startCamera() {
    setCameraMessage(null);
    setSelectedTable(null);

    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setCameraMessage(
        "Pemindaian kamera memerlukan HTTPS atau localhost. Kamu tetap bisa memasukkan kode meja secara manual.",
      );
      return;
    }

    const BarcodeDetector = getBarcodeDetectorConstructor();
    if (!BarcodeDetector) {
      setCameraMessage(
        "Browser ini belum mendukung pembacaan QR otomatis. Masukkan kode meja secara manual untuk melanjutkan.",
      );
      return;
    }

    const requestId = cameraRequestIdRef.current + 1;
    cameraRequestIdRef.current = requestId;
    setCameraState("starting");
    let requestedStream: MediaStream | null = null;
    try {
      const formats = await BarcodeDetector.getSupportedFormats?.();
      if (!isMountedRef.current || cameraRequestIdRef.current !== requestId) return;
      if (formats && !formats.includes("qr_code")) {
        setCameraState("idle");
        setCameraMessage(
          "Browser ini belum mendukung format QR. Masukkan kode meja secara manual untuk melanjutkan.",
        );
        return;
      }

      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      requestedStream = stream;

      if (
        !isMountedRef.current ||
        cameraRequestIdRef.current !== requestId ||
        !videoRef.current
      ) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      detectorRef.current = detector;
      videoRef.current.srcObject = stream;
      setCameraState("scanning");
      await videoRef.current.play();
      if (
        !isMountedRef.current ||
        cameraRequestIdRef.current !== requestId ||
        streamRef.current !== stream
      ) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      detectionActiveRef.current = true;

      async function inspectFrame() {
        const video = videoRef.current;
        const activeDetector = detectorRef.current;
        if (!detectionActiveRef.current || !video || !activeDetector) return;

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          try {
            const [result] = await activeDetector.detect(video);
            if (!detectionActiveRef.current) return;
            if (result) {
              stopCamera();
              acceptQrValue(result.rawValue);
              return;
            }
          } catch {
            if (!detectionActiveRef.current) return;
            stopCamera();
            setCameraMessage(
              "QR tidak dapat dibaca dari kamera. Coba posisikan ulang atau masukkan kode meja secara manual.",
            );
            return;
          }
        }

        if (detectionActiveRef.current) {
          detectionTimerRef.current = window.setTimeout(() => {
            void inspectFrame();
          }, 300);
        }
      }

      void inspectFrame();
    } catch (error) {
      if (!isMountedRef.current || cameraRequestIdRef.current !== requestId) {
        if (requestedStream && streamRef.current !== requestedStream) {
          requestedStream.getTracks().forEach((track) => track.stop());
        }
        return;
      }
      stopCamera();
      setCameraMessage(getCameraErrorMessage(error));
    }
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopCamera();
    setSelectedTable(null);
    acceptQrValue(manualCode);
  }

  useEffect(
    () => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        cameraRequestIdRef.current += 1;
        detectionActiveRef.current = false;
        if (detectionTimerRef.current !== null) {
          window.clearTimeout(detectionTimerRef.current);
        }
        streamRef.current?.getTracks().forEach((track) => track.stop());
      };
    },
    [],
  );

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/order"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke pemesanan
      </Link>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold tracking-wide text-orange-700">
              PESAN DI TEMPAT
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
              Scan QR meja
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-stone-600">
              Arahkan kamera ke QR HappyTaste pada meja. Setelah meja dikenali,
              kamu bisa melanjutkan memilih menu.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-950 p-3 shadow-xl">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-stone-900 sm:aspect-video">
              <video
                ref={videoRef}
                muted
                autoPlay
                playsInline
                aria-label="Pratinjau kamera untuk memindai QR meja"
                aria-hidden={cameraState !== "scanning"}
                className={`absolute inset-0 h-full w-full object-cover ${cameraState === "scanning" ? "" : "hidden"}`}
              />
              {cameraState !== "scanning" ? (
                <div className="flex flex-col items-center gap-3 px-6 text-center text-stone-300">
                  <Camera className="h-10 w-10 text-orange-400" />
                  <p className="text-sm">
                    Kamera hanya aktif setelah kamu menekan tombol mulai scan.
                  </p>
                </div>
              ) : null}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[15%] rounded-3xl border-2 border-dashed border-orange-300/90 shadow-[0_0_0_999px_rgb(0_0_0_/_0.2)]"
              >
                <span className="absolute left-1/2 top-1/2 h-px w-[82%] -translate-x-1/2 bg-orange-300/90" />
                <ScanLine className="absolute -right-4 -top-4 h-8 w-8 text-orange-300" />
              </div>
              {cameraState === "starting" ? (
                <p role="status" className="absolute bottom-4 rounded-full bg-black/70 px-4 py-2 text-sm text-white">
                  Menyiapkan kamera…
                </p>
              ) : null}
              {cameraState === "scanning" ? (
                <p role="status" className="absolute bottom-4 rounded-full bg-black/70 px-4 py-2 text-sm text-white">
                  Arahkan QR ke dalam bingkai
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {cameraState === "scanning" ? (
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
              >
                Matikan kamera
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                disabled={cameraState === "starting"}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-wait disabled:opacity-70"
              >
                <Camera className="h-4 w-4" />
                {cameraState === "starting" ? "Menyiapkan kamera…" : "Mulai scan kamera"}
              </button>
            )}
          </div>

          {cameraMessage ? (
            <p
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
            >
              {cameraMessage}
            </p>
          ) : null}

          {selectedTable ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p role="status" className="flex items-center gap-2 font-semibold text-emerald-900">
                <Check className="h-5 w-5" /> {selectedTable.label} berhasil dikenali
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Pilihan meja ini masih data demo dan belum divalidasi oleh server.
              </p>
              <Link
                href={`/order?table=${encodeURIComponent(selectedTable.id)}`}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              >
                Lanjut memilih menu
              </Link>
            </div>
          ) : null}
        </div>

        <aside className="h-fit space-y-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
              <QrCode className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-bold text-stone-900">Scan QR meja</h2>
              <p className="text-sm text-stone-600">Atau masukkan kode demo</p>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label htmlFor="table-qr-code" className="block text-sm font-medium text-stone-800">
              Kode pada QR meja
            </label>
            <input
              id="table-qr-code"
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              value={manualCode}
              onChange={(event) => {
                setManualCode(event.target.value);
                setSelectedTable(null);
                setCameraMessage(null);
              }}
              placeholder="HAPPYTASTE:TABLE:01"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm uppercase text-stone-900 outline-none transition placeholder:normal-case placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-900 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Verifikasi kode demo
            </button>
          </form>

          <div className="rounded-xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Kode QR untuk simulasi
            </p>
            <ul className="mt-2 space-y-1 text-sm text-stone-700">
              {mockTables.map((table) => (
                <li key={table.id}>
                  {table.label}: <code>{table.qrValue}</code>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
