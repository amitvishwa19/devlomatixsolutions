/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `value` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_title_key";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "value" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_value_key" ON "Permission"("value");
