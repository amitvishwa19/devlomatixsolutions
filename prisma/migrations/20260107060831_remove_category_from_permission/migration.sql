/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Permission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_categoryId_fkey";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "categoryId",
ADD COLUMN     "category" TEXT;
