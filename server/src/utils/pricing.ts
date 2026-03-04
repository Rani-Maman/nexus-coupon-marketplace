import { Decimal } from "@prisma/client/runtime/library";

export function computeMinSellPrice(
  costPrice: Decimal | number,
  marginPercentage: Decimal | number
): number {
  const cost = Number(costPrice);
  const margin = Number(marginPercentage);
  return Math.round(cost * (1 + margin / 100) * 100) / 100;
}
