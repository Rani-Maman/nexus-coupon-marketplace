import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import {
  toPublicProductDto,
  toPurchaseResponseDto,
  toAdminProductDto,
} from "./product.dto";

type IdParams = { productId: string };

export class ProductController {
  constructor(private service: ProductService) {}

  listAvailable = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const products = await this.service.listAvailable();
      res.json(products.map(toPublicProductDto));
    } catch (err) {
      next(err);
    }
  };

  getPublicById = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const product = await this.service.getById(req.params.productId as string);
      res.json(toPublicProductDto(product));
    } catch (err) {
      next(err);
    }
  };

  purchaseAsReseller = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { product, finalPrice } = await this.service.purchaseAsReseller(
        req.params.productId as string,
        req.body.reseller_price
      );
      res.json(toPurchaseResponseDto(product, finalPrice));
    } catch (err) {
      next(err);
    }
  };

  purchaseAsCustomer = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { product, finalPrice } = await this.service.purchaseAsCustomer(
        req.params.productId as string
      );
      res.json(toPurchaseResponseDto(product, finalPrice));
    } catch (err) {
      next(err);
    }
  };

  adminList = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.service.listAll();
      res.json(products.map(toAdminProductDto));
    } catch (err) {
      next(err);
    }
  };

  adminGetById = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const product = await this.service.getById(req.params.productId as string);
      res.json(toAdminProductDto(product));
    } catch (err) {
      next(err);
    }
  };

  adminCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.create(req.body);
      res.status(201).json(toAdminProductDto(product));
    } catch (err) {
      next(err);
    }
  };

  adminUpdate = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const product = await this.service.update(
        req.params.productId as string,
        req.body
      );
      res.json(toAdminProductDto(product));
    } catch (err) {
      next(err);
    }
  };

  adminDelete = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.delete(req.params.productId as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
