/*
  Warnings:

  - Added the required column `orientation` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "orientation" INTEGER NOT NULL;
