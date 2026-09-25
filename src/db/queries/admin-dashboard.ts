import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  lt,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  menuCategories,
  memberProfiles,
  menus,
  orderItems,
  orders,
  reservations,
  type orderStatuses,
} from "@/db/schema";

export type AdminDashboardOrderStatus = (typeof orderStatuses)[number];
export type AdminSalesTrendRange = "7d" | "30d" | "90d";

export function parseAdminSalesTrendRange(
  value: string | string[] | null | undefined,
): AdminSalesTrendRange {
  const candidate = Array.isArray(value) ? value[0] : value;

  return candidate === "30d" || candidate === "90d" ? candidate : "7d";
}

const adminSalesTrendRangeDays: Record<AdminSalesTrendRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function getJakartaDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function getJakartaDayWindow(now: Date) {
  const dateKey = getJakartaDateKey(now);
  const startAt = new Date(`${dateKey}T00:00:00+07:00`);

  return {
    dateKey,
    startAt,
    endAt: new Date(startAt.getTime() + 24 * 60 * 60 * 1000),
    displayDate: new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeZone: "Asia/Jakarta",
    }).format(now),
  };
}

export async function getAdminSalesTrend(
  range: AdminSalesTrendRange,
  now = new Date(),
) {
  const currentDay = getJakartaDayWindow(now);
  const rangeDays = adminSalesTrendRangeDays[range];
  const startAt = new Date(
    currentDay.startAt.getTime() - (rangeDays - 1) * 24 * 60 * 60 * 1000,
  );
  const dateExpression = sql<string>`date(${orders.createdAt}, 'unixepoch', '+7 hours')`;
  const rows = await db
    .select({
      date: dateExpression,
      completedOrderValue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      completedOrders: count(),
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startAt),
        lt(orders.createdAt, currentDay.endAt),
        eq(orders.status, "completed"),
      ),
    )
    .groupBy(dateExpression)
    .orderBy(asc(dateExpression));
  const rowsByDate = new Map(rows.map((row) => [row.date, row]));
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
  const points = Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date(startAt.getTime() + index * 24 * 60 * 60 * 1000);
    const dateKey = getJakartaDateKey(date);
    const row = rowsByDate.get(dateKey);

    return {
      date: dateKey,
      label: dateFormatter.format(date),
      completedOrderValue: row?.completedOrderValue ?? 0,
      completedOrders: row?.completedOrders ?? 0,
    };
  });

  return {
    range,
    startDate: points[0]?.date ?? currentDay.dateKey,
    endDate: currentDay.dateKey,
    totalCompletedOrderValue: points.reduce(
      (total, point) => total + point.completedOrderValue,
      0,
    ),
    completedOrders: points.reduce((total, point) => total + point.completedOrders, 0),
    points,
  };
}

export async function getAdminDailyDashboard(now = new Date()) {
  const day = getJakartaDayWindow(now);

  const [orderSummary, reservationSummary, memberSummary, recentOrders, bestSellers] =
    await Promise.all([
      db
        .select({
          totalCreated: count(),
          active: sql<number>`coalesce(sum(case when ${orders.status} in ('pending', 'confirmed', 'preparing', 'ready') then 1 else 0 end), 0)`,
          completed: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then 1 else 0 end), 0)`,
          completedOrderValue: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.total} else 0 end), 0)`,
        })
        .from(orders)
        .where(and(gte(orders.createdAt, day.startAt), lt(orders.createdAt, day.endAt))),
      db
        .select({
          active: count(),
          pending: sql<number>`coalesce(sum(case when ${reservations.status} = 'pending' then 1 else 0 end), 0)`,
        })
        .from(reservations)
        .where(
          and(
            eq(reservations.arrivalDate, day.dateKey),
            inArray(reservations.status, ["pending", "confirmed"]),
          ),
        ),
      db.select({ total: count() }).from(memberProfiles),
      db
        .select({
          id: orders.id,
          status: orders.status,
          orderType: orders.orderType,
          total: orders.total,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(and(gte(orders.createdAt, day.startAt), lt(orders.createdAt, day.endAt)))
        .orderBy(desc(orders.createdAt), desc(orders.id))
        .limit(6),
      db
        .select({
          id: menus.id,
          name: menus.name,
          category: menuCategories.name,
          unitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(menus, eq(orderItems.menuId, menus.id))
        .innerJoin(menuCategories, eq(menus.categoryId, menuCategories.id))
        .where(
          and(
            gte(orders.createdAt, day.startAt),
            lt(orders.createdAt, day.endAt),
            eq(orders.status, "completed"),
          ),
        )
        .groupBy(menus.id, menus.name, menuCategories.name)
        .orderBy(desc(sql<number>`sum(${orderItems.quantity})`), asc(menus.name))
        .limit(3),
    ]);

  return {
    date: day.dateKey,
    displayDate: day.displayDate,
    orders: {
      totalCreated: orderSummary[0]?.totalCreated ?? 0,
      active: orderSummary[0]?.active ?? 0,
      completed: orderSummary[0]?.completed ?? 0,
      completedOrderValue: orderSummary[0]?.completedOrderValue ?? 0,
    },
    reservations: {
      active: reservationSummary[0]?.active ?? 0,
      pending: reservationSummary[0]?.pending ?? 0,
    },
    memberCount: memberSummary[0]?.total ?? 0,
    recentOrders,
    bestSellers,
  };
}
