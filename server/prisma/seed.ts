import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  await prisma.product.createMany({
    data: [
      {
        name: "Amazon $100 Gift Card",
        description: "Redeemable on Amazon.com for any purchase",
        imageUrl: "https://picsum.photos/seed/amazon/400/300",
        costPrice: 80,
        marginPercentage: 25,
        valueType: "STRING",
        value: "AMZN-GIFT-2024-ABCD",
      },
      {
        name: "Netflix 3-Month Subscription",
        description: "3 months of Netflix Standard plan",
        imageUrl: "https://picsum.photos/seed/netflix/400/300",
        costPrice: 30,
        marginPercentage: 20,
        valueType: "STRING",
        value: "NFLX-3MO-XYZ-1234",
      },
      {
        name: "Spotify Premium 6 Months",
        description: "6 months of Spotify Premium individual plan",
        imageUrl: "https://picsum.photos/seed/spotify/400/300",
        costPrice: 45,
        marginPercentage: 15,
        valueType: "STRING",
        value: "SPOT-6MO-PREM-5678",
      },
      {
        name: "Steam $50 Wallet Code",
        description: "Add $50 to your Steam wallet",
        imageUrl: "https://picsum.photos/seed/steam/400/300",
        costPrice: 40,
        marginPercentage: 25,
        valueType: "STRING",
        value: "STEAM-50-WALLET-9012",
      },
    ],
  });

  console.log("Seeded 4 sample coupons.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
