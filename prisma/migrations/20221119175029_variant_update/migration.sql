/*
  Warnings:

  - Made the column `height` on table `Variant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Variant" ALTER COLUMN "height" SET NOT NULL;
