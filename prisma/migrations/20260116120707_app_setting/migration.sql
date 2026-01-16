/*
  Warnings:

  - You are about to drop the `GeneralSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "settingId" TEXT;

-- DropTable
DROP TABLE "GeneralSettings";

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" SERIAL NOT NULL,
    "websiteName" TEXT NOT NULL DEFAULT 'Hospital Management System',
    "websiteLogo" TEXT,
    "websiteFavicon" TEXT,
    "primaryContactEmail" TEXT NOT NULL DEFAULT 'info@hospital.com',
    "primaryContactPhone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "hospital_name" TEXT,
    "hospital_code" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "hospitalLicenseNo" TEXT,
    "registrationNo" TEXT,
    "website" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "language" TEXT DEFAULT 'en',
    "date_format" TEXT DEFAULT 'MM/DD/YYYY',
    "time_format" TEXT DEFAULT '12h',
    "currency" TEXT DEFAULT 'USD',
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "whatsappNumber" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1C1C1C',
    "secondaryColor" TEXT NOT NULL DEFAULT '#f8fafc',
    "themeMode" TEXT NOT NULL DEFAULT 'light',
    "emergencyPhone" TEXT,
    "emergencyEmail" TEXT,
    "metaTitle" TEXT NOT NULL DEFAULT 'Hospital Management System',
    "metaDescription" TEXT,
    "keywords" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "customDomain" TEXT,
    "googleAnalyticsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
