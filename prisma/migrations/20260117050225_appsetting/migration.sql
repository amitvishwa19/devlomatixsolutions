/*
  Warnings:

  - The primary key for the `AppSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[key]` on the table `AppSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `AppSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppSettings" DROP CONSTRAINT "AppSettings_pkey",
ADD COLUMN     "key" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AppSettings_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_key_key" ON "AppSettings"("key");
