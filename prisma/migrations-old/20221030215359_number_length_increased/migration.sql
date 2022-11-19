/*
  Warnings:

  - You are about to alter the column `contactNumber` on the `Contact` table. The data in that column could be lost. The data in that column will be cast from `VarChar(15)` to `VarChar(13)`.

*/
-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "contactNumber" SET DATA TYPE VARCHAR(13);
