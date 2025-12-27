-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_categoryId_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "registrationNo" TEXT;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
