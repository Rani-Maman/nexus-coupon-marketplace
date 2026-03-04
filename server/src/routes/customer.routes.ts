import { Router, RequestHandler } from "express";
import { ProductController } from "../modules/product/product.controller";
import { validateParams, productIdParam } from "../middleware/validate.middleware";

export function customerRoutes(
  controller: ProductController,
  purchaseLimiter: RequestHandler
): Router {
  const router = Router();

  router.get("/products", controller.listAvailable);
  router.get("/products/:productId", validateParams(productIdParam), controller.getPublicById);
  router.post(
    "/products/:productId/purchase",
    validateParams(productIdParam),
    purchaseLimiter,
    controller.purchaseAsCustomer
  );

  return router;
}
