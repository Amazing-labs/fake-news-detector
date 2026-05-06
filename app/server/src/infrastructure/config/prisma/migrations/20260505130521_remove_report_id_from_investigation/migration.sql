/*
  Warnings:

  - You are about to drop the column `reportId` on the `investigations` table. All the data in the column will be lost.
  - Made the column `inboxSubjectId` on table `investigations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "investigations" DROP CONSTRAINT "investigations_reportId_fkey";

-- DropIndex
DROP INDEX "investigations_reportId_key";

-- AlterTable
ALTER TABLE "investigations" DROP COLUMN "reportId",
ALTER COLUMN "inboxSubjectId" SET NOT NULL;
