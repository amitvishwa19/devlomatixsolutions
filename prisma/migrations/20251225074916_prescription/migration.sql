/*
  Warnings:

  - You are about to drop the column `description` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `prescription` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Prescription` table. All the data in the column will be lost.
  - Added the required column `sku` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Category_slug_key";

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "description",
DROP COLUMN "prescription",
DROP COLUMN "title",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "items" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "sku" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft',
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
