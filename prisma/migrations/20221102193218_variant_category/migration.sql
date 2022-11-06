-- CreateEnum
CREATE TYPE "Catgegory" AS ENUM ('WILDLIFE', 'MACRO', 'PLACES', 'STUDIO');

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "category" "Catgegory";
