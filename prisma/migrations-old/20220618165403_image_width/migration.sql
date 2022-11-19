/*
  Warnings:

  - You are about to drop the column `size` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `width` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "size",
ADD COLUMN     "width" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "Size";
