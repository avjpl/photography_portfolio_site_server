-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "src" VARCHAR(255) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);
