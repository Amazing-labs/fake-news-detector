-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "inbox_subjects" ADD COLUMN "reportId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "inbox_subjects_reportId_key" ON "inbox_subjects"("reportId");

-- AddForeignKey
ALTER TABLE "inbox_subjects" ADD CONSTRAINT "inbox_subjects_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
