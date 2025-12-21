/*
  Warnings:

  - The `status` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';
