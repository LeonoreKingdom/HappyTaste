export const mockReservationOutlets = [
  {
    id: "happy-taste-demo",
    name: "HappyTaste Resto — Outlet Demo",
    address: "Alamat outlet demo belum tersedia.",
  },
] as const;

export const mockReservationTimeSlots = [
  "11:00",
  "12:30",
  "14:00",
  "18:00",
  "19:30",
] as const;

export const mockReservationTableTypes = [
  {
    id: "standard",
    label: "Meja standar",
    description: "Contoh untuk 1–4 tamu.",
    minGuests: 1,
    maxGuests: 4,
  },
  {
    id: "family",
    label: "Meja keluarga",
    description: "Area lebih luas, contoh untuk 3–8 tamu.",
    minGuests: 3,
    maxGuests: 8,
  },
] as const;
