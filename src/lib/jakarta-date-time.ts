const JAKARTA_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

export function toJakartaDateTimeLocal(date: Date) {
  return new Date(date.getTime() + JAKARTA_UTC_OFFSET_MS)
    .toISOString()
    .slice(0, 16);
}
