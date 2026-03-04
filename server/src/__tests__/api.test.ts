import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createApp } from "../app";

const prisma = new PrismaClient();
const app = createApp(prisma);

const RESELLER_TOKEN = process.env.RESELLER_API_TOKEN || "reseller-dev-token";
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || "admin-dev-token";

let testProductId: string;

beforeAll(async () => {
  await prisma.$connect();

  // Clean up any previous test data
  await prisma.product.deleteMany({
    where: { name: { startsWith: "TEST_" } },
  });

  // Create a test product
  const product = await prisma.product.create({
    data: {
      name: "TEST_Amazon Gift Card",
      description: "Test coupon for automated tests",
      imageUrl: "https://example.com/test.jpg",
      costPrice: 80,
      marginPercentage: 25,
      valueType: "STRING",
      value: "TEST-CODE-1234",
    },
  });
  testProductId = product.id;
});

afterAll(async () => {
  await prisma.product.deleteMany({
    where: { name: { startsWith: "TEST_" } },
  });
  await prisma.$disconnect();
});

// ─── Health Check ────────────────────────────────────────────

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
  });
});

// ─── Reseller API ────────────────────────────────────────────

describe("Reseller API", () => {
  describe("Authentication", () => {
    it("rejects requests without token", async () => {
      const res = await request(app).get("/api/v1/products");
      expect(res.status).toBe(401);
      expect(res.body.error_code).toBe("UNAUTHORIZED");
    });

    it("rejects requests with invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .set("Authorization", "Bearer wrong-token");
      expect(res.status).toBe(401);
      expect(res.body.error_code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/v1/products", () => {
    it("returns available products", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .set("Authorization", `Bearer ${RESELLER_TOKEN}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("does NOT include cost_price or margin_percentage", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .set("Authorization", `Bearer ${RESELLER_TOKEN}`);
      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        const product = res.body[0];
        expect(product).not.toHaveProperty("cost_price");
        expect(product).not.toHaveProperty("margin_percentage");
        expect(product).toHaveProperty("price");
      }
    });
  });

  describe("GET /api/v1/products/:id", () => {
    it("returns a product by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .set("Authorization", `Bearer ${RESELLER_TOKEN}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testProductId);
      expect(res.body).not.toHaveProperty("cost_price");
    });

    it("returns 404 for non-existent product", async () => {
      const res = await request(app)
        .get("/api/v1/products/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${RESELLER_TOKEN}`);
      expect(res.status).toBe(404);
      expect(res.body.error_code).toBe("PRODUCT_NOT_FOUND");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app)
        .get("/api/v1/products/not-a-uuid")
        .set("Authorization", `Bearer ${RESELLER_TOKEN}`);
      expect(res.status).toBe(400);
      expect(res.body.error_code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/v1/products/:id/purchase", () => {
    it("rejects price below minimum", async () => {
      const res = await request(app)
        .post(`/api/v1/products/${testProductId}/purchase`)
        .set("Authorization", `Bearer ${RESELLER_TOKEN}`)
        .send({ reseller_price: 1 });
      expect(res.status).toBe(400);
      expect(res.body.error_code).toBe("RESELLER_PRICE_TOO_LOW");
    });
  });
});

// ─── Customer API ────────────────────────────────────────────

describe("Customer API", () => {
  describe("GET /api/v1/customer/products", () => {
    it("returns available products without auth", async () => {
      const res = await request(app).get("/api/v1/customer/products");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("does NOT include coupon value in list", async () => {
      const res = await request(app).get("/api/v1/customer/products");
      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        expect(res.body[0]).not.toHaveProperty("value");
        expect(res.body[0]).not.toHaveProperty("cost_price");
      }
    });
  });
});

// ─── Admin API ───────────────────────────────────────────────

describe("Admin API", () => {
  let createdId: string;

  it("creates a product", async () => {
    const res = await request(app)
      .post("/api/v1/admin/products")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({
        name: "TEST_New Coupon",
        description: "Created in test",
        image_url: "https://example.com/img.jpg",
        cost_price: 50,
        margin_percentage: 20,
        value_type: "STRING",
        value: "NEW-CODE-5678",
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("TEST_New Coupon");
    expect(res.body.minimum_sell_price).toBe(60); // 50 * 1.2
    createdId = res.body.id;
  });

  it("lists all products including sold", async () => {
    const res = await request(app)
      .get("/api/v1/admin/products")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Admin response includes all fields
    const product = res.body.find((p: any) => p.id === createdId);
    expect(product).toBeDefined();
    expect(product).toHaveProperty("cost_price");
    expect(product).toHaveProperty("margin_percentage");
    expect(product).toHaveProperty("value");
  });

  it("updates a product", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/products/${createdId}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({ name: "TEST_Updated Coupon" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("TEST_Updated Coupon");
  });

  it("deletes a product", async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/products/${createdId}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(204);
  });

  it("rejects create without auth", async () => {
    const res = await request(app)
      .post("/api/v1/admin/products")
      .send({ name: "Should fail" });
    expect(res.status).toBe(401);
  });
});

// ─── Purchase Flow (end-to-end) ──────────────────────────────

describe("Purchase Flow", () => {
  let purchaseProductId: string;

  beforeAll(async () => {
    const product = await prisma.product.create({
      data: {
        name: "TEST_Purchase Flow Coupon",
        description: "For purchase testing",
        imageUrl: "https://example.com/buy.jpg",
        costPrice: 100,
        marginPercentage: 10,
        valueType: "STRING",
        value: "SECRET-PURCHASE-CODE",
      },
    });
    purchaseProductId = product.id;
  });

  it("customer can purchase and receive coupon value", async () => {
    const res = await request(app).post(
      `/api/v1/customer/products/${purchaseProductId}/purchase`
    );
    expect(res.status).toBe(200);
    expect(res.body.product_id).toBe(purchaseProductId);
    expect(res.body.final_price).toBe(110); // 100 * 1.1
    expect(res.body.value_type).toBe("STRING");
    expect(res.body.value).toBe("SECRET-PURCHASE-CODE");
  });

  it("rejects double purchase (409)", async () => {
    const res = await request(app).post(
      `/api/v1/customer/products/${purchaseProductId}/purchase`
    );
    expect(res.status).toBe(409);
    expect(res.body.error_code).toBe("PRODUCT_ALREADY_SOLD");
  });

  it("sold product no longer appears in customer list", async () => {
    const res = await request(app).get("/api/v1/customer/products");
    const ids = res.body.map((p: any) => p.id);
    expect(ids).not.toContain(purchaseProductId);
  });
});
