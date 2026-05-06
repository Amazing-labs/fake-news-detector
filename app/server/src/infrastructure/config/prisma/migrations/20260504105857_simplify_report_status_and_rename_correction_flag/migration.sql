/*
  Warnings:

  - The values [PENDING_REVIEW,NEEDS_REVISION,PUBLISHED,UNVERIFIABLE] on the enum `ReportStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isCorrection` on the `publications` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportStatus_new" AS ENUM ('OPEN', 'IN_PROGRESS', 'ARCHIVED');
ALTER TABLE "public"."reports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reports" ALTER COLUMN "status" TYPE "ReportStatus_new" USING ("status"::text::"ReportStatus_new");
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";
DROP TYPE "public"."ReportStatus_old";
ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterTable
ALTER TABLE "publications" DROP COLUMN "isCorrection",
ADD COLUMN     "receivedACorrection" BOOLEAN NOT NULL DEFAULT false;
