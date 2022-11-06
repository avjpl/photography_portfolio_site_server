/*
  Warnings:

  - You are about to drop the `Exif` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exif" DROP CONSTRAINT "Exif_imageId_fkey";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "exif" JSONB;

-- DropTable
DROP TABLE "Exif";
