/*
  Warnings:

  - A unique constraint covering the columns `[src]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Asset_filename_key";

-- CreateIndex
CREATE UNIQUE INDEX "Asset_src_key" ON "Asset"("src");
