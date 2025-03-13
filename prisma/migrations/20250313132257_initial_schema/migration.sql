/*
  Warnings:

  - You are about to drop the column `content` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Report` table. All the data in the column will be lost.
  - Added the required column `url` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "content",
DROP COLUMN "title",
ADD COLUMN     "mobileScore" INTEGER,
ADD COLUMN     "overallScore" INTEGER,
ADD COLUMN     "pageSpeedScore" INTEGER,
ADD COLUMN     "recommendations" TEXT,
ADD COLUMN     "seoDetails" JSONB,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Competitor" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorReport" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "competitorId" INTEGER NOT NULL,
    "competitorScore" INTEGER,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorReport_reportId_competitorId_key" ON "CompetitorReport"("reportId", "competitorId");

-- AddForeignKey
ALTER TABLE "CompetitorReport" ADD CONSTRAINT "CompetitorReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorReport" ADD CONSTRAINT "CompetitorReport_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
