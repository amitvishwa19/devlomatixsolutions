-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allergies" JSONB,
ADD COLUMN     "demographics" JSONB,
ADD COLUMN     "insurance" JSONB,
ADD COLUMN     "medicalHistory" JSONB,
ADD COLUMN     "medications" JSONB,
ADD COLUMN     "patient" JSONB,
ADD COLUMN     "visitHistory" JSONB,
ADD COLUMN     "vitals" JSONB;
