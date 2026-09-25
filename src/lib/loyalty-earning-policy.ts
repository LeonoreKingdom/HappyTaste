import "server-only";

export const BASE_IDR_PER_POINT = 1_000;

export function calculateBaseLoyaltyPoints(
  orderTotalIdr: number,
  idrPerPoint = BASE_IDR_PER_POINT,
) {
  if (
    !Number.isSafeInteger(orderTotalIdr) ||
    orderTotalIdr <= 0 ||
    !Number.isSafeInteger(idrPerPoint) ||
    idrPerPoint <= 0
  ) {
    return 0;
  }

  return Math.floor(orderTotalIdr / idrPerPoint);
}
