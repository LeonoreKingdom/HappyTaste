export type LocationContactChannelId = "phone" | "whatsapp" | "email";

export type LocationContactChannel = {
  id: LocationContactChannelId;
  label: string;
  value: string | null;
  unavailableMessage: string;
};

const contactChannels: LocationContactChannel[] = [
  {
    id: "phone",
    label: "Telepon",
    value: null,
    unavailableMessage: "Nomor telepon demo belum tersedia.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: null,
    unavailableMessage: "Nomor WhatsApp demo belum tersedia.",
  },
  {
    id: "email",
    label: "Email",
    value: null,
    unavailableMessage: "Alamat email demo belum tersedia.",
  },
];

export const mockLocationContactInfo = {
  mapAvailability: "Peta ini hanya menunjukkan koordinat demo, bukan lokasi outlet resmi HappyTaste.",
  operatingHours: {
    opensAt: "10:00",
    closesAt: "22:00",
    daysLabel: "Setiap hari",
    timeZone: "Asia/Jakarta",
  },
  facilities: ["Area makan", "Area parkir", "Wi-Fi"],
  contactChannels,
} as const;
