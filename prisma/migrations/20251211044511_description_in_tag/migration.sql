-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");
