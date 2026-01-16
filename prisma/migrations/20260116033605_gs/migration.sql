/*
  Warnings:

  - You are about to drop the column `hospitalName` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the `generalsetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "GeneralSettings" DROP COLUMN "hospitalName",
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "date_format" TEXT DEFAULT 'MM/DD/YYYY',
ADD COLUMN     "hospital_code" TEXT,
ADD COLUMN     "hospital_name" TEXT,
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "time_format" TEXT DEFAULT '12h',
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC',
ADD COLUMN     "website" TEXT;

-- DropTable
DROP TABLE "generalsetting";
