/*
  Warnings:

  - You are about to drop the column `receivedACorrection` on the `publications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "publications" DROP COLUMN "receivedACorrection",
ADD COLUMN     "isCorrection" BOOLEAN NOT NULL DEFAULT false;
