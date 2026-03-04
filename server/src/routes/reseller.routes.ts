import { Router, RequestHandler } from "express";
import { ProductController } from "../modules/product/product.controller";
import { resellerAuth } from "../middleware/auth.middleware";
import { validate, validateParams, productIdParam } from "../middleware/validate.middleware";
import { resellerPurchaseSchema } from "../modules/product/product.schema";

export function resellerRoutes(
  controller: ProductController,
  purchaseLimiter: RequestHandler
): Router {
  const router = Router();

  router.use(resellerAuth);

  router.get("/products", controller.listAvailable);
  router.get("/products/:productId", validateParams(productIdParam), controller.getPublicById);
  router.post(
    "/products/:productId/purchase",
    validateParams(productIdParam),
    purchaseLimiter,
    validate(resellerPurchaseSchema),
    controller.purchaseAsReseller
  );

  return router;
}
