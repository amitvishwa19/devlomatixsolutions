/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Invoice` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Invoice_patientId_idx";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "items" JSONB[];

-- DropEnum
DROP TYPE "InvoiceStatus";

-- CreateIndex
CREATE INDEX "Invoice_appointmentId_idx" ON "Invoice"("appointmentId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
