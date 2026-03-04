-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('COUPON');

-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('STRING', 'IMAGE');

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ProductType" NOT NULL DEFAULT 'COUPON',
    "image_url" VARCHAR(2048) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "cost_price" DECIMAL(12,2) NOT NULL,
    "margin_percentage" DECIMAL(8,4) NOT NULL,
    "is_sold" BOOLEAN NOT NULL DEFAULT false,
    "value_type" "ValueType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_products_unsold" ON "products" ("is_sold") WHERE "is_sold" = false;
