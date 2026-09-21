export const mockLocationContactInfo = {
  mapAvailability: "Peta ini hanya menunjukkan koordinat demo, bukan lokasi outlet resmi HappyTaste.",
  operatingHours: {
    opensAt: "10:00",
    closesAt: "22:00",
    daysLabel: "Setiap hari",
    timeZone: "Asia/Jakarta",
  },
  facilities: ["Area makan", "Area parkir", "Wi-Fi"],
  contactChannels: [
    { id: "phone", label: "Telepon", value: "Nomor telepon demo belum tersedia." },
    { id: "whatsapp", label: "WhatsApp", value: "Nomor WhatsApp demo belum tersedia." },
    { id: "email", label: "Email", value: "Alamat email demo belum tersedia." },
  ],
} as const;
