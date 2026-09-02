/*
  Warnings:

  - Added the required column `collegeId` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ItemStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "College" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "collegeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "College_latitude_longitude_idx" ON "College"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Item_collegeId_idx" ON "Item"("collegeId");

-- CreateIndex
CREATE INDEX "Item_collegeId_status_idx" ON "Item"("collegeId", "status");

-- CreateIndex
CREATE INDEX "Item_collegeId_categoryId_status_idx" ON "Item"("collegeId", "categoryId", "status");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
