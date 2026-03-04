import { Product } from "@prisma/client";
import { computeMinSellPrice } from "../../utils/pricing";

export function toPublicProductDto(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image_url: product.imageUrl,
    price: computeMinSellPrice(product.costPrice, product.marginPercentage),
  };
}

export function toPurchaseResponseDto(product: Product, finalPrice: number) {
  return {
    product_id: product.id,
    final_price: finalPrice,
    value_type: product.valueType,
    value: product.value,
  };
}

export function toAdminProductDto(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    type: product.type,
    image_url: product.imageUrl,
    cost_price: Number(product.costPrice),
    margin_percentage: Number(product.marginPercentage),
    minimum_sell_price: computeMinSellPrice(
      product.costPrice,
      product.marginPercentage
    ),
    is_sold: product.isSold,
    value_type: product.valueType,
    value: product.value,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
}
