import { Router } from "express";
import { ProductController } from "../modules/product/product.controller";
import { adminAuth } from "../middleware/auth.middleware";
import { validate, validateParams, productIdParam } from "../middleware/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../modules/product/product.schema";

export function adminRoutes(controller: ProductController): Router {
  const router = Router();

  router.use(adminAuth);

  router.get("/products", controller.adminList);
  router.get("/products/:productId", validateParams(productIdParam), controller.adminGetById);
  router.post(
    "/products",
    validate(createProductSchema),
    controller.adminCreate
  );
  router.put(
    "/products/:productId",
    validateParams(productIdParam),
    validate(updateProductSchema),
    controller.adminUpdate
  );
  router.delete("/products/:productId", validateParams(productIdParam), controller.adminDelete);

  return router;
}
