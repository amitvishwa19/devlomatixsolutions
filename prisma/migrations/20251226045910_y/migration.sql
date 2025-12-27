/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "color" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_title_key" ON "Permission"("title");
