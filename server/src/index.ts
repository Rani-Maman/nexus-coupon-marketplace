import { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import { config } from "./config";

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  console.log("Connected to database");

  const app = createApp(prisma);

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed");
    });
    await prisma.$disconnect();
    console.log("Database connection closed");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
