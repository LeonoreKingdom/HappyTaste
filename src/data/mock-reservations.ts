export const mockReservationOutlets = [
  {
    id: "happy-taste-demo",
    name: "HappyTaste Resto — Outlet Demo",
    address: "Lokasi demo — bukan alamat outlet resmi",
    latitude: -6.175392,
    longitude: 106.827153,
    isDemoLocation: true,
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

export const mockMemberReservations = [
  {
    id: "demo-reservation-confirmed",
    arrivalDate: "2026-10-02",
    arrivalTime: "19:30",
    guestCount: 2,
    outletId: "happy-taste-demo",
    tableTypeId: "standard",
    status: "confirmed",
  },
  {
    id: "demo-reservation-pending",
    arrivalDate: "2026-09-28",
    arrivalTime: "18:00",
    guestCount: 4,
    outletId: "happy-taste-demo",
    tableTypeId: "family",
    status: "pending",
  },
  {
    id: "demo-reservation-cancelled",
    arrivalDate: "2026-09-18",
    arrivalTime: "12:30",
    guestCount: 2,
    outletId: "happy-taste-demo",
    tableTypeId: "standard",
    status: "cancelled",
  },
  {
    id: "demo-reservation-completed",
    arrivalDate: "2026-09-12",
    arrivalTime: "11:00",
    guestCount: 3,
    outletId: "happy-taste-demo",
    tableTypeId: "family",
    status: "completed",
  },
] as const;
