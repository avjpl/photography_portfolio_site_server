/*
  Warnings:

  - A unique constraint covering the columns `[filename]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Asset_filename_key" ON "Asset"("filename");
