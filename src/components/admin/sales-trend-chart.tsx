import type {
  AdminSalesTrendRange,
} from "@/db/queries/admin-dashboard";

type SalesTrendPoint = {
  date: string;
  label: string;
  completedOrderValue: number;
  completedOrders: number;
};

type SalesTrendChartProps = {
  range: AdminSalesTrendRange;
  data: {
    startDate: string;
    endDate: string;
    totalCompletedOrderValue: number;
    completedOrders: number;
    points: SalesTrendPoint[];
  };
};

const rangeLabels: Record<AdminSalesTrendRange, string> = {
  "7d": "7 hari",
  "30d": "30 hari",
  "90d": "90 hari",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function getDateTickIndexes(pointCount: number) {
  if (pointCount <= 5) {
    return Array.from({ length: pointCount }, (_, index) => index);
  }

  return [...new Set([0, 1, 2, 3, 4].map((tick) => Math.round((tick * (pointCount - 1)) / 4)))];
}

export function SalesTrendChart({ range, data }: SalesTrendChartProps) {
  const width = 720;
  const height = 280;
  const padding = { top: 18, right: 18, bottom: 38, left: 78 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxCompletedOrderValue = Math.max(
    1,
    ...data.points.map((point) => point.completedOrderValue),
  );
  const dateTickIndexes = new Set(getDateTickIndexes(data.points.length));
  const coordinates = data.points.map((point, index) => {
    const x = data.points.length === 1
      ? padding.left + chartWidth / 2
      : padding.left + (index / (data.points.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (point.completedOrderValue / maxCompletedOrderValue) * chartHeight;

    return { ...point, x, y };
  });
  const polylinePoints = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <section aria-labelledby="sales-trend-heading" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-800">Nilai pesanan berstatus selesai</p>
          <h2 id="sales-trend-heading" className="mt-1 text-lg font-bold text-stone-950">
            Tren nilai pesanan
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            {rangeLabels[range]} · {data.completedOrders} pesanan selesai · {currencyFormatter.format(data.totalCompletedOrderValue)}
          </p>
        </div>

        <form action="/admin" method="get" className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="sales-trend-range" className="mb-1 block text-xs font-semibold text-stone-600">
              Rentang waktu
            </label>
            <select
              id="sales-trend-range"
              name="range"
              defaultValue={range}
              className="min-h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              <option value="7d">7 hari terakhir</option>
              <option value="30d">30 hari terakhir</option>
              <option value="90d">90 hari terakhir</option>
            </select>
          </div>
          <button
            type="submit"
            className="min-h-10 rounded-xl bg-orange-700 px-4 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Terapkan
          </button>
        </form>
      </header>

      {data.totalCompletedOrderValue > 0 ? (
        <figure className="mt-6">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-labelledby="sales-trend-chart-title sales-trend-chart-description"
            className="h-auto w-full overflow-visible"
          >
            <title id="sales-trend-chart-title">Nilai pesanan selesai {rangeLabels[range]}</title>
            <desc id="sales-trend-chart-description">
              Grafik garis total pesanan berstatus selesai, dikelompokkan berdasarkan tanggal pesanan dibuat antara {data.startDate} dan {data.endDate}.
            </desc>

            {[0, 0.5, 1].map((fraction) => {
              const y = padding.top + chartHeight * (1 - fraction);
              const amount = Math.round(maxCompletedOrderValue * fraction);

              return (
                <g key={fraction} aria-hidden="true">
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#e7e5e4"
                    strokeDasharray={fraction === 0 ? undefined : "4 5"}
                  />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-stone-500 text-[11px]">
                    {compactCurrencyFormatter.format(amount)}
                  </text>
                </g>
              );
            })}

            {coordinates.length > 1 && (
              <polyline
                points={polylinePoints}
                fill="none"
                stroke="#c2410c"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            )}

            {coordinates.map((point) => (
              <circle key={point.date} cx={point.x} cy={point.y} r="4" fill="#c2410c" stroke="white" strokeWidth="2">
                <title>{`${point.label}: ${currencyFormatter.format(point.completedOrderValue)}, ${point.completedOrders} pesanan selesai`}</title>
              </circle>
            ))}

            {coordinates.map((point, index) => dateTickIndexes.has(index) && (
              <text
                key={`label-${point.date}`}
                x={point.x}
                y={height - 10}
                textAnchor={index === 0 ? "start" : index === coordinates.length - 1 ? "end" : "middle"}
                className="fill-stone-500 text-[11px]"
              >
                {point.label}
              </text>
            ))}
          </svg>

          <table className="sr-only">
            <caption>Rincian nilai pesanan berstatus selesai menurut tanggal pesanan dibuat untuk {rangeLabels[range]}</caption>
            <thead>
              <tr><th scope="col">Tanggal pesanan dibuat</th><th scope="col">Nilai pesanan selesai</th><th scope="col">Pesanan selesai</th></tr>
            </thead>
            <tbody>
              {data.points.map((point) => (
                <tr key={point.date}>
                  <th scope="row">{point.date}</th>
                  <td>{currencyFormatter.format(point.completedOrderValue)}</td>
                  <td>{point.completedOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      ) : (
        <div role="status" className="mt-6 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center">
          <p className="text-sm font-semibold text-stone-900">Belum ada penjualan selesai pada rentang ini</p>
          <p className="mt-1 text-xs text-stone-500">Grafik akan terisi setelah transaksi selesai tercatat.</p>
        </div>
      )}
    </section>
  );
}
