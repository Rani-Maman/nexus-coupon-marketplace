import { Product } from "@prisma/client";
import { ProductRepository } from "./product.repository";
import { AppError } from "../../errors/app-error";
import { computeMinSellPrice } from "../../utils/pricing";
import { CreateProductInput, UpdateProductInput } from "./product.schema";

export class ProductService {
  constructor(private repository: ProductRepository) {}

  async listAvailable(): Promise<Product[]> {
    return this.repository.findUnsold();
  }

  async listAll(): Promise<Product[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
    }
    return product;
  }

  async create(input: CreateProductInput): Promise<Product> {
    return this.repository.create({
      name: input.name,
      description: input.description,
      type: input.type,
      imageUrl: input.image_url,
      costPrice: input.cost_price,
      marginPercentage: input.margin_percentage,
      valueType: input.value_type,
      value: input.value,
    });
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    await this.getById(id);
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.type !== undefined) data.type = input.type;
    if (input.image_url !== undefined) data.imageUrl = input.image_url;
    if (input.cost_price !== undefined) data.costPrice = input.cost_price;
    if (input.margin_percentage !== undefined)
      data.marginPercentage = input.margin_percentage;
    if (input.value_type !== undefined) data.valueType = input.value_type;
    if (input.value !== undefined) data.value = input.value;
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repository.delete(id);
  }

  async purchaseAsCustomer(
    productId: string
  ): Promise<{ product: Product; finalPrice: number }> {
    const product = await this.repository.atomicPurchase(productId);
    const finalPrice = computeMinSellPrice(
      product.costPrice,
      product.marginPercentage
    );
    return { product, finalPrice };
  }

  async purchaseAsReseller(
    productId: string,
    resellerPrice: number
  ): Promise<{ product: Product; finalPrice: number }> {
    const product = await this.repository.atomicPurchase(productId, {
      resellerPrice,
    });
    return { product, finalPrice: resellerPrice };
  }
}
