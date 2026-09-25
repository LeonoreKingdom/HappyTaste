import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { orderItems, orders, outlets, restaurantTables } from "@/db/schema";
import { user as authUser } from "@/db/schema/auth";

const ADMIN_ORDER_LIST_LIMIT = 100;

export async function listAdminOrders() {
  return db
    .select({
      id: orders.id,
      userId: orders.userId,
      memberName: authUser.name,
      outletName: outlets.name,
      outletIsDemoLocation: outlets.isDemoLocation,
      tableId: orders.tableId,
      tableNumber: restaurantTables.tableNumber,
      orderType: orders.orderType,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      total: orders.total,
      scheduledAt: orders.scheduledAt,
      createdAt: orders.createdAt,
      itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
    })
    .from(orders)
    .leftJoin(authUser, eq(orders.userId, authUser.id))
    .leftJoin(outlets, eq(orders.outletId, outlets.id))
    .leftJoin(restaurantTables, eq(orders.tableId, restaurantTables.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .groupBy(
      orders.id,
      orders.userId,
      authUser.name,
      outlets.name,
      outlets.isDemoLocation,
      orders.tableId,
      restaurantTables.tableNumber,
      orders.orderType,
      orders.status,
      orders.paymentMethod,
      orders.total,
      orders.scheduledAt,
      orders.createdAt,
    )
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(ADMIN_ORDER_LIST_LIMIT);
}
