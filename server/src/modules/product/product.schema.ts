import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.enum(["COUPON"]).default("COUPON"),
  image_url: z.string().url(),
  cost_price: z.number().min(0),
  margin_percentage: z.number().min(0),
  value_type: z.enum(["STRING", "IMAGE"]),
  value: z.string().min(1),
});

export const updateProductSchema = createProductSchema.partial();

export const resellerPurchaseSchema = z.object({
  reseller_price: z.number().positive(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
