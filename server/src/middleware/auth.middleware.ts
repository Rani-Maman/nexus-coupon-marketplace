import { Request, Response, NextFunction } from "express";
import { config } from "../config";

function checkBearer(getToken: () => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      res.status(401).json({
        error_code: "UNAUTHORIZED",
        message: "Missing or invalid authorization token",
      });
      return;
    }
    if (header.slice(7) !== getToken()) {
      res.status(401).json({
        error_code: "UNAUTHORIZED",
        message: "Invalid authorization token",
      });
      return;
    }
    next();
  };
}

export const resellerAuth = checkBearer(() => config.resellerApiToken);
export const adminAuth = checkBearer(() => config.adminApiToken);
