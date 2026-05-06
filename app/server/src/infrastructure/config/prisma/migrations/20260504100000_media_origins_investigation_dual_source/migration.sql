-- CreateEnum
CREATE TYPE "InboxSubjectMediaOrigin" AS ENUM ('DIRECTOR_INITIATED');

-- AlterEnum
ALTER TYPE "MediaOrigin" ADD VALUE 'DIRECTOR_INITIATED';

-- AlterTable
ALTER TABLE "InboxSubjectMedia" ADD COLUMN "origin" "InboxSubjectMediaOrigin" NOT NULL DEFAULT 'DIRECTOR_INITIATED';

-- AlterTable (investigation dual source: optional report + optional inbox subject, XOR enforced)
ALTER TABLE "investigations" DROP CONSTRAINT IF EXISTS "investigations_reportId_fkey";

ALTER TABLE "investigations" ALTER COLUMN "reportId" DROP NOT NULL;

ALTER TABLE "investigations" ADD COLUMN "inboxSubjectId" TEXT;

CREATE UNIQUE INDEX "investigations_inboxSubjectId_key" ON "investigations"("inboxSubjectId");

ALTER TABLE "investigations" ADD CONSTRAINT "investigations_inboxSubjectId_fkey" FOREIGN KEY ("inboxSubjectId") REFERENCES "inbox_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "investigations" ADD CONSTRAINT "investigations_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "investigations" ADD CONSTRAINT "investigations_report_xor_inbox_check" CHECK (
  ("reportId" IS NOT NULL AND "inboxSubjectId" IS NULL)
  OR
  ("reportId" IS NULL AND "inboxSubjectId" IS NOT NULL)
);
