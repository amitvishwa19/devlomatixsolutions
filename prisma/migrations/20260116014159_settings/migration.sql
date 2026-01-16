-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "appointments" JSONB,
ADD COLUMN     "billing" JSONB,
ADD COLUMN     "departments" JSONB,
ADD COLUMN     "integrations" JSONB,
ADD COLUMN     "inventory" JSONB,
ADD COLUMN     "invoice" JSONB,
ADD COLUMN     "notifications" JSONB,
ADD COLUMN     "patients" JSONB,
ADD COLUMN     "pharmacy" JSONB,
ADD COLUMN     "prescription" JSONB,
ADD COLUMN     "security" JSONB,
ADD COLUMN     "services" JSONB,
ADD COLUMN     "staff" JSONB;

-- CreateTable
CREATE TABLE "generalsetting" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hospital_name" TEXT,
    "hospital_code" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "language" TEXT DEFAULT 'en',
    "date_format" TEXT DEFAULT 'MM/DD/YYYY',
    "time_format" TEXT DEFAULT '12h',
    "currency" TEXT DEFAULT 'USD',
    "theme" TEXT DEFAULT 'system',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generalsetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generalsetting_user_id_key" ON "generalsetting"("user_id");
