const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sizes = [600, 640, 750, 828, 1080, 1200, 1920, 2048, 3840, 0];

  prisma.$transaction([
    prisma.posts.createMany(
      sizes.map((width) => {
        width;
      }),
    ),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
