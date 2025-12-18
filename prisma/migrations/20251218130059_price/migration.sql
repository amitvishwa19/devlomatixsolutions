/*
  Warnings:

  - The `price` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "price",
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "insuranceCover" SET DEFAULT 'not_covered';
