/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `value` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Department_name_key";

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "value" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Department_value_key" ON "Department"("value");
