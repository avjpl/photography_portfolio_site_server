-- CreateEnum
CREATE TYPE "Size" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ACTUAL');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "size" "Size" NOT NULL DEFAULT E'SMALL';
