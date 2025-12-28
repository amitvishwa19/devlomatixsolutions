/*
  Warnings:

  - You are about to drop the column `value` on the `Permission` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Permission_value_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "value",
ADD COLUMN     "color" TEXT DEFAULT '#FFFF';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT,
ADD COLUMN     "lastActive" TIMESTAMP(3);
