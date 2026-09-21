export const mockTables = [
  { id: "table-01", label: "Meja 01", qrValue: "HAPPYTASTE:TABLE:01" },
  { id: "table-02", label: "Meja 02", qrValue: "HAPPYTASTE:TABLE:02" },
  { id: "table-03", label: "Meja 03", qrValue: "HAPPYTASTE:TABLE:03" },
] as const;

export type MockTable = (typeof mockTables)[number];

export function findMockTableFromQrValue(value: string): MockTable | undefined {
  const normalizedValue = value.trim().toLocaleUpperCase("id-ID");

  return mockTables.find(
    (table) =>
      table.id.toLocaleUpperCase("id-ID") === normalizedValue ||
      table.qrValue.toLocaleUpperCase("id-ID") === normalizedValue,
  );
}

export function getMockTableById(id: string): MockTable | undefined {
  return mockTables.find((table) => table.id === id);
}
