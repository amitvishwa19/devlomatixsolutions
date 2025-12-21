-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
