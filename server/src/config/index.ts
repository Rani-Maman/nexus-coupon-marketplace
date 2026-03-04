import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const result = dotenv.config({ path: envPath });

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL!,
  resellerApiToken: process.env.RESELLER_API_TOKEN!,
  adminApiToken: process.env.ADMIN_API_TOKEN!,
};
