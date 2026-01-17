/*
  Warnings:

  - You are about to drop the column `address` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `contact_email` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `contact_phone` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `customDomain` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `date_format` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyEmail` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPhone` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `facebookUrl` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `googleAnalyticsId` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalLicenseNo` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hospital_code` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hospital_name` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `instagramUrl` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceMode` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryContactEmail` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryContactPhone` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNo` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `themeMode` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `time_format` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUrl` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `websiteFavicon` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `websiteLogo` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `websiteName` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappNumber` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `appointments` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `billing` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `consultationOptions` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `departments` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `integrations` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `inventory` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `invoice` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `notifications` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `offline` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `online` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `patients` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `pharmacy` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `prescription` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `security` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `slotTime` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `staff` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `timing` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppSettings" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "contact_email",
DROP COLUMN "contact_phone",
DROP COLUMN "country",
DROP COLUMN "currency",
DROP COLUMN "customDomain",
DROP COLUMN "date_format",
DROP COLUMN "emergencyEmail",
DROP COLUMN "emergencyPhone",
DROP COLUMN "facebookUrl",
DROP COLUMN "googleAnalyticsId",
DROP COLUMN "hospitalLicenseNo",
DROP COLUMN "hospital_code",
DROP COLUMN "hospital_name",
DROP COLUMN "instagramUrl",
DROP COLUMN "keywords",
DROP COLUMN "language",
DROP COLUMN "linkedinUrl",
DROP COLUMN "logo",
DROP COLUMN "maintenanceMode",
DROP COLUMN "metaDescription",
DROP COLUMN "metaTitle",
DROP COLUMN "primaryColor",
DROP COLUMN "primaryContactEmail",
DROP COLUMN "primaryContactPhone",
DROP COLUMN "registrationNo",
DROP COLUMN "secondaryColor",
DROP COLUMN "state",
DROP COLUMN "themeMode",
DROP COLUMN "time_format",
DROP COLUMN "timezone",
DROP COLUMN "twitterUrl",
DROP COLUMN "website",
DROP COLUMN "websiteFavicon",
DROP COLUMN "websiteLogo",
DROP COLUMN "websiteName",
DROP COLUMN "whatsappNumber",
DROP COLUMN "zipCode",
ADD COLUMN     "appointments" JSONB,
ADD COLUMN     "billing" JSONB,
ADD COLUMN     "departments" JSONB,
ADD COLUMN     "general" JSONB,
ADD COLUMN     "hospitalInfo" JSONB,
ADD COLUMN     "integrations" JSONB,
ADD COLUMN     "inventory" JSONB,
ADD COLUMN     "invoice" JSONB,
ADD COLUMN     "locale" JSONB,
ADD COLUMN     "notifications" JSONB,
ADD COLUMN     "patients" JSONB,
ADD COLUMN     "pharmacy" JSONB,
ADD COLUMN     "prescription" JSONB,
ADD COLUMN     "security" JSONB,
ADD COLUMN     "services" JSONB,
ADD COLUMN     "social" JSONB,
ADD COLUMN     "staff" JSONB,
ADD COLUMN     "technical" JSONB,
ADD COLUMN     "ui" JSONB;

-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "appointments",
DROP COLUMN "billing",
DROP COLUMN "consultationOptions",
DROP COLUMN "departments",
DROP COLUMN "integrations",
DROP COLUMN "inventory",
DROP COLUMN "invoice",
DROP COLUMN "notifications",
DROP COLUMN "offline",
DROP COLUMN "online",
DROP COLUMN "patients",
DROP COLUMN "pharmacy",
DROP COLUMN "prescription",
DROP COLUMN "security",
DROP COLUMN "services",
DROP COLUMN "slotTime",
DROP COLUMN "staff",
DROP COLUMN "timing",
DROP COLUMN "type";
