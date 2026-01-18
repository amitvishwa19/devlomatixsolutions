-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "consultation" JSONB,
ADD COLUMN     "privacy" TEXT,
ADD COLUMN     "terms" TEXT;
