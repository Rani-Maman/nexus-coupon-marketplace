import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { ProductRepository } from "./modules/product/product.repository";
import { ProductService } from "./modules/product/product.service";
import { ProductController } from "./modules/product/product.controller";
import { resellerRoutes } from "./routes/reseller.routes";
import { customerRoutes } from "./routes/customer.routes";
import { adminRoutes } from "./routes/admin.routes";
import { errorHandler } from "./middleware/error-handler.middleware";
import { requestLogger } from "./middleware/logger.middleware";

export function createApp(prisma: PrismaClient) {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(
        ","
      ),
    })
  );
  app.use(express.json({ limit: "10kb" }));

  // Logging
  app.use(requestLogger);

  // Rate limiting on purchase endpoints
  const purchaseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
      error_code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const repository = new ProductRepository(prisma);
  const service = new ProductService(repository);
  const controller = new ProductController(service);

  // More specific routes first, then the catch-all reseller routes
  app.use("/api/v1/admin", adminRoutes(controller));
  app.use("/api/v1/customer", customerRoutes(controller, purchaseLimiter));
  app.use("/api/v1", resellerRoutes(controller, purchaseLimiter));

  app.use(errorHandler);

  return app;
}
