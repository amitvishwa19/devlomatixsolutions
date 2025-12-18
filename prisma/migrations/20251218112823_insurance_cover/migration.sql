/*
  Warnings:

  - You are about to drop the column `insurancePrice` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "insurancePrice",
ADD COLUMN     "insuranceCover" TEXT;
