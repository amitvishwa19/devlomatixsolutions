/*
  Warnings:

  - You are about to drop the column `subCategoryId` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_subCategoryId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "subCategoryId";
