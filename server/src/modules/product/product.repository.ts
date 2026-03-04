import { PrismaClient, Product, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { AppError } from "../../errors/app-error";
import { computeMinSellPrice } from "../../utils/pricing";

// Raw SQL returns snake_case column names
interface RawProduct {
  id: string;
  is_sold: boolean;
  cost_price: Decimal;
  margin_percentage: Decimal;
}

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findUnsold(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { isSold: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async atomicPurchase(
    productId: string,
    priceValidation?: { resellerPrice: number }
  ): Promise<Product> {
    return this.prisma.$transaction(async (tx) => {
      // Raw SQL for SELECT ... FOR UPDATE (returns snake_case columns)
      const rows = await tx.$queryRaw<RawProduct[]>`
        SELECT id, is_sold, cost_price, margin_percentage
        FROM products
        WHERE id = ${productId}::uuid
        FOR UPDATE
      `;

      const row = rows[0];
      if (!row) {
        throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
      }

      if (row.is_sold) {
        throw new AppError(
          "PRODUCT_ALREADY_SOLD",
          "Product has already been sold",
          409
        );
      }

      if (priceValidation) {
        const minSellPrice = computeMinSellPrice(
          row.cost_price,
          row.margin_percentage
        );
        if (priceValidation.resellerPrice < minSellPrice) {
          throw new AppError(
            "RESELLER_PRICE_TOO_LOW",
            `Reseller price must be at least ${minSellPrice}`,
            400
          );
        }
      }

      const updated = await tx.product.update({
        where: { id: productId },
        data: { isSold: true },
      });

      return updated;
    });
  }
}
